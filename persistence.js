require('dotenv').config();
const { Pool } = require('pg');
const mongoose = require('mongoose');
const admin = require('firebase-admin');
const path = require('path');

// ----- PostgreSQL -----
const pgPool = new Pool({
  connectionString: process.env.POSTGRES_URI,
});

// ----- MongoDB Atlas -----
const mongoUri = process.env.MONGO_URI || 'mongodb+srv://shareuptime:shareuptime@shareuptime.mongodb.net/shareuptime?retryWrites=true&w=majority&appName=shareuptime';

mongoose.connect(mongoUri)
.then(() => console.log('✅ MongoDB Atlas connected to shareuptime cluster'))
.catch(err => console.error('❌ MongoDB Atlas connection error:', err));

// ----- Firebase -----
if (!admin.apps.length) {
  const serviceAccount = require(path.join(__dirname, 'firebase-service-account.json'));

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID,
  });
}
const firestore = admin.firestore();

// ----- Export connections -----
module.exports = { pgPool, mongoose, firestore };
