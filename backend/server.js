const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const multer = require('multer');
const { db, bucket } = require('./config/firebase');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Multer setup for memory storage
const upload = multer({ storage: multer.memoryStorage() });

// --- List categories endpoint ---
app.get('/api/categories', async (req, res) => {
  try {
    const snapshot = await db.collection('categories').get();
    const categories = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- Create category endpoint ---
app.post('/api/categories', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    const docRef = await db.collection('categories').add({ name });
    res.status(201).json({ id: docRef.id, name });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- List files endpoint ---
app.get('/api/files', async (req, res) => {
  try {
    // Get file metadata from Firestore
    const snapshot = await db.collection('uploads').get();
    const files = snapshot.docs.map(doc => ({
      _id: doc.id,
      originalName: doc.data().filename || doc.data().originalName,
      category: doc.data().category || '',
      year: doc.data().year || new Date().getFullYear(),
      month: doc.data().month || new Date().getMonth() + 1,
      fileType: doc.data().fileType || 'pdf',
      size: doc.data().size || 0,
      description: doc.data().description || '',
      uploadedBy: doc.data().uploadedBy || 'anonymous',
      createdAt: doc.data().uploadedAt || doc.data().createdAt || new Date(),
      updatedAt: doc.data().updatedAt || new Date(),
      url: `https://storage.googleapis.com/${bucket.name}/${doc.data().filename || doc.data().originalName}`
    }));
    
    // Sort by creation date (newest first)
    files.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json(files);
  } catch (error) {
    console.error('Error fetching files:', error);
    res.status(500).json({ error: error.message });
  }
});

// --- File upload endpoint ---
app.post('/api/files/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { fileName, description, category, year, month } = req.body;
    
    // Upload file to Firebase Storage
    const blob = bucket.file(req.file.originalname);
    const blobStream = blob.createWriteStream({ resumable: false });
    
    blobStream.on('finish', async () => {
      try {
        // Save file metadata to Firestore
        const fileMetadata = {
          filename: req.file.originalname,
          originalName: fileName || req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
          category: category || '',
          year: parseInt(year) || new Date().getFullYear(),
          month: parseInt(month) || new Date().getMonth() + 1,
          description: description || '',
          uploadedBy: 'anonymous',
          uploadedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
          fileType: req.file.mimetype.includes('pdf') ? 'pdf' : 
                   req.file.mimetype.includes('excel') || req.file.mimetype.includes('spreadsheet') ? 'excel' : 'csv'
        };
        
        const docRef = await db.collection('uploads').add(fileMetadata);
        
        res.status(201).json({ 
          message: 'File uploaded successfully!',
          fileId: docRef.id,
          file: {
            _id: docRef.id,
            ...fileMetadata
          }
        });
      } catch (error) {
        console.error('Error saving metadata:', error);
        res.status(500).json({ error: 'Failed to save file metadata' });
      }
    });
    
    blobStream.on('error', (err) => {
      console.error('Error uploading to storage:', err);
      res.status(500).json({ error: err.message });
    });
    
    blobStream.end(req.file.buffer);
  } catch (error) {
    console.error('Error in upload endpoint:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Firestore test
    await db.collection('healthcheck').doc('test').set({ timestamp: new Date() });
    // Storage test
    await bucket.getFiles({ maxResults: 1 });
    res.status(200).json({
      status: 'ok',
      firestore: 'connected',
      storage: 'connected',
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// --- Download file endpoint ---
app.get('/api/files/:id', async (req, res) => {
  try {
    const fileId = req.params.id;
    
    // Get file metadata from Firestore
    const doc = await db.collection('uploads').doc(fileId).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    const fileData = doc.data();
    const fileName = fileData.filename || fileData.originalName;
    
    // Get file from Firebase Storage
    const file = bucket.file(fileName);
    const [exists] = await file.exists();
    
    if (!exists) {
      return res.status(404).json({ error: 'File not found in storage' });
    }
    
    // Set headers for file download
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Type', fileData.mimetype || 'application/octet-stream');
    
    // Stream the file
    file.createReadStream().pipe(res);
  } catch (error) {
    console.error('Error downloading file:', error);
    res.status(500).json({ error: error.message });
  }
});

// --- Get file details endpoint ---
app.get('/api/files/:id/details', async (req, res) => {
  try {
    const fileId = req.params.id;
    
    // Get file metadata from Firestore
    const doc = await db.collection('uploads').doc(fileId).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    const fileData = doc.data();
    const fileName = fileData.filename || fileData.originalName;
    
    res.json({
      _id: doc.id,
      originalName: fileData.originalName || fileData.filename,
      filename: fileData.filename,
      category: fileData.category || '',
      year: fileData.year || new Date().getFullYear(),
      month: fileData.month || new Date().getMonth() + 1,
      fileType: fileData.fileType || 'pdf',
      size: fileData.size || 0,
      description: fileData.description || '',
      uploadedBy: fileData.uploadedBy || 'anonymous',
      createdAt: fileData.uploadedAt || fileData.createdAt || new Date(),
      updatedAt: fileData.updatedAt || new Date(),
      mimetype: fileData.mimetype || 'application/octet-stream',
      url: `https://storage.googleapis.com/${bucket.name}/${fileName}`
    });
  } catch (error) {
    console.error('Error fetching file details:', error);
    res.status(500).json({ error: error.message });
  }
});

// --- View file endpoint (for PDFs) ---
app.get('/api/files/:id/view', async (req, res) => {
  try {
    const fileId = req.params.id;
    
    // Get file metadata from Firestore
    const doc = await db.collection('uploads').doc(fileId).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    const fileData = doc.data();
    const fileName = fileData.filename || fileData.originalName;
    
    // Get file from Firebase Storage
    const file = bucket.file(fileName);
    const [exists] = await file.exists();
    
    if (!exists) {
      return res.status(404).json({ error: 'File not found in storage' });
    }
    
    // Set headers for file viewing
    res.setHeader('Content-Type', fileData.mimetype || 'application/octet-stream');
    
    // Stream the file
    file.createReadStream().pipe(res);
  } catch (error) {
    console.error('Error viewing file:', error);
    res.status(500).json({ error: error.message });
  }
});

// --- Preview file endpoint (for CSV/Excel) ---
app.get('/api/files/:id/preview', async (req, res) => {
  try {
    const fileId = req.params.id;
    
    // Get file metadata from Firestore
    const doc = await db.collection('uploads').doc(fileId).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    const fileData = doc.data();
    const fileName = fileData.filename || fileData.originalName;
    
    // Get file from Firebase Storage
    const file = bucket.file(fileName);
    const [exists] = await file.exists();
    
    if (!exists) {
      return res.status(404).json({ error: 'File not found in storage' });
    }
    
    // For now, return a simple preview structure
    // In a real implementation, you would parse CSV/Excel files here
    res.json({
      headers: ['Column 1', 'Column 2', 'Column 3'],
      data: [
        ['Sample Data 1', 'Sample Data 2', 'Sample Data 3'],
        ['Sample Data 4', 'Sample Data 5', 'Sample Data 6']
      ],
      totalRows: 2,
      fileName: fileName
    });
  } catch (error) {
    console.error('Error generating preview:', error);
    res.status(500).json({ error: error.message });
  }
});

// --- Delete file endpoint ---
app.delete('/api/files/:id', async (req, res) => {
  try {
    const fileId = req.params.id;
    
    // Get file metadata from Firestore
    const doc = await db.collection('uploads').doc(fileId).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    const fileData = doc.data();
    const fileName = fileData.filename || fileData.originalName;
    
    // Delete from Firebase Storage
    const file = bucket.file(fileName);
    await file.delete();
    
    // Delete from Firestore
    await db.collection('uploads').doc(fileId).delete();
    
    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app; // For testing purposes