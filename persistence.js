const {Pool} = require('pg');
const pgPool = new Pool({
    user:'postgres',
    host:'localhost',
    database:'mydb',
    password:'forget_28',
    port:5432
})

const mongoose = require('mongoose')
mongoose.connect('mongodb+srv://info:Haa1x4iLOYk17vxc@ruhaversedemo1.myv41fm.mongodb.net/',{
    useNewUrlParser: true,
    userUnifiedTopology: true
});

const admin = require('firebase-admin');
const serviceAccount = require('./ruhaverse-firebase-demo-firebase-adminsdk-fbsvc-d1a33b044b.json')

admin.initializeApp({
    credential:admin.credential.cert(serviceAccount)
})

const firestore = admin.firestore();

module.exports = {
    pgPool,
    mongoose,
    firestore
};