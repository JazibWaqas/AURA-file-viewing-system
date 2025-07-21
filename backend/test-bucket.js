require('dotenv').config();
const {Storage} = require('@google-cloud/storage');
const storage = new Storage({
  projectId: 'auraxkhidmat-f4c73',
  keyFilename: './serviceAccountKey.json'
});
const bucketName = process.env.FIREBASE_STORAGE_BUCKET;
console.log('Testing bucket:', JSON.stringify(bucketName));
storage.bucket(bucketName).exists().then(data => {
  console.log(`Bucket exists: ${data[0]}`);
}).catch(err => {
  console.error('Error:', err);
}); 