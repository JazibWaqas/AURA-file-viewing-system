const multer = require('multer');
const path = require('path');

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        try {
            // Create a folder structure: uploads/category/year/month
            const category = req.body.category || 'other';
            const year = req.body.year || new Date().getFullYear();
            const month = req.body.month || new Date().getMonth() + 1;
            
            const uploadPath = `./uploads/${category}/${year}/${month}`;
            
            console.log('Creating upload directory:', uploadPath);
            
            // Create directory if it doesn't exist
            require('fs').mkdirSync(uploadPath, { recursive: true });
            
            cb(null, uploadPath);
        } catch (error) {
            console.error('Error in storage destination:', error);
            cb(error);
        }
    },
    filename: function (req, file, cb) {
        try {
            // Create a more organized filename
            const date = new Date();
            const timestamp = date.toISOString().split('T')[0]; // YYYY-MM-DD
            const originalName = path.parse(file.originalname).name;
            const extension = path.extname(file.originalname);
            
            // Format: category_YYYY-MM-DD_originalname_extension
            const newFilename = `${req.body.category}_${timestamp}_${originalName}${extension}`;
            
            console.log('Generated filename:', newFilename);
            
            cb(null, newFilename);
        } catch (error) {
            console.error('Error in filename generation:', error);
            cb(error);
        }
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    console.log('Checking file type:', file.mimetype);
    
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
    
    if ([...excelTypes, ...pdfTypes, ...csvTypes].includes(file.mimetype)) {
        console.log('File type accepted');
        cb(null, true);
    } else {
        console.log('File type rejected:', file.mimetype);
        cb(new Error('Only Excel, CSV, and PDF files are allowed!'), false);
    }
};

// Error handling middleware
const handleMulterError = (err, req, res, next) => {
    console.error('Multer error:', err);
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
        files: 1 // Only one file at a time
    }
});

module.exports = {
    upload,
    handleMulterError
};