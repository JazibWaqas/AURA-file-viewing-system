const admin = require('firebase-admin');
const path = require('path');

console.log('VERCEL ENV:', process.env.VERCEL);

// Force local file usage unless running on Vercel
let serviceAccount;
if (process.env.VERCEL === '1' || process.env.VERCEL === 'true') {
  serviceAccount = {
    type: process.env.FIREBASE_TYPE,
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: process.env.FIREBASE_AUTH_URI,
    token_uri: process.env.FIREBASE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
    universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN,
  };
} else {
  const resolvedPath = require('path').resolve(process.env.FIREBASE_KEY_PATH);
  console.log('Resolved FIREBASE_KEY_PATH:', resolvedPath); // Debug log
  serviceAccount = require(resolvedPath);
}

console.log('BUCKET ENV:', JSON.stringify(process.env.FIREBASE_STORAGE_BUCKET));
console.log('PROJECT ID:', serviceAccount.project_id);
console.log('CWD:', process.cwd());

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  projectId: serviceAccount.project_id,
});

const db = admin.firestore();
const storage = admin.storage();
const bucket = storage.bucket(process.env.FIREBASE_STORAGE_BUCKET);

module.exports = {
  admin,
  db,
  storage,
  bucket
}; 