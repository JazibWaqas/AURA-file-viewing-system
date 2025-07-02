const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');
const { upload, handleMulterError } = require('../middleware/upload');

// File upload routes
router.post('/upload', upload.single('file'), fileController.uploadFile);

// File retrieval routes
router.get('/', fileController.getAllFiles);
router.get('/filter', fileController.getFilesByCategoryAndDate);
router.get('/paginated', fileController.getFilesPaginated);

// File operations
router.get('/:id/view', fileController.viewFile);
router.get('/:id/preview', fileController.getFilePreview);
router.get('/:id/details', fileController.getFileDetails);
router.get('/:id', fileController.getFile);
router.put('/:id', upload.single('file'), fileController.updateFile);
router.delete('/:id', fileController.deleteFile);

module.exports = router;