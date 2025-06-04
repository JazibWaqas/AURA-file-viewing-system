const multer = require('multer');
const path = require('path');

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Create a folder structure: uploads/category/year/month
        const category = req.body.category || 'other';
        const year = req.body.year || new Date().getFullYear();
        const month = req.body.month || new Date().getMonth() + 1;
        
        const uploadPath = `./uploads/${category}/${year}/${month}`;
        
        // Create directory if it doesn't exist
        require('fs').mkdirSync(uploadPath, { recursive: true });
        
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        // Create a more organized filename
        const date = new Date();
        const timestamp = date.toISOString().split('T')[0]; // YYYY-MM-DD
        const originalName = path.parse(file.originalname).name;
        const extension = path.extname(file.originalname);
        
        // Format: category_YYYY-MM-DD_originalname_extension
        const newFilename = `${req.body.category}_${timestamp}_${originalName}${extension}`;
        
        cb(null, newFilename);
    }
});

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
    
    if ([...excelTypes, ...pdfTypes].includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only Excel and PDF files are allowed!'), false);
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
        files: 10 // Only one file at a time
    }
});

module.exports = {
    upload,
    handleMulterError
};