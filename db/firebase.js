const admin = require('firebase-admin');
const serviceAccount = require('./ruhaverse-firebase-demo-firebase-adminsdk-fbsvc-d1a33b044b.json')

admin.initializeApp({
    credential:admin.credential.cert(serviceAccount)
})

const firestore = admin.firestore();

module.exports = { firestore };