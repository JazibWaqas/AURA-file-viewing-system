const File = require('../models/File');
const fs = require('fs').promises;
const path = require('path');

// Upload a file
exports.uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const file = new File({
            filename: req.file.filename,
            originalName: req.file.originalname,
            fileType: req.file.mimetype.includes('excel') ? 'excel' : 'pdf',
            category: req.body.category,
            year: parseInt(req.body.year),
            month: parseInt(req.body.month),
            path: req.file.path,
            size: req.file.size,
            uploadedBy: req.body.uploadedBy || 'anonymous'
        });

        await file.save();
        res.status(201).json(file);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all files
exports.getAllFiles = async (req, res) => {
    try {
        const files = await File.find().sort({ createdAt: -1 });
        res.json(files);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get files by category and date
exports.getFilesByCategoryAndDate = async (req, res) => {
    try {
        const { category, year, month } = req.query;
        const query = {};
        
        if (category) query.category = category;
        if (year) query.year = parseInt(year);
        if (month) query.month = parseInt(month);

        const files = await File.find(query).sort({ createdAt: -1 });
        res.json(files);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Download/View a file
exports.getFile = async (req, res) => {
    try {
        const file = await File.findById(req.params.id);
        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }

        res.download(file.path, file.originalName);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Update file details
exports.updateFile = async (req, res) => {
    try {
        const file = await File.findById(req.params.id);
        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }

        // Update only the fields that are provided
        if (req.body.category) file.category = req.body.category;
        if (req.body.year) file.year = parseInt(req.body.year);
        if (req.body.month) file.month = parseInt(req.body.month);
        if (req.body.uploadedBy) file.uploadedBy = req.body.uploadedBy;

        // If a new file is uploaded, update the file details
        if (req.file) {
            // Delete the old file
            await fs.unlink(file.path);
            
            // Update with new file details
            file.filename = req.file.filename;
            file.originalName = req.file.originalname;
            file.fileType = req.file.mimetype.includes('excel') ? 'excel' : 'pdf';
            file.path = req.file.path;
            file.size = req.file.size;
        }

        await file.save();
        res.json(file);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete a file
exports.deleteFile = async (req, res) => {
    try {
        const file = await File.findById(req.params.id);
        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }

        // Delete file from filesystem
        await fs.unlink(file.path);
        
        // Delete file record from database
        await file.deleteOne();
        
        res.json({ message: 'File deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};