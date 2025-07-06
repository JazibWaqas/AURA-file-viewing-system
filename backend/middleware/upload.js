const multer = require('multer');
const path = require('path');

// Configure storage - using memory storage for Firebase Storage compatibility
const storage = multer.memoryStorage();

// File filter
const fileFilter = (req, file, cb) => {
    // Accept Excel files (both .xlsx and .xls)
    const excelTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
        'application/vnd.ms-excel', // .xls
        'application/vnd.ms-excel.sheet.macroEnabled.12', // .xlsm
        'application/vnd.ms-excel.sheet.binary.macroEnabled.12' // .xlsb
    ];
    
    // Accept PDF files
    const pdfTypes = [
        'application/pdf'
    ];

    // Accept CSV files
    const csvTypes = [
        'text/csv',
        'application/csv',
        'text/x-csv',
        'application/x-csv',
        'text/comma-separated-values',
        'text/x-comma-separated-values'
    ];
    
    // Accept Word files (DOCX and DOC)
    const wordTypes = [
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
        'application/msword' // .doc
    ];
    
    if ([...excelTypes, ...pdfTypes, ...csvTypes, ...wordTypes].includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only Excel, CSV, PDF, DOCX, and DOC files are allowed!'), false);
    }
};

// Error handling middleware
const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                message: 'File is too large. Maximum size is 50MB.'
            });
        }
        return res.status(400).json({
            message: err.message
        });
    }
    next(err);
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit
        files: 10 // Allow up to 10 files at a time
    }
});

module.exports = {
    upload,
    handleMulterError
};