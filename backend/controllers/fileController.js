const File = require('../models/File');
const fs = require('fs').promises;
const path = require('path');
const XLSX = require('xlsx');
const { parse } = require('csv-parse/sync');



//upload lots of files 
// Upload multiple files (bulk upload)
exports.uploadBulkFiles = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No files uploaded' });
        }

        const filesToSave = req.files.map(file => ({
            filename: file.filename,
            originalName: file.originalname,
            fileType: file.mimetype.includes('excel') ? 'excel' : 'pdf',
            category: req.body.category,
            year: parseInt(req.body.year),
            month: parseInt(req.body.month),
            path: file.path,
            size: file.size,
            description: req.body.description || '',
            uploadedBy: req.body.uploadedBy || 'anonymous'
        }));

        const savedFiles = await File.insertMany(filesToSave);

        res.status(201).json({
            message: 'Files uploaded successfully',
            files: savedFiles
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error uploading files',
            error: error.message
        });
    }
};

// Upload a file
exports.uploadFile = async (req, res) => {
    try {
        console.log('Upload request received:', {
            file: req.file ? {
                filename: req.file.filename,
                size: req.file.size,
                mimetype: req.file.mimetype
            } : 'No file',
            body: req.body
        });

        if (!req.file) {
            console.log('No file in request');
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Create a new file document
        const file = new File({
            filename: req.file.filename,
            originalName: req.file.originalname,
            fileType: req.file.mimetype.includes('excel') ? 'excel' : 
                     req.file.mimetype.includes('csv') ? 'csv' : 'pdf',
            category: req.body.category,
            year: parseInt(req.body.year),
            month: parseInt(req.body.month),
            path: req.file.path,
            size: req.file.size,
            description: req.body.description || '',
            uploadedBy: req.body.uploadedBy || 'anonymous',
            status: 'Draft'
        });

        console.log('Attempting to save file to database:', {
            filename: file.filename,
            originalName: file.originalName,
            category: file.category,
            year: file.year,
            month: file.month,
            size: file.size
        });

        // Save to database
        const savedFile = await file.save();
        
        console.log('File saved successfully to database:', {
            id: savedFile._id,
            filename: savedFile.filename,
            path: savedFile.path
        });
        
        // Return success response
        res.status(201).json({
            message: 'File uploaded successfully',
            file: savedFile
        });
    } catch (error) {
        console.error('Error in uploadFile:', error);
        // If there's an error, try to delete the uploaded file
        if (req.file) {
            try {
                await fs.unlink(req.file.path);
                console.log('Deleted uploaded file after error');
            } catch (unlinkError) {
                console.error('Error deleting file after failed upload:', unlinkError);
            }
        }
        res.status(500).json({ 
            message: 'Error uploading file',
            error: error.message 
        });
    }
};

// Get all files
exports.getAllFiles = async (req, res) => {
    try {
        console.log('Fetching all files from database...');
        const { search, category, year } = req.query; // Get search term and filters from query parameters
        let query = {};

        // Handle search
        if (search) {
            const searchRegex = new RegExp(search, 'i'); // Case-insensitive regex
            query.$or = [
                { originalName: { $regex: searchRegex } },
                { description: { $regex: searchRegex } },
                { category: { $regex: searchRegex } }
            ];
        }

        // Handle category filter
        if (category) {
            query.category = category;
        }

        // Handle year filter
        if (year) {
            query.year = parseInt(year);
        }

        const files = await File.find(query).sort({ createdAt: -1 });
        console.log(`Found ${files.length} files in database`);
        
        // Log each file's details
        files.forEach(file => {
            console.log('File in database:', {
                id: file._id,
                filename: file.filename,
                originalName: file.originalName,
                category: file.category,
                year: file.year,
                month: file.month,
                uploadedAt: file.createdAt
            });
        });

        res.json(files);
    } catch (error) {
        console.error('Error fetching files:', error);
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

        // Serve the file directly for in-browser viewing
        res.sendFile(file.path, { root: '.' }); // Use root to resolve absolute path
    } catch (error) {
        console.error('Error fetching file for viewing:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get file details (metadata)
exports.getFileDetails = async (req, res) => {
    try {
        const fileId = req.params.id;
        const file = await File.findById(fileId);

        if (!file) {
            return res.status(404).json({ message: 'File details not found' });
        }

        // Return only the necessary metadata
        res.json({
            _id: file._id,
            filename: file.filename,
            originalName: file.originalName,
            fileType: file.fileType,
            category: file.category,
            year: file.year,
            month: file.month,
            size: file.size,
            uploadedBy: file.uploadedBy,
            description: file.description,
            createdAt: file.createdAt,
            updatedAt: file.updatedAt
        });
    } catch (error) {
        console.error('Error fetching file details:', error);
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

// Get file preview data
exports.getFilePreview = async (req, res) => {
    try {
        const file = await File.findById(req.params.id);
        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }

        // Read the file content
        const fileContent = await fs.readFile(file.path);

        let data = [];
        let headers = [];

        if (file.fileType === 'csv') {
            // Parse CSV
            const records = parse(fileContent, {
                columns: true,
                skip_empty_lines: true
            });
            
            if (records.length > 0) {
                headers = Object.keys(records[0]);
                data = records;
            }
        } else if (file.fileType === 'excel') {
            // Parse Excel
            const workbook = XLSX.read(fileContent, { type: 'buffer' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            
            // Convert to JSON
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            
            if (jsonData.length > 0) {
                headers = Object.keys(jsonData[0]);
                data = jsonData;
            }
        } else {
            return res.status(400).json({ message: 'Preview not supported for this file type' });
        }

        // Limit the number of rows to prevent overwhelming the client
        const previewData = data.slice(0, 100);

        res.json({
            headers,
            data: previewData,
            totalRows: data.length,
            previewRows: previewData.length
        });
    } catch (error) {
        console.error('Error in getFilePreview:', error);
        res.status(500).json({ message: error.message });
    }
};