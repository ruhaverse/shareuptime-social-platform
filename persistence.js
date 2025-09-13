// persistence.js

const { Pool } = require('pg');
const mongoose = require('mongoose');
const admin = require('firebase-admin');

// --- PostgreSQL ---
const pgPool = new Pool({
  user: 'postgres',         // same as in pgAdmin
  host: 'localhost',
  database: 'shareuptime',  // 👈 this is your project database
  password: 'Fy@260177', // same password you typed in pgAdmin
  port: 5433,               // 👈 IMPORTANT: not 5432
});

pgPool.connect()
  .then(client => {
    console.log('✅ Connected to PostgreSQL (shareuptime)');
    client.release();
  })
  .catch(err => console.error('❌ PostgreSQL connection error:', err.stack));


// --- MongoDB ---
mongoose.connect('mongodb://localhost:27017/shareuptime', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB (shareuptime)'))
.catch(err => console.error('❌ MongoDB connection error:', err));


// --- Firebase ---
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}
const firestore = admin.firestore();

module.exports = {
  pgPool,
  mongoose,
  firestore,
};
