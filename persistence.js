require('dotenv').config();
const { Pool } = require('pg');
const mongoose = require('mongoose');
const admin = require('firebase-admin');
const path = require('path');

// ----- PostgreSQL -----
const pgPool = new Pool({
  connectionString: process.env.POSTGRES_URI,
});

// Test PostgreSQL connection
pgPool.connect()
  .then(client => {
    console.log('✅ PostgreSQL connected');
    client.release();
  })
  .catch(err => {
    console.log('⚠️ PostgreSQL connection failed:', err.message);
  });

// ----- MongoDB Atlas -----
const mongoUri = process.env.MONGO_URI || 'mongodb+srv://shareuptime:shareuptime@shareuptime.mongodb.net/shareuptime?retryWrites=true&w=majority&appName=shareuptime';

mongoose.connect(mongoUri)
.then(() => console.log('✅ MongoDB Atlas connected to shareuptime cluster'))
.catch(err => console.log('⚠️ MongoDB Atlas connection failed:', err.message));

// ----- Firebase -----
let firestore;
try {
  if (!admin.apps.length && process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PROJECT_ID !== 'your-firebase-project-id') {
    const serviceAccount = require(path.join(__dirname, 'firebase-service-account.json'));

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID,
    });
    firestore = admin.firestore();
    console.log('✅ Firebase connected');
  } else {
    // Mock firestore for development/testing
    firestore = {
      collection: () => ({
        doc: () => ({
          get: () => Promise.resolve({ exists: true, data: () => ({}) })
        })
      })
    };
    console.log('⚠️ Using mock Firebase for development');
  }
} catch (error) {
  console.log('⚠️ Firebase connection failed, using mock:', error.message);
  // Mock firestore for development/testing
  firestore = {
    collection: () => ({
      doc: () => ({
        get: () => Promise.resolve({ exists: true, data: () => ({}) })
      })
    })
  };
}

// ----- Export connections -----
module.exports = { pgPool, mongoose, firestore };
