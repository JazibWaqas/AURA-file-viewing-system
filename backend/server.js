const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const multer = require('multer');
const { db, bucket } = require('./config/firebase');
const XLSX = require('xlsx');
const userRoutes = require('./routes/users');
const fileRoutes = require('./routes/files');
const dashboardRoutes = require('./routes/dashboard');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/users', userRoutes);

// Multer setup for memory storage
const upload = multer({ storage: multer.memoryStorage() });

// Helper to ensure valid ISO string for dates
function toISODate(val) {
  if (!val) return new Date().toISOString();
  if (typeof val === 'string') {
    const d = new Date(val);
    return isNaN(d) ? new Date().toISOString() : d.toISOString();
  }
  if (val.toDate) return val.toDate().toISOString(); // Firestore Timestamp
  if (val instanceof Date) return val.toISOString();
  return new Date(val).toISOString();
}

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

// --- File upload endpoint (multiple files) - KEEPING WORKING VERSION ---
app.post('/api/files/upload', upload.array('files'), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const { description, category, subCategory, year, month } = req.body;
    const uploadedFiles = [];
    for (const file of req.files) {
      const blob = bucket.file(file.originalname);
      const blobStream = blob.createWriteStream({ resumable: false });
      await new Promise((resolve, reject) => {
        blobStream.on('finish', resolve);
        blobStream.on('error', reject);
        blobStream.end(file.buffer);
      });
      // Save file metadata to Firestore
      const fileMetadata = {
        filename: file.originalname,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        category: category || '',
        subCategory: subCategory || '',
        year: parseInt(year) || new Date().getFullYear(),
        month: parseInt(month) || new Date().getMonth() + 1,
        description: description || '',
        uploadedBy: 'anonymous',
        uploadedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        fileType: file.mimetype.includes('pdf') ? 'pdf' :
                 (file.mimetype.includes('wordprocessingml') || file.mimetype.includes('msword')) ? 'docx' :
                 (file.mimetype.includes('excel') || file.mimetype.includes('spreadsheet')) ? 'excel' :
                 file.mimetype.includes('csv') ? 'csv' : 'other'
      };
      const docRef = await db.collection('uploads').add(fileMetadata);
      uploadedFiles.push({ _id: docRef.id, ...fileMetadata });
    }
    res.status(201).json({ message: 'Files uploaded successfully!', files: uploadedFiles });
  } catch (error) {
    console.error('Error uploading files:', error);
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

// Use modular routes for all other file operations
app.use('/api/files', fileRoutes);
app.use('/api/dashboard', dashboardRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app; // For testing purposes