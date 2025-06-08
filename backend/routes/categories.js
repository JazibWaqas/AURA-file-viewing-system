const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

// Category CRUD operations
router.post('/', categoryController.createCategory);
router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategory);
router.put('/:id', categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);

// Initialize default categories
router.post('/initialize', categoryController.initializeDefaultCategories);

module.exports = router;