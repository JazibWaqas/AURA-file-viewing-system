const Category = require('../models/Category');

// Create a new category
exports.createCategory = async (req, res) => {
    try {
        const category = new Category({
            name: req.body.name,
            description: req.body.description
        });
        await category.save();
        res.status(201).json(category);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all categories
exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find().sort({ name: 1 });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a single category
exports.getCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.json(category);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update a category
exports.updateCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        
        category.name = req.body.name || category.name;
        category.description = req.body.description || category.description;
        
        await category.save();
        res.json(category);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete a category
exports.deleteCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        
        await category.deleteOne();
        res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Initialize default categories
exports.initializeDefaultCategories = async () => {
    try {
        const defaultCategories = [
            {
                name: 'Income Statement',
                description: 'Monthly income reports and statements'
            },
            {
                name: 'Cash Flow',
                description: 'Cash flow statements and reports'
            },
            {
                name: 'Balance Sheet',
                description: 'Balance sheet documents'
            },
            {
                name: 'Receipts',
                description: 'Expense receipts and documentation'
            },
            {
                name: 'Invoices',
                description: 'Client and vendor invoices'
            }
        ];

        for (const category of defaultCategories) {
            await Category.findOneAndUpdate(
                { name: category.name },
                category,
                { upsert: true, new: true }
            );
        }

        console.log('Default categories initialized successfully');
    } catch (error) {
        console.error('Error initializing default categories:', error);
    }
};