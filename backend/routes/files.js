const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');
const { upload, handleMulterError } = require('../middleware/upload');

// File upload routes
router.post('/upload', upload.array('files', 10), fileController.uploadFile);
router.post('/upload/bulk', upload.array('files', 10), fileController.uploadBulkFiles);

// File retrieval routes
router.get('/', fileController.getAllFiles);
router.get('/filter', fileController.getFilesByCategoryAndDate);
router.get('/search', fileController.searchFiles);
router.get('/department/:department', fileController.getFilesByDepartment);
router.get('/project/:projectCode', fileController.getFilesByProject);
router.get('/grant/:grantReference', fileController.getFilesByGrant);
router.get('/category/:category', fileController.getFilesByCategory);
router.get('/archived', fileController.getArchivedFiles);

// File operations
router.get('/:id', fileController.getFile);
router.put('/:id', upload.single('file'), fileController.updateFile);
router.delete('/:id', fileController.deleteFile);
router.patch('/:id/archive', fileController.archiveFile);
router.patch('/:id/restore', fileController.restoreFile);
router.patch('/:id/status', fileController.updateFileStatus);

// File metadata
router.get('/:id/metadata', fileController.getFileMetadata);
router.patch('/:id/metadata', fileController.updateFileMetadata);
router.post('/:id/tags', fileController.addFileTags);
router.delete('/:id/tags', fileController.removeFileTags);

module.exports = router;