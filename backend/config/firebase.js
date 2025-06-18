const admin = require('firebase-admin');
const path = require('path');

// Load service account
const serviceAccount = require(path.join(__dirname, '..', 'serviceAccountKey.json'));

// Initialize Firebase Admin SDK with explicit config
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'auraxkhidmat-f4c73.firebasestorage.app', // Your provided bucket name
  projectId: 'auraxkhidmat-f4c73'
});

// Firestore instance
const db = admin.firestore();
// Storage instance
const storage = admin.storage();
// Bucket instance
const bucket = storage.bucket('auraxkhidmat-f4c73.firebasestorage.app');

module.exports = {
  admin,
  db,
  storage,
  bucket
}; 