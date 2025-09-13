FROM node:18-alpine

WORKDIR /app

# Install system dependencies for image/video processing
RUN apk add --no-cache \
    ffmpeg \
    vips-dev \
    build-base \
    python3 \
    make \
    g++

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --only=production


# Copy source code
COPY . .

# Create logs and temp directories
RUN mkdir -p logs /tmp

# Expose port
EXPOSE 3005

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3005/health || exit 1

# Start the application
CMD ["npm", "start"]
