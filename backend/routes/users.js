const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Route to handle user login/creation
router.post('/login', userController.handleUserLogin);

// Routes for the approval email links
router.get('/approve/:userId', userController.approveUser);
router.get('/deny/:userId', userController.denyUser);

// Route to check a user's status
router.get('/status/:userId', userController.getUserStatus);

module.exports = router; 