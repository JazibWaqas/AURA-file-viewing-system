const admin = require('firebase-admin');
const path = require('path');

async function checkBucket() {
    try {
        console.log('Checking Firebase Storage bucket...');
        
        // Load service account
        const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');
        const serviceAccount = require(serviceAccountPath);
        console.log('✅ Service account loaded');
        
        // Get project ID and bucket name
        const projectId = serviceAccount.project_id;
        const bucketName = `${projectId}.appspot.com`;
        console.log('Project ID:', projectId);
        console.log('Expected bucket name:', bucketName);
        
        // Initialize Firebase
        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                storageBucket: bucketName
            });
        }
        console.log('✅ Firebase initialized');
        
        // Get storage instance
        const storage = admin.storage();
        console.log('✅ Storage instance created');
        
        // Try to get bucket
        const bucket = storage.bucket(bucketName);
        console.log('✅ Bucket reference created');
        
        // Try to list files (this will fail if bucket doesn't exist or permissions are wrong)
        try {
            const [files] = await bucket.getFiles({ maxResults: 1 });
            console.log('✅ Bucket exists and is accessible!');
            console.log('Number of files in bucket:', files.length);
        } catch (error) {
            if (error.code === 'ENOTFOUND') {
                console.error('❌ Bucket does not exist! This is unexpected if you just created it.');
                console.error('Please double-check the bucket name in Firebase Console > Storage > Files (top of the section).');
                console.error('It should be:', bucketName);
            } else if (error.code === 'PERMISSION_DENIED') {
                console.error('❌ Permission denied!');
                console.error('Please check your Firebase Storage security rules (Storage > Rules tab) and service account permissions.');
            } else {
                console.error('❌ Error accessing bucket:', error.message);
            }
        }
        
    } catch (error) {
        console.error('❌ Error in checkBucket script:', error.message);
    }
}

checkBucket(); 