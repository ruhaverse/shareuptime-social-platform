const express = require('express');
const multer = require('multer');
const { Client } = require('minio');
const { Pool } = require('pg');
const sharp = require('sharp');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');
const Joi = require('joi');
const winston = require('winston');
const { v4: uuidv4 } = require('uuid');
const mime = require('mime-types');
const path = require('path');
const fs = require('fs').promises;
require('dotenv').config();

const app = express();
const PORT = process.env.MEDIA_SERVICE_PORT || 3005;

// Set FFmpeg path
ffmpeg.setFfmpegPath(ffmpegStatic);

// Logger setup
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/media.log' })
  ]
});

// Database connection
const pgPool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: process.env.POSTGRES_PORT || 5432,
  database: process.env.POSTGRES_DB || 'shareuptime',
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'password'
});

// MinIO client setup
const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT) || 9000,
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin'
});

const BUCKET_NAME = process.env.MINIO_BUCKET_NAME || 'shareuptime-media';

// Ensure bucket exists
async function ensureBucket() {
  try {
    const exists = await minioClient.bucketExists(BUCKET_NAME);
    if (!exists) {
      await minioClient.makeBucket(BUCKET_NAME, 'us-east-1');
      logger.info(`Bucket ${BUCKET_NAME} created`);
    }
  } catch (error) {
    logger.error('Error ensuring bucket exists:', error);
  }
}

ensureBucket();

// Multer configuration for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
    files: 10 // Maximum 10 files per request
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/mpeg', 'video/quicktime', 'video/webm'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type'), false);
    }
  }
});

// Middleware
app.use(express.json());

// Helper functions
const generateFileName = (originalName, userId) => {
  const ext = path.extname(originalName);
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2);
  return `${userId}/${timestamp}_${random}${ext}`;
};

const isImage = (mimetype) => mimetype.startsWith('image/');
const isVideo = (mimetype) => mimetype.startsWith('video/');

// Image processing functions
const processImage = async (buffer, mimetype) => {
  const processed = {};
  
  try {
    // Original
    processed.original = buffer;
    
    // Thumbnail (300x300)
    processed.thumbnail = await sharp(buffer)
      .resize(300, 300, { fit: 'cover' })
      .jpeg({ quality: 80 })
      .toBuffer();
    
    // Medium (800x800)
    processed.medium = await sharp(buffer)
      .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toBuffer();
    
    // Get image metadata
    const metadata = await sharp(buffer).metadata();
    processed.metadata = {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format
    };
    
  } catch (error) {
    logger.error('Image processing error:', error);
    throw error;
  }
  
  return processed;
};

// Video processing functions
const processVideo = async (inputPath, outputDir) => {
  return new Promise((resolve, reject) => {
    const thumbnailPath = path.join(outputDir, 'thumbnail.jpg');
    
    ffmpeg(inputPath)
      .screenshots({
        timestamps: ['00:00:01'],
        filename: 'thumbnail.jpg',
        folder: outputDir,
        size: '300x300'
      })
      .on('end', async () => {
        try {
          // Get video metadata
          ffmpeg.ffprobe(inputPath, (err, metadata) => {
            if (err) {
              reject(err);
              return;
            }
            
            const videoStream = metadata.streams.find(s => s.codec_type === 'video');
            resolve({
              thumbnail: thumbnailPath,
              metadata: {
                duration: metadata.format.duration,
                width: videoStream?.width,
                height: videoStream?.height,
                format: metadata.format.format_name
              }
            });
          });
        } catch (error) {
          reject(error);
        }
      })
      .on('error', reject);
  });
};

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'media-service' });
});

// Upload media files
app.post('/upload', upload.array('files', 10), async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) {
      return res.status(401).json({ error: 'User ID required' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const uploadedFiles = [];

    for (const file of req.files) {
      const fileId = uuidv4();
      const fileName = generateFileName(file.originalname, userId);
      const isImg = isImage(file.mimetype);
      const isVid = isVideo(file.mimetype);

      try {
        let processedData = {};
        let metadata = {};

        if (isImg) {
          // Process image
          processedData = await processImage(file.buffer, file.mimetype);
          metadata = processedData.metadata;

          // Upload original and processed versions
          await minioClient.putObject(BUCKET_NAME, fileName, processedData.original);
          await minioClient.putObject(BUCKET_NAME, `thumb_${fileName}`, processedData.thumbnail);
          await minioClient.putObject(BUCKET_NAME, `med_${fileName}`, processedData.medium);

        } else if (isVid) {
          // For videos, upload original first
          await minioClient.putObject(BUCKET_NAME, fileName, file.buffer);

          // Create temporary file for video processing
          const tempDir = `/tmp/${fileId}`;
          const tempInputPath = path.join(tempDir, 'input' + path.extname(file.originalname));
          
          await fs.mkdir(tempDir, { recursive: true });
          await fs.writeFile(tempInputPath, file.buffer);

          try {
            // Process video (generate thumbnail)
            const videoData = await processVideo(tempInputPath, tempDir);
            metadata = videoData.metadata;

            // Upload thumbnail
            const thumbnailBuffer = await fs.readFile(videoData.thumbnail);
            await minioClient.putObject(BUCKET_NAME, `thumb_${fileName}.jpg`, thumbnailBuffer);

          } finally {
            // Cleanup temp files
            await fs.rm(tempDir, { recursive: true, force: true });
          }
        } else {
          // For other file types, just upload as-is
          await minioClient.putObject(BUCKET_NAME, fileName, file.buffer);
        }

        // Save file metadata to database
        const result = await pgPool.query(
          `INSERT INTO media_files 
           (id, user_id, filename, original_name, mime_type, file_size, width, height, duration, storage_path, is_processed, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
           RETURNING *`,
          [
            fileId,
            userId,
            fileName,
            file.originalname,
            file.mimetype,
            file.size,
            metadata.width || null,
            metadata.height || null,
            metadata.duration || null,
            fileName,
            true
          ]
        );

        const fileRecord = result.rows[0];

        uploadedFiles.push({
          id: fileRecord.id,
          filename: fileRecord.filename,
          originalName: fileRecord.original_name,
          mimeType: fileRecord.mime_type,
          fileSize: fileRecord.file_size,
          width: fileRecord.width,
          height: fileRecord.height,
          duration: fileRecord.duration,
          url: `/media/${fileRecord.id}`,
          thumbnailUrl: isImg || isVid ? `/media/${fileRecord.id}/thumbnail` : null,
          createdAt: fileRecord.created_at
        });

        logger.info('File uploaded successfully', {
          fileId,
          userId,
          fileName: file.originalname,
          size: file.size
        });

      } catch (error) {
        logger.error('Error processing file:', error);
        // Continue with other files even if one fails
      }
    }

    res.status(201).json({
      message: 'Files uploaded successfully',
      files: uploadedFiles
    });

  } catch (error) {
    logger.error('Upload error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get media file
app.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { size = 'original' } = req.query; // original, medium, thumbnail

    // Get file info from database
    const result = await pgPool.query(
      'SELECT * FROM media_files WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'File not found' });
    }

    const file = result.rows[0];
    let objectName = file.storage_path;

    // Determine which version to serve
    if (size === 'thumbnail' && (isImage(file.mime_type) || isVideo(file.mime_type))) {
      objectName = isVideo(file.mime_type) ? 
        `thumb_${file.storage_path}.jpg` : 
        `thumb_${file.storage_path}`;
    } else if (size === 'medium' && isImage(file.mime_type)) {
      objectName = `med_${file.storage_path}`;
    }

    // Get file from MinIO
    const stream = await minioClient.getObject(BUCKET_NAME, objectName);
    
    // Set appropriate headers
    res.setHeader('Content-Type', file.mime_type);
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year cache
    
    stream.pipe(res);

  } catch (error) {
    logger.error('Get media error:', error);
    if (error.code === 'NoSuchKey') {
      res.status(404).json({ error: 'File not found' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// Get media file info
app.get('/:id/info', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pgPool.query(
      'SELECT * FROM media_files WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'File not found' });
    }

    const file = result.rows[0];

    res.json({
      id: file.id,
      filename: file.filename,
      originalName: file.original_name,
      mimeType: file.mime_type,
      fileSize: file.file_size,
      width: file.width,
      height: file.height,
      duration: file.duration,
      url: `/media/${file.id}`,
      thumbnailUrl: (isImage(file.mime_type) || isVideo(file.mime_type)) ? 
        `/media/${file.id}?size=thumbnail` : null,
      mediumUrl: isImage(file.mime_type) ? 
        `/media/${file.id}?size=medium` : null,
      isProcessed: file.is_processed,
      createdAt: file.created_at
    });

  } catch (error) {
    logger.error('Get media info error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete media file
app.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.headers['x-user-id'];

    if (!userId) {
      return res.status(401).json({ error: 'User ID required' });
    }

    // Get file info
    const result = await pgPool.query(
      'SELECT * FROM media_files WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'File not found or not authorized' });
    }

    const file = result.rows[0];

    // Delete from MinIO
    try {
      await minioClient.removeObject(BUCKET_NAME, file.storage_path);
      
      // Delete processed versions if they exist
      if (isImage(file.mime_type)) {
        await minioClient.removeObject(BUCKET_NAME, `thumb_${file.storage_path}`);
        await minioClient.removeObject(BUCKET_NAME, `med_${file.storage_path}`);
      } else if (isVideo(file.mime_type)) {
        await minioClient.removeObject(BUCKET_NAME, `thumb_${file.storage_path}.jpg`);
      }
    } catch (error) {
      logger.warn('Error deleting from MinIO:', error);
    }

    // Delete from database
    await pgPool.query('DELETE FROM media_files WHERE id = $1', [id]);

    logger.info('File deleted successfully', { fileId: id, userId });

    res.json({ message: 'File deleted successfully' });

  } catch (error) {
    logger.error('Delete media error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's media files
app.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20, type } = req.query;

    const offset = (page - 1) * limit;
    let whereClause = 'WHERE user_id = $1';
    let params = [userId];

    if (type) {
      if (type === 'image') {
        whereClause += ' AND mime_type LIKE $2';
        params.push('image/%');
      } else if (type === 'video') {
        whereClause += ' AND mime_type LIKE $2';
        params.push('video/%');
      }
    }

    const result = await pgPool.query(
      `SELECT * FROM media_files ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    );

    const countResult = await pgPool.query(
      `SELECT COUNT(*) as total FROM media_files ${whereClause}`,
      params
    );

    const total = parseInt(countResult.rows[0].total);

    const files = result.rows.map(file => ({
      id: file.id,
      filename: file.filename,
      originalName: file.original_name,
      mimeType: file.mime_type,
      fileSize: file.file_size,
      width: file.width,
      height: file.height,
      duration: file.duration,
      url: `/media/${file.id}`,
      thumbnailUrl: (isImage(file.mime_type) || isVideo(file.mime_type)) ? 
        `/media/${file.id}?size=thumbnail` : null,
      createdAt: file.created_at
    }));

    res.json({
      files,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    logger.error('Get user media error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Error handling
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large' });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ error: 'Too many files' });
    }
  }
  
  logger.error('Media service error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Shutting down media service...');
  await pgPool.end();
  process.exit(0);
});

app.listen(PORT, () => {
  logger.info(`Media service running on port ${PORT}`);
});
