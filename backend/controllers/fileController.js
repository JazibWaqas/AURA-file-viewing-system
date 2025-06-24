const File = require('../models/File');
const fs = require('fs').promises;
const path = require('path');
const XLSX = require('xlsx');
const { parse } = require('csv-parse/sync');

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
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No files uploaded' });
        }

        const filesToSave = req.files.map(file => ({
            filename: file.filename,
            originalName: file.originalname,
            fileType: isExcelMimeType(file.mimetype) ? 'excel' : 
                      isCsvMimeType(file.mimetype) ? 'csv' :
                      isDocxMimeType(file.mimetype) ? 'docx' : 'pdf',
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
            fileType: isExcelMimeType(req.file.mimetype) ? 'excel' :
                      isCsvMimeType(req.file.mimetype) ? 'csv' :
                      isDocxMimeType(req.file.mimetype) ? 'docx' : 'pdf',
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
            id: savedFile.id,
            filename: savedFile.filename,
            path: savedFile.path
        });
        
        // Return success response
        res.status(201).json({
            message: 'File uploaded successfully',
            file: savedFile
        });
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).json({ message: error.message });
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
            query.search = search;
        }

        // Handle category filter
        if (category) {
            query.category = category;
        }

        // Handle year filter
        if (year) {
            query.year = parseInt(year);
        }

        const files = await File.find(query);
        console.log(`Found ${files.length} files in database`);
        
        // Log each file's details
        files.forEach(file => {
            console.log('File in database:', {
                id: file.id,
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

        const files = await File.find(query);
        res.json(files);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Download a file
exports.getFile = async (req, res) => {
    try {
        const file = await File.findById(req.params.id);
        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }

        // Set headers for file download
        res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
        res.setHeader('Content-Type', file.fileType === 'excel' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 
                                    file.fileType === 'csv' ? 'text/csv' : 'application/pdf');

        // Serve the file for download
        res.sendFile(file.path, { root: '.' });
    } catch (error) {
        console.error('Error downloading file:', error);
        res.status(500).json({ message: error.message });
    }
};

// View a file (for in-browser viewing)
exports.viewFile = async (req, res) => {
    try {
        const file = await File.findById(req.params.id);
        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }

        let contentType = 'application/octet-stream'; // Default content type
        if (file.fileType === 'pdf') {
            contentType = 'application/pdf';
        } else if (file.fileType === 'excel') {
            contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        } else if (file.fileType === 'csv') {
            contentType = 'text/csv';
        } else if (file.fileType === 'docx') {
            contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        }

        // Set headers for in-browser viewing
        res.setHeader('Content-Type', contentType);

        // Serve the file for viewing
        res.sendFile(file.path, { root: '.' });
    } catch (error) {
        console.error('Error viewing file:', error);
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
            id: file.id,
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
        const updates = {};
        if (req.body.category) updates.category = req.body.category;
        if (req.body.year) updates.year = parseInt(req.body.year);
        if (req.body.month) updates.month = parseInt(req.body.month);
        if (req.body.uploadedBy) updates.uploadedBy = req.body.uploadedBy;

        // If a new file is uploaded, update the file details
        if (req.file) {
            // Delete the old file
            await fs.unlink(file.path);
            
            // Update with new file details
            updates.filename = req.file.filename;
            updates.originalName = req.file.originalname;
            updates.fileType = isExcelMimeType(req.file.mimetype) ? 'excel' :
                      isCsvMimeType(req.file.mimetype) ? 'csv' :
                      isDocxMimeType(req.file.mimetype) ? 'docx' : 'pdf';
            updates.path = req.file.path;
            updates.size = req.file.size;
        }

        await file.update(updates);
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
        await file.delete();
        
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
        let fileContent;
        try {
            fileContent = await fs.readFile(file.path);
        } catch (readError) {
            console.error(`Error reading file ${file.path}:`, readError);
            return res.status(500).json({ message: 'Failed to read file content.', details: readError.message });
        }

        let data = [];
        let headers = [];

        if (file.fileType === 'csv') {
            // Parse CSV
            try {
                const records = parse(fileContent, {
                    columns: true,
                    skip_empty_lines: true
                });
                
                if (records.length > 0) {
                    headers = Object.keys(records[0]);
                    data = records;
                }
            } catch (parseError) {
                console.error('Error parsing CSV file:', parseError);
                return res.status(500).json({ message: 'Failed to parse CSV content.', details: parseError.message });
            }
        } else if (file.fileType === 'excel') {
            // Parse Excel
            let workbook;
            try {
                workbook = XLSX.read(fileContent, { type: 'buffer' });
            } catch (readXlsxError) {
                console.error('Error reading XLSX workbook:', readXlsxError);
                return res.status(500).json({ message: 'Failed to read Excel workbook. File might be corrupted or not a valid Excel file.', details: readXlsxError.message });
            }

            if (workbook.SheetNames.length === 0) {
                return res.status(400).json({ message: 'Excel file contains no sheets.' });
            }

            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            
            // Convert to JSON (array of arrays to preserve all columns)
            try {
                // Get raw data as array of arrays, including all cells
                const sheetData = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: true, defval: '' });
                
                if (sheetData.length > 0) {
                    // Assume the first non-empty row is the header row
                    let headerRow = sheetData[0];
                    // If the first row contains no meaningful headers, try to infer from first few rows or use generic names
                    if (headerRow.every(cell => !String(cell).trim())) {
                        // Fallback: If first row is empty, generate generic headers based on the longest row
                        const maxCols = sheetData.reduce((max, row) => Math.max(max, row.length), 0);
                        headers = Array.from({ length: maxCols }, (_, i) => `Column ${String.fromCharCode(65 + i)}`);
                        data = sheetData.map(row => {
                            const rowObject = {};
                            headers.forEach((header, index) => {
                                rowObject[header] = String(row[index] || '');
                            });
                            return rowObject;
                        });
                    } else {
                        // Use the first row as headers
                        headers = headerRow.map((h, i) => String(h).trim() || `Column ${String.fromCharCode(65 + i)}`);
                        // Process subsequent rows as data
                        data = sheetData.slice(1).map(row => {
                            const rowObject = {};
                            headers.forEach((header, index) => {
                                rowObject[header] = String(row[index] || '');
                            });
                            return rowObject;
                        });
                    }
                }
            } catch (jsonError) {
                console.error('Error converting Excel sheet to JSON:', jsonError);
                return res.status(500).json({ message: 'Failed to convert Excel sheet to JSON.', details: jsonError.message });
            }
        } else {
            return res.status(400).json({ message: 'Preview not supported for this file type' });
        }

        res.json({
            headers,
            data,
            totalRows: data.length,
            previewRows: data.length // previewRows will now be totalRows
        });
    } catch (error) {
        console.error('General error in getFilePreview:', error);
        res.status(500).json({ message: 'An unexpected error occurred during preview generation.', details: error.message });
    }
};