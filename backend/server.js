const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const multer = require('multer');
const { db, bucket } = require('./config/firebase');
const XLSX = require('xlsx');
const userRoutes = require('./routes/users');
const fileRoutes = require('./routes/files');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/users', userRoutes);
app.use('/api/files', fileRoutes);

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

// --- List files endpoint ---
// COMMENTED OUT: Using modular routes instead
// app.get('/api/files', async (req, res) => {
//   try {
//     // Get file metadata from Firestore
//     const snapshot = await db.collection('uploads').get();
//     const files = snapshot.docs.map(doc => {
//       const data = doc.data();
//       return {
//         _id: doc.id,
//         originalName: data.filename || data.originalName,
//         category: data.category || '',
//         subCategory: data.subCategory || '',
//         year: data.year || new Date().getFullYear(),
//         month: data.month || new Date().getMonth() + 1,
//         fileType: data.fileType || 'pdf',
//         size: data.size || 0,
//         description: data.description || '',
//         
//         createdAt: toISODate(data.uploadedAt || data.createdAt),
//         updatedAt: toISODate(data.updatedAt),
//         url: `https://storage.googleapis.com/${bucket.name}/${data.filename || data.originalName}`
//       };
//     });
//     // Sort by creation date (newest first)
//     files.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
//     res.json(files);
//   } catch (error) {
//     console.error('Error fetching files:', error);
//     res.status(500).json({ error: error.message });
//   }
// });

// --- File upload endpoint (multiple files) ---
// COMMENTED OUT: Using modular routes instead
// app.post('/api/files/upload', upload.array('files'), async (req, res) => {
//   try {
//     if (!req.files || req.files.length === 0) {
//       return res.status(400).json({ error: 'No files uploaded' });
//     }

//     const { description, category, subCategory, year, month } = req.body;
//     const uploadedFiles = [];
//     for (const file of req.files) {
//       const blob = bucket.file(file.originalname);
//       const blobStream = blob.createWriteStream({ resumable: false });
//       await new Promise((resolve, reject) => {
//         blobStream.on('finish', resolve);
//         blobStream.on('error', reject);
//         blobStream.end(file.buffer);
//       });
//       // Save file metadata to Firestore
//       const fileMetadata = {
//         filename: file.originalname,
//         originalName: file.originalname,
//         mimetype: file.mimetype,
//         size: file.size,
//         category: category || '',
//         subCategory: subCategory || '',
//         year: parseInt(year) || new Date().getFullYear(),
//         month: parseInt(month) || new Date().getMonth() + 1,
//         description: description || '',
//         uploadedBy: 'anonymous',
//         uploadedAt: new Date(),
//         createdAt: new Date(),
//         updatedAt: new Date(),
//         fileType: file.mimetype.includes('pdf') ? 'pdf' :
//                  (file.mimetype.includes('wordprocessingml') || file.mimetype.includes('msword')) ? 'docx' :
//                  (file.mimetype.includes('excel') || file.mimetype.includes('spreadsheet')) ? 'excel' :
//                  file.mimetype.includes('csv') ? 'csv' : 'other'
//       };
//       const docRef = await db.collection('uploads').add(fileMetadata);
//       uploadedFiles.push({ _id: docRef.id, ...fileMetadata });
//     }
//     res.status(201).json({ message: 'Files uploaded successfully!', files: uploadedFiles });
//   } catch (error) {
//     console.error('Error uploading files:', error);
//     res.status(500).json({ error: error.message });
//   }
// });

// --- Paginated files endpoint ---
// COMMENTED OUT: Using modular routes instead
// app.get('/api/files/paginated', async (req, res) => {
//   console.log('--- New Paginated Request ---');
//   console.log('Incoming req.query:', req.query);

//   try {
//     const { category, subCategory, year, search, limit = 16, startAfter = null } = req.query;

//     let query = db.collection('uploads');

//     const filters = { search, category, year, subCategory };
//     console.log('Filters object (before cleanup):', filters);

//     // Remove empty filters
//     Object.keys(filters).forEach(key => {
//       if (!filters[key]) {
//         delete filters[key];
//       }
//     });
//      console.log('Filters object (after cleanup):', filters);

//     if (filters.category) {
//       query = query.where('category', '==', filters.category);
//     }
//     if (filters.subCategory) {
//       query = query.where('subCategory', '==', filters.subCategory);
//     }
//     if (filters.year) {
//       // Ensure year is compared as a number if stored as such
//       query = query.where('year', '==', parseInt(filters.year, 10));
//     }
//     // Note: Firestore requires a composite index for combining where filters with orderBy.
//     // If you add more filters, you may need to create more indexes in the Firebase console.
//     query = query.orderBy('createdAt', 'desc');

//     if (startAfter) {
//       const startAfterDoc = await db.collection('uploads').doc(startAfter).get();
//       if(startAfterDoc.exists) {
//         query = query.startAfter(startAfterDoc);
//       }
//     }

//     const snapshot = await query.limit(Number(limit)).get();

//     let files = snapshot.docs.map(doc => ({
//       _id: doc.id,
//       ...doc.data(),
//       createdAt: toISODate(doc.data().createdAt),
//       updatedAt: toISODate(doc.data().updatedAt),
//     }));

//     // In-memory search for now, as full-text search is complex in Firestore
//     if (filters.search) {
//       const searchTerm = filters.search.toLowerCase();
//       files = files.filter(file =>
//         (file.originalName || '').toLowerCase().includes(searchTerm) ||
//         (file.description || '').toLowerCase().includes(searchTerm)
//       );
//     }
    
//     console.log(`Query returned ${files.length} files.`);
    
//     const lastVisible = snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1].id : null;
    
//     const hasNextPage = lastVisible ? (await query.startAfter(snapshot.docs[snapshot.docs.length-1]).limit(1).get()).docs.length > 0 : false;

//     res.json({
//       files,
//       lastVisible,
//       hasNextPage
//     });
//   } catch (error) {
//     console.error('Error fetching paginated files:', error);
//     res.status(500).json({ error: error.message });
//   }
// });

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
// COMMENTED OUT: Using modular routes instead
// app.get('/api/files/:id', async (req, res) => {
//   try {
//     const fileId = req.params.id;
    
//     // Get file metadata from Firestore
//     const doc = await db.collection('uploads').doc(fileId).get();
//     if (!doc.exists) {
//       return res.status(404).json({ error: 'File not found' });
//     }
    
//     const fileData = doc.data();
//     const fileName = fileData.filename || fileData.originalName;
    
//     // Get file from Firebase Storage
//     const file = bucket.file(fileName);
//     const [exists] = await file.exists();
    
//     if (!exists) {
//       return res.status(404).json({ error: 'File not found in storage' });
//     }
    
//     // Set headers for file download
//     res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
//     res.setHeader('Content-Type', fileData.mimetype || 'application/octet-stream');
    
//     // Stream the file
//     file.createReadStream().pipe(res);
//   } catch (error) {
//     console.error('Error downloading file:', error);
//     res.status(500).json({ error: error.message });
//   }
// });

// --- Get file details endpoint ---
// COMMENTED OUT: Using modular routes instead
// app.get('/api/files/:id/details', async (req, res) => {
//   try {
//     const fileId = req.params.id;
//     // Get file metadata from Firestore
//     const doc = await db.collection('uploads').doc(fileId).get();
//     if (!doc.exists) {
//       return res.status(404).json({ error: 'File not found' });
//     }
//     const data = doc.data();
//     const fileName = data.filename || data.originalName;
//     res.json({
//       _id: doc.id,
//       originalName: data.originalName || data.filename,
//       filename: data.filename,
//       category: data.category || '',
//       subCategory: data.subCategory || '',
//       year: data.year || new Date().getFullYear(),
//       month: data.month || new Date().getMonth() + 1,
//       fileType: data.fileType || 'pdf',
//       size: data.size || 0,
//       description: data.description || '',
      
//       createdAt: toISODate(data.uploadedAt || data.createdAt),
//       updatedAt: toISODate(data.updatedAt),
//       mimetype: data.mimetype || 'application/octet-stream',
//       url: `https://storage.googleapis.com/${bucket.name}/${fileName}`
//     });
//   } catch (error) {
//     console.error('Error fetching file details:', error);
//     res.status(500).json({ error: error.message });
//   }
// });

// --- View file endpoint (for PDFs) ---
// COMMENTED OUT: Using modular routes instead
// app.get('/api/files/:id/view', async (req, res) => {
//   try {
//     const fileId = req.params.id;
    
//     // Get file metadata from Firestore
//     const doc = await db.collection('uploads').doc(fileId).get();
//     if (!doc.exists) {
//       return res.status(404).json({ error: 'File not found' });
//     }
    
//     const fileData = doc.data();
//     const fileName = fileData.filename || fileData.originalName;
    
//     // Get file from Firebase Storage
//     const file = bucket.file(fileName);
//     const [exists] = await file.exists();
    
//     if (!exists) {
//       return res.status(404).json({ error: 'File not found in storage' });
//     }
    
//     // Set proper content type for viewing
//     res.setHeader('Content-Type', fileData.mimetype || 'application/octet-stream');
    
//     // Stream the file
//     file.createReadStream().pipe(res);
//   } catch (error) {
//     console.error('Error viewing file:', error);
//     res.status(500).json({ error: error.message });
//   }
// });

// --- Preview file endpoint (for CSV/Excel) ---
// COMMENTED OUT: Using modular routes instead
// app.get('/api/files/:id/preview', async (req, res) => {
//   try {
//     const fileId = req.params.id;
//     // Get file metadata from Firestore
//     const doc = await db.collection('uploads').doc(fileId).get();
//     if (!doc.exists) {
//       return res.status(404).json({ error: 'File not found' });
//     }
//     const fileData = doc.data();
//     const fileName = fileData.filename || fileData.originalName;
//     const fileType = fileData.fileType || '';
//     // Get file from Firebase Storage
//     const file = bucket.file(fileName);
//     const [exists] = await file.exists();
//     if (!exists) {
//       return res.status(404).json({ error: 'File not found in storage' });
//     }
//     // Download file to memory buffer
//     const stream = file.createReadStream();
//     const chunks = [];
//     stream.on('data', chunk => chunks.push(chunk));
//     stream.on('error', err => {
//       console.error('Error reading file from storage:', err);
//       return res.status(500).json({ error: 'Failed to read file from storage.' });
//     });
//     stream.on('end', () => {
//       try {
//         const buffer = Buffer.concat(chunks);
//         let headers = [];
//         let data = [];
//         if (fileType === 'csv') {
//           // Parse CSV
//           const csv = buffer.toString('utf8');
//           const rows = csv.split(/\r?\n/).filter(Boolean).map(row => row.split(','));
//           if (rows.length > 0) {
//             headers = rows[0];
//             data = rows.slice(1);
//           }
//         } else if (fileType === 'excel') {
//           // Parse Excel
//           const workbook = XLSX.read(buffer, { type: 'buffer' });
//           if (workbook.SheetNames.length > 0) {
//             const sheetName = workbook.SheetNames[0];
//             const worksheet = workbook.Sheets[sheetName];
//             const sheetData = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: true, defval: '' });
//             if (sheetData.length > 0) {
//               headers = sheetData[0].map((h, i) => String(h).trim() || `Column ${String.fromCharCode(65 + i)}`);
//               data = sheetData.slice(1);
//             }
//           }
//         } else {
//           return res.status(400).json({ error: 'Preview not supported for this file type' });
//         }
//         return res.json({ headers, rows: data, totalRows: data.length, fileName });
//       } catch (err) {
//         console.error('Error parsing file for preview:', err);
//         return res.status(500).json({ error: 'Failed to parse file for preview.' });
//       }
//     });
//   } catch (error) {
//     console.error('Error generating preview:', error);
//     res.status(500).json({ error: error.message });
//   }
// });

// --- Update file metadata endpoint ---
// COMMENTED OUT: Using modular routes instead
// app.put('/api/files/:id', async (req, res) => {
//   try {
//     const fileId = req.params.id;
    
//     // Get file metadata from Firestore
//     const doc = await db.collection('uploads').doc(fileId).get();
//     if (!doc.exists) {
//       return res.status(404).json({ error: 'File not found' });
//     }
    
//     const fileData = doc.data();
    
//     // Update the metadata fields
//     const updateData = {
//       ...fileData,
//       originalName: req.body.fileName || fileData.originalName,
//       description: req.body.description || fileData.description,
//       category: req.body.category || fileData.category,
//       subCategory: req.body.subCategory || fileData.subCategory,
//       year: req.body.year || fileData.year,
//       updatedAt: new Date()
//     };
    
//     // Update the document in Firestore
//     await db.collection('uploads').doc(fileId).update(updateData);
    
//     res.json({ 
//       message: 'File updated successfully',
//       file: {
//         _id: fileId,
//         ...updateData
//       }
//     });
//   } catch (error) {
//     console.error('Error updating file:', error);
//     res.status(500).json({ error: error.message });
//   }
// });

// --- Delete file endpoint ---
// COMMENTED OUT: Using modular routes instead
// app.delete('/api/files/:id', async (req, res) => {
//   try {
//     const fileId = req.params.id;
    
//     // Get file metadata from Firestore
//     const doc = await db.collection('uploads').doc(fileId).get();
//     if (!doc.exists) {
//       return res.status(404).json({ error: 'File not found' });
//     }
    
//     const fileData = doc.data();
//     const fileName = fileData.filename || fileData.originalName;
    
//     // Delete from Firebase Storage
//     const file = bucket.file(fileName);
//     await file.delete();
    
//     // Delete from Firestore
//     await db.collection('uploads').doc(fileId).delete();
    
//     res.json({ message: 'File deleted successfully' });
//   } catch (error) {
//     console.error('Error deleting file:', error);
//     res.status(500).json({ error: error.message });
//   }
// });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app; // For testing purposes