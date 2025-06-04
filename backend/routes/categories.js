const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

// Category CRUD operations
router.post('/', categoryController.createCategory);
router.get('/', categoryController.getAllCategories);
router.get('/active', categoryController.getActiveCategories);
router.get('/type/:type', categoryController.getCategoriesByType);
router.get('/department/:department', categoryController.getCategoriesByDepartment);
router.get('/:id', categoryController.getCategory);
router.put('/:id', categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);

// Category management
router.patch('/:id/status', categoryController.updateCategoryStatus);
router.post('/:id/subcategories', categoryController.addSubCategory);
router.delete('/:id/subcategories/:subCategoryId', categoryController.removeSubCategory);
router.put('/:id/required-fields', categoryController.updateRequiredFields);
router.get('/:id/retention', categoryController.getRetentionPeriod);
router.put('/:id/retention', categoryController.updateRetentionPeriod);

// Category metadata
router.get('/:id/metadata', categoryController.getCategoryMetadata);
router.patch('/:id/metadata', categoryController.updateCategoryMetadata);

// Initialize default categories
router.post('/initialize', categoryController.initializeDefaultCategories);

module.exports = router;