/**
 * Firebase Common Instance
 */
const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue, Filter } = require('firebase-admin/firestore');
const serviceAccount = require('../config/hdo-evnu-firebase-adminsdk-xn2ta-7e57b50f92.json'); // Path to your service account key file

initializeApp({
    credential: cert(serviceAccount)
});

const db = getFirestore();

module.exports = db;