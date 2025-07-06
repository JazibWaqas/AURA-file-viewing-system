const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');
const { upload, handleMulterError } = require('../middleware/upload');

// File retrieval routes
router.get('/', fileController.getAllFiles);
router.get('/filter', fileController.getFilesByCategoryAndDate);
router.get('/paginated', fileController.getFilesPaginated);

// Recently viewed files routes (MUST come before /:id routes to avoid conflicts)
router.post('/recently-viewed', fileController.addToRecentlyViewed);
router.get('/recently-viewed/:userId', fileController.getRecentlyViewedFiles);
router.delete('/recently-viewed/:userId', fileController.clearRecentlyViewedFiles);

// File operations (these come after recently-viewed routes)
router.get('/:id/debug', fileController.debugFile);
router.get('/:id/view', fileController.viewFile);
router.get('/:id/preview', fileController.getFilePreview);
router.get('/:id/details', fileController.getFileDetails);
router.get('/:id', fileController.getFile);
router.put('/:id', upload.single('file'), fileController.updateFile);
router.delete('/:id', fileController.deleteFile);

module.exports = router;