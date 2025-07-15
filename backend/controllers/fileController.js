const fs = require('fs').promises;
const path = require('path');
const XLSX = require('xlsx');
const { parse } = require('csv-parse/sync');
const FileService = require('../services/fileService');
const fileService = FileService;

const isExcelMimeType = (mimetype) => {
    const excelTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'application/vnd.ms-excel.sheet.macroEnabled.12',
        'application/vnd.ms-excel.sheet.binary.macroEnabled.12'
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

// Upload multiple files (bulk upload)
exports.uploadBulkFiles = async (req, res) => {
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
            const fileMeta = await fileService.uploadFileToStorage(file, file.originalname);

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
                url: fileMeta.url,
                requiresAuth: req.body.requiresAuth === 'true' || req.body.requiresAuth === true // store as boolean
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

// Get all files (non-paginated)
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

// Get files by category and date
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

        let filePath = file.path;
        if (!filePath && file.filename) {
        // If file requires authentication, check user
        if (file.requiresAuth) {
            if (!req.user) {
                return res.status(401).json({ message: 'Authentication required to view this file.' });
            }
        }
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

        res.setHeader('Content-Disposition', `attachment; filename="${file.originalName || file.filename}"`);
        res.setHeader('Content-Type', file.fileType === 'excel' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' :
            file.fileType === 'csv' ? 'text/csv' : 'application/pdf');
        fileRef.createReadStream().pipe(res);
    } catch (error) {
        console.error('Error downloading file:', error);
        res.status(500).json({ message: error.message });
    }
};

// View a file
exports.viewFile = async (req, res) => {
    try {
        const file = await fileService.getFileById(req.params.id);
        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }

        let filePath = file.path;
        if (!filePath && file.filename) {
            filePath = file.filename;
        }

        if (!filePath) {
            return res.status(404).json({ message: 'File path is missing' });
        }

        const fileRef = fileService.bucket.file(filePath);
        const [exists] = await fileRef.exists();
        // If file requires authentication, check user
        if (file.requiresAuth) {
            if (!req.user) {
                return res.status(401).json({ message: 'Authentication required to view this file.' });
            }
        }
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

// Get file details
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

// Update file
exports.updateFile = async (req, res) => {
    try {
        const fileId = req.params.id;
        const file = await fileService.getFileById(fileId);
        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }

        const updates = {
            originalName: req.body.fileName || file.originalName,
            description: req.body.description || file.description,
            category: req.body.category || file.category,
            subCategory: req.body.subCategory || file.subCategory,
            year: req.body.year ? parseInt(req.body.year) : file.year
        };

        if (req.file) {
            if (file.path) {
                try {
                    await fileService.bucket.file(file.path).delete();
                } catch (e) {
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

// Delete file
exports.deleteFile = async (req, res) => {
    try {
        await fileService.deleteFile(req.params.id);
        res.json({ message: 'File deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ✅ Fixed: Get file preview (with legacy support)
exports.getFilePreview = async (req, res) => {
    try {
        const file = await fileService.getFileById(req.params.id);

        let filePath = file?.path;
        if (!filePath && file?.filename) {
            filePath = file.filename; // fallback for legacy files
        }

        if (!file || !filePath) {
            return res.status(404).json({ message: 'File not found or path is missing' });
        }

        const data = await fileService.getFilePreviewData(filePath, file.fileType);
        res.json({ ...data, fileName: file.originalName });

    } catch (error) {
        console.error('Error in getFilePreview controller:', error);
        res.status(500).json({ message: `Failed to generate preview: ${error.message}` });
    }
};

// Get paginated files (includes Algolia search)
exports.getFilesPaginated = async (req, res) => {
    try {
        const { search, category, year, subCategory, limit = 16, startAfter = null, page = 0 } = req.query;
        const filters = { search, category, year, subCategory };

        Object.keys(filters).forEach(key => (filters[key] === '' || filters[key] === null || filters[key] === undefined) && delete filters[key]);

        if (search) {
            const algoliaResult = await fileService.searchFilesWithAlgolia(search, Number(limit), Number(page));
            res.json({
                files: algoliaResult.files,
                page: algoliaResult.page,
                nbPages: algoliaResult.nbPages,
                hasNextPage: algoliaResult.hasNextPage,
                lastVisible: null
            });
        } else {
            const result = await fileService.getFilesPaginated({ filters, limit, startAfter });
            res.json(result);
        }
    } catch (error) {
        console.error('Error fetching paginated files:', error);
        res.status(500).json({ message: error.message });
    }
};

// Add to recently viewed
exports.addToRecentlyViewed = async (req, res) => {
    try {
        const { fileId, userId } = req.body;

        if (!fileId || !userId) {
            return res.status(400).json({ message: 'File ID and User ID are required' });
        }

        const file = await fileService.getFileById(fileId);
        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }

        await fileService.addToRecentlyViewed(fileId, userId);
        res.json({ message: 'Added to recently viewed' });
    } catch (error) {
        console.error('Error adding to recently viewed:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get recently viewed files
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

// Clear recently viewed
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

// Debug
exports.debugFile = async (req, res) => {
    try {
        const fileId = req.params.id;

        const doc = await fileService.db.collection('uploads').doc(fileId).get();
        if (!doc.exists) {
            return res.status(404).json({ message: 'File not found in database' });
        }

        const rawData = doc.data();
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
