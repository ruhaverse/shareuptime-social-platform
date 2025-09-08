const express = require('express');
const { pgPool, mongoose, firestore } = require('./persistence');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
    res.json({ 
        message: 'Multi-Database API Server', 
        databases: ['PostgreSQL', 'MongoDB', 'Firebase Firestore']
    });
});

// PostgreSQL test route
app.get('/postgres/test', async (req, res) => {
    try {
        const result = await pgPool.query('SELECT NOW()');
        res.json({ success: true, timestamp: result.rows[0].now });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// MongoDB test route
app.get('/mongo/test', async (req, res) => {
    try {
        const state = mongoose.connection.readyState;
        res.json({ success: true, connectionState: state });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Firebase test route
app.get('/firebase/test', async (req, res) => {
    try {
        const doc = await firestore.collection('test').doc('connection').get();
        res.json({ success: true, connected: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});