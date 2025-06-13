const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const path = require('path');
const categoryController = require('./controllers/categoryController');
const { handleMulterError } = require('./middleware/upload');
const mongoose = require('mongoose');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create necessary directories
const directories = [
    './uploads',
    './uploads/temp',
    './logs'
];

directories.forEach(dir => {
    if (!require('fs').existsSync(dir)) {
        require('fs').mkdirSync(dir, { recursive: true });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
});

// Handle multer errors
app.use(handleMulterError);

// Routes
app.use('/api/files', require('./routes/files'));
app.use('/api/categories', require('./routes/categories'));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        timestamp: new Date(),
        uptime: process.uptime(),
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

// Initialize default categories
categoryController.initializeDefaultCategories()
    .then(() => {
        console.log('Default categories initialized successfully');
    })
    .catch(error => {
        console.error('Error initializing default categories:', error);
    });

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Promise Rejection:', err);
    // Don't crash the server, just log the error
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    // Give the server time to log the error before shutting down
    setTimeout(() => {
        process.exit(1);
    }, 1000);
});

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
        console.log('Process terminated');
    });
});

module.exports = app; // For testing purposes