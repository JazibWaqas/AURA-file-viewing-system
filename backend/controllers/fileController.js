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
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        // Upload file to Firebase Storage
        const fileMeta = await fileService.uploadFileToStorage(req.file, req.file.originalname);
        // Save metadata to Firestore
        const fileData = {
            filename: fileMeta.path.split('/').pop(),
            originalName: req.file.originalname,
            fileType: isExcelMimeType(req.file.mimetype) ? 'excel' :
                      isCsvMimeType(req.file.mimetype) ? 'csv' :
                      isDocxMimeType(req.file.mimetype) ? 'docx' : 'pdf',
            category: req.body.category,
            subCategory: req.body.subCategory,
            year: parseInt(req.body.year),
            month: parseInt(req.body.month),
            path: fileMeta.path,
            size: req.file.size,
            description: req.body.description || '',
            uploadedBy: req.body.uploadedBy || 'anonymous',
            status: 'Draft',
            url: fileMeta.url
        };
        const savedFile = await fileService.createFile(fileData);
        res.status(201).json({ message: 'File uploaded successfully', file: savedFile });
    } catch (error) {
        console.error('Error uploading file:', error);
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
        if (!file || !file.path) {
            return res.status(404).json({ message: 'File not found or path is missing' });
        }
        // Download from Firebase Storage
        const fileRef = fileService.bucket.file(file.path);
        const [exists] = await fileRef.exists();
        if (!exists) {
            return res.status(404).json({ message: 'File not found in storage' });
        }
        res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
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
        if (!file || !file.path) {
            return res.status(404).json({ message: 'File not found or path is missing' });
        }

        console.log(`Attempting to stream file from bucket path: ${file.path}`);

        const fileRef = fileService.bucket.file(file.path);
        const [exists] = await fileRef.exists();

        if (!exists) {
            console.error(`File not found in Firebase Storage at path: ${file.path}`);
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
        const updates = { ...req.body }; // Copy all fields from body

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
        console.log('--- New Paginated Request ---');
        console.log('Incoming req.query:', req.query);

        const { search, category, year, subCategory, limit = 16, startAfter = null } = req.query;
        const filters = { search, category, year, subCategory };
        console.log('Filters object (before cleanup):', filters);

        // Remove empty filters
        Object.keys(filters).forEach(key => (filters[key] === '' || filters[key] === null || filters[key] === undefined) && delete filters[key]);
        console.log('Filters object (after cleanup):', filters);

        const result = await fileService.getFilesPaginated({ filters, limit, startAfter });
        console.log(`Query returned ${result.files.length} files.`);
        
        res.json(result);
    } catch (error) {
        console.error('Error fetching paginated files:', error);
        res.status(500).json({ message: error.message });
    }
};