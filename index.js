const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { pgPool, mongoose, firestore } = require('./persistence');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // each IP limited to 100 requests per window
    message: 'Çok fazla istek yaptınız, lütfen sonra tekrar deneyin.'
});
app.use(limiter);

// Basic logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - ${req.ip}`);
    next();
});

// Routes
app.get('/', (req, res) => {
    res.json({
        message: 'Multi-Database API Server',
        databases: ['PostgreSQL', 'MongoDB', 'Firebase Firestore']
    });
});

// Greeting endpoint - responds to "merhaba" (hello in Turkish)
app.get('/merhaba', (req, res) => {
    res.json({
        message: 'Merhaba! ShareUpTime\'a hoş geldiniz! 👋',
        english: 'Hello! Welcome to ShareUpTime! 👋',
        platform: 'ShareUpTime - Next-Generation Social Media Platform',
        features: [
            'Mikroservis mimarisi / Microservices architecture',
            'Gerçek zamanlı bildirimler / Real-time notifications', 
            'Sosyal medya özellikleri / Social media features',
            'Çoklu dil desteği / Multi-language support'
        ],
        status: 'online',
        timestamp: new Date().toISOString()
    });
});

// Alternative greeting endpoints
app.get('/hello', (req, res) => {
    res.redirect('/merhaba');
});

app.get('/greeting', (req, res) => {
    res.redirect('/merhaba');
});

// PostgreSQL test route
app.get('/postgres/test', async (req, res, next) => {
    try {
        const result = await pgPool.query('SELECT NOW()');
        res.json({ success: true, timestamp: result.rows[0].now });
    } catch (error) {
        next(error);
    }
});

// MongoDB test route
app.get('/mongo/test', async (req, res, next) => {
    try {
        const state = mongoose.connection.readyState;
        res.json({ success: true, connectionState: state });
    } catch (error) {
        next(error);
    }
});

// Firebase test route
app.get('/firebase/test', async (req, res, next) => {
    try {
        await firestore.collection('test').doc('connection').get();
        res.json({ success: true, connected: true });
    } catch (error) {
        next(error);
    }
});

// 404 handler
app.use((req, res, next) => {
    res.status(404).json({ error: 'Böyle bir endpoint yok.' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Beklenmeyen hata:', err);
    res.status(500).json({ error: 'Sunucu hatası, lütfen daha sonra tekrar deneyin.' });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;
