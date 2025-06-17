const admin = require('firebase-admin');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

// Initialize Firebase Admin SDK
let firebaseApp;

const initializeFirebase = () => {
    try {
        // Check if Firebase is already initialized
        if (admin.apps.length > 0) {
            firebaseApp = admin.apps[0];
            console.log('Firebase already initialized');
            return firebaseApp;
        }

        // Try to load service account key
        let serviceAccount;
        try {
            const serviceAccountPath = path.join(__dirname, '..', 'serviceAccountKey.json');
            serviceAccount = require(serviceAccountPath);
            console.log('Service account key loaded successfully');
        } catch (error) {
            console.log('Service account key not found, using application default credentials');
            serviceAccount = null;
        }

        // Get the correct bucket name from environment or service account
        let bucketName;
        if (process.env.FIREBASE_STORAGE_BUCKET) {
            bucketName = process.env.FIREBASE_STORAGE_BUCKET;
        } else if (serviceAccount) {
            bucketName = `${serviceAccount.project_id}.appspot.com`;
        } else {
            bucketName = 'auraxkhidmat-f4c73.appspot.com'; // Default fallback
        }

        console.log('Using Firebase Storage bucket:', bucketName);

        // Initialize Firebase Admin SDK
        const config = {
            storageBucket: bucketName
        };

        if (serviceAccount) {
            config.credential = admin.credential.cert(serviceAccount);
        } else {
            config.credential = admin.credential.applicationDefault();
        }

        firebaseApp = admin.initializeApp(config);

        // Test if the bucket exists
        const storage = admin.storage();
        const bucket = storage.bucket(bucketName);
        
        // Try to access the bucket to see if it exists
        bucket.getFiles({ maxResults: 1 })
            .then(() => {
                console.log('✅ Firebase Storage bucket exists and is accessible');
            })
            .catch((error) => {
                if (error.code === 'ENOTFOUND') {
                    console.error(`❌ Firebase Storage bucket '${bucketName}' does not exist!`);
                    console.error('Please create the bucket in Firebase Console:');
                    console.error('1. Go to https://console.firebase.google.com/');
                    console.error('2. Select your project');
                    console.error('3. Go to Storage section');
                    console.error('4. Click "Get started" to create the bucket');
                    console.error('5. Or set FIREBASE_STORAGE_BUCKET environment variable to an existing bucket name');
                } else {
                    console.error('❌ Error accessing Firebase Storage bucket:', error.message);
                }
            });

        console.log('Firebase initialized successfully');
        return firebaseApp;
    } catch (error) {
        console.error('Error initializing Firebase:', error);
        throw error;
    }
};

// Get Firestore database instance
const getFirestore = () => {
    if (!firebaseApp) {
        initializeFirebase();
    }
    return admin.firestore();
};

// Get Firebase Storage instance
const getStorage = () => {
    if (!firebaseApp) {
        initializeFirebase();
    }
    return admin.storage();
};

// Get bucket for file storage
const getBucket = () => {
    const storage = getStorage();
    return storage.bucket();
};

// Helper function to generate unique IDs
const generateId = () => uuidv4();

// Helper function to convert Firestore timestamp to Date
const convertTimestamp = (timestamp) => {
    if (timestamp && timestamp.toDate) {
        return timestamp.toDate();
    }
    return timestamp;
};

// Helper function to convert Date to Firestore timestamp
const convertToTimestamp = (date) => {
    if (date instanceof Date) {
        return admin.firestore.Timestamp.fromDate(date);
    }
    return date;
};

module.exports = {
    initializeFirebase,
    getFirestore,
    getStorage,
    getBucket,
    generateId,
    convertTimestamp,
    convertToTimestamp,
    admin
}; 