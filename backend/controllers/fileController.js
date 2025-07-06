const fs = require('fs').promises;
const path = require('path');
const XLSX = require('xlsx');
const { parse } = require('csv-parse/sync');
const FileService = require('../services/fileService');
const fileService = FileService;

const isExcelMimeType = (mimetype) => {
    const excelTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
        'application/vnd.ms-excel', // .xls
        'application/vnd.ms-excel.sheet.macroEnabled.12', // .xlsm
        'application/vnd.ms-excel.sheet.binary.macroEnabled.12' // .xlsb
    ];
    return excelTypes.includes(mimetype);
};

const isCsvMimeType = (mimetype) => {
    const csvTypes = [
        'text/csv',
        'application/csv',
        'text/x-csv',
        'application/x-csv',
        'text/comma-separated-values',
        'text/x-comma-separated-values'
    ];
    return csvTypes.includes(mimetype);
};

const isDocxMimeType = (mimetype) => {
    return mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || mimetype === 'application/msword';
};

//upload lots of files
// Upload multiple files (bulk upload)
exports.uploadBulkFiles = async (req, res) => {
    // This function needs to be adapted for fileService if used
    res.status(501).json({ message: 'Bulk upload not implemented with file service yet.' });
};

// Upload a file
exports.uploadFile = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No files uploaded' });
        }
        
        const uploadedFiles = [];
        
        for (const file of req.files) {
            // Upload file to Firebase Storage
            const fileMeta = await fileService.uploadFileToStorage(file, file.originalname);
            
            // Save metadata to Firestore
            const fileData = {
                filename: fileMeta.path.split('/').pop(),
                originalName: file.originalname,
                fileType: isExcelMimeType(file.mimetype) ? 'excel' :
                          isCsvMimeType(file.mimetype) ? 'csv' :
                          isDocxMimeType(file.mimetype) ? 'docx' : 'pdf',
                category: req.body.category,
                subCategory: req.body.subCategory,
                year: parseInt(req.body.year),
                month: parseInt(req.body.month),
                path: fileMeta.path,
                size: file.size,
                description: req.body.description || '',
                uploadedBy: req.body.uploadedBy || 'anonymous',
                status: 'Draft',
                url: fileMeta.url
            };
            
            const savedFile = await fileService.createFile(fileData);
            uploadedFiles.push(savedFile);
        }
        
        res.status(201).json({ 
            message: `${uploadedFiles.length} file(s) uploaded successfully`, 
            files: uploadedFiles 
        });
    } catch (error) {
        console.error('Error uploading files:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get all files (non-paginated, for legacy support)
exports.getAllFiles = async (req, res) => {
    try {
        const { search, category, year, subCategory } = req.query;
        const filters = { search, category, year, subCategory };
        const files = await fileService.getAllFiles(filters);
        res.json(files);
    } catch (error) {
        console.error('Error fetching files:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get files by category and date (legacy)
exports.getFilesByCategoryAndDate = async (req, res) => {
    try {
        const { category, year, month } = req.query;
        const filters = { category, year, month };
        const files = await fileService.getAllFiles(filters);
        res.json(files);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Download a file
exports.getFile = async (req, res) => {
    try {
        const file = await fileService.getFileById(req.params.id);
        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }
        
        // Handle files that don't have a path field (legacy files)
        let filePath = file.path;
        if (!filePath && file.filename) {
            // For legacy files, construct the path from filename
            filePath = file.filename;
        }
        
        if (!filePath) {
            return res.status(404).json({ message: 'File path is missing' });
        }
        
        // Download from Firebase Storage
        const fileRef = fileService.bucket.file(filePath);
        const [exists] = await fileRef.exists();
        if (!exists) {
            return res.status(404).json({ message: 'File not found in storage' });
        }
        
        res.setHeader('Content-Disposition', `attachment; filename="${file.originalName || file.filename}"`);
        res.setHeader('Content-Type', file.fileType === 'excel' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' :
            file.fileType === 'csv' ? 'text/csv' : 'application/pdf');
        fileRef.createReadStream().pipe(res);
    } catch (error) {
        console.error('Error downloading file:', error);
        res.status(500).json({ message: error.message });
    }
};

// View a file (for in-browser viewing)
exports.viewFile = async (req, res) => {
    try {
        const file = await fileService.getFileById(req.params.id);
        
        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }
        
        // Handle files that don't have a path field (legacy files)
        let filePath = file.path;
        if (!filePath && file.filename) {
            // For legacy files, construct the path from filename
            // Assuming files are stored directly with their filename in the bucket
            filePath = file.filename;
        }
        
        if (!filePath) {
            return res.status(404).json({ message: 'File path is missing' });
        }

        const fileRef = fileService.bucket.file(filePath);
        const [exists] = await fileRef.exists();

        if (!exists) {
            return res.status(404).json({ message: 'File not found in storage' });
        }

        let contentType = 'application/octet-stream';
        if (file.fileType === 'pdf') contentType = 'application/pdf';
        else if (file.fileType === 'excel' || file.fileType === 'xlsx') contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        else if (file.fileType === 'csv') contentType = 'text/csv';
        else if (file.fileType === 'docx' || file.fileType === 'doc') contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        
        res.setHeader('Content-Type', contentType);

        const readStream = fileRef.createReadStream();
        readStream.on('error', (err) => {
            console.error('Error streaming file:', err);
            res.status(500).send('Error streaming file.');
        });
        readStream.pipe(res);

    } catch (error) {
        console.error('Error in viewFile controller:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get file details (metadata)
exports.getFileDetails = async (req, res) => {
    try {
        const file = await fileService.getFileById(req.params.id);
        if (!file) {
            return res.status(404).json({ message: 'File details not found' });
        }
        res.json(file);
    } catch (error) {
        console.error('Error fetching file details:', error);
        res.status(500).json({ message: error.message });
    }
};

// Update file details
exports.updateFile = async (req, res) => {
    try {
        const fileId = req.params.id;
        const file = await fileService.getFileById(fileId);
        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }
        
        // Map frontend field names to database field names
        const updates = {
            originalName: req.body.fileName || file.originalName,
            description: req.body.description || file.description,
            category: req.body.category || file.category,
            subCategory: req.body.subCategory || file.subCategory,
            year: req.body.year ? parseInt(req.body.year) : file.year
        };

        if (req.file) {
             if(file.path) {
                try {
                    await fileService.bucket.file(file.path).delete();
                } catch(e) {
                    console.warn("Old file could not be deleted, might not exist.", e.message);
                }
            }
            const fileMeta = await fileService.uploadFileToStorage(req.file, req.file.originalname);
            updates.filename = fileMeta.path.split('/').pop();
            updates.originalName = req.file.originalname;
            updates.fileType = isExcelMimeType(req.file.mimetype) ? 'excel' :
                isCsvMimeType(req.file.mimetype) ? 'csv' :
                isDocxMimeType(req.file.mimetype) ? 'docx' : 'pdf';
            updates.path = fileMeta.path;
            updates.size = req.file.size;
            updates.url = fileMeta.url;
        }
        
        const updatedFile = await fileService.updateFile(fileId, updates);
        res.json(updatedFile);
    } catch (error) {
        console.error('Error updating file:', error);
        res.status(500).json({ message: error.message });
    }
};

// Delete a file
exports.deleteFile = async (req, res) => {
    try {
        await fileService.deleteFile(req.params.id);
        res.json({ message: 'File deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get file preview (for CSV/Excel)
exports.getFilePreview = async (req, res) => {
    try {
        const file = await fileService.getFileById(req.params.id);
        if (!file || !file.path) {
            return res.status(404).json({ message: 'File not found or path is missing' });
        }

        const data = await fileService.getFilePreviewData(file.path, file.fileType);
        res.json({ ...data, fileName: file.originalName });

    } catch (error) {
        console.error('Error in getFilePreview controller:', error);
        res.status(500).json({ message: `Failed to generate preview: ${error.message}` });
    }
};

// Get paginated files
exports.getFilesPaginated = async (req, res) => {
    try {
        const { search, category, year, subCategory, limit = 16, startAfter = null } = req.query;
        const filters = { search, category, year, subCategory };

        // Remove empty filters
        Object.keys(filters).forEach(key => (filters[key] === '' || filters[key] === null || filters[key] === undefined) && delete filters[key]);

        const result = await fileService.getFilesPaginated({ filters, limit, startAfter });
        res.json(result);
    } catch (error) {
        console.error('Error fetching paginated files:', error);
        res.status(500).json({ message: error.message });
    }
};

// Add file to recently viewed
exports.addToRecentlyViewed = async (req, res) => {
    try {
        const { fileId, userId } = req.body;
        
        if (!fileId || !userId) {
            return res.status(400).json({ message: 'File ID and User ID are required' });
        }

        // Verify file exists
        const file = await fileService.getFileById(fileId);
        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }

        // Add to recently viewed in database
        await fileService.addToRecentlyViewed(fileId, userId);
        res.json({ message: 'Added to recently viewed' });
    } catch (error) {
        console.error('Error adding to recently viewed:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get recently viewed files for a user
exports.getRecentlyViewedFiles = async (req, res) => {
    try {
        const { userId } = req.params;
        const { limit = 4 } = req.query;
        
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        const recentlyViewed = await fileService.getRecentlyViewedFiles(userId, parseInt(limit));
        res.json(recentlyViewed);
    } catch (error) {
        console.error('Error fetching recently viewed files:', error);
        res.status(500).json({ message: error.message });
    }
};

// Clear recently viewed files for a user
exports.clearRecentlyViewedFiles = async (req, res) => {
    try {
        const { userId } = req.params;
        
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        await fileService.clearRecentlyViewedFiles(userId);
        res.json({ message: 'Recently viewed files cleared' });
    } catch (error) {
        console.error('Error clearing recently viewed files:', error);
        res.status(500).json({ message: error.message });
    }
};

// Debug endpoint to inspect file data
exports.debugFile = async (req, res) => {
    try {
        const fileId = req.params.id;
        
        // Get raw document data
        const doc = await fileService.db.collection('uploads').doc(fileId).get();
        
        if (!doc.exists) {
            return res.status(404).json({ message: 'File not found in database' });
        }
        
        const rawData = doc.data();
        
        // Also try to get it through the service
        const serviceFile = await fileService.getFileById(fileId);
        
        res.json({
            rawData,
            serviceData: serviceFile,
            hasPath: !!rawData.path,
            hasFilename: !!rawData.filename,
            hasOriginalName: !!rawData.originalName,
            fileType: rawData.fileType,
            collection: fileService.collection
        });
        
    } catch (error) {
        console.error('Error in debugFile:', error);
        res.status(500).json({ message: error.message });
    }
};