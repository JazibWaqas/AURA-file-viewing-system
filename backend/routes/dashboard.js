const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

// Yearly summary routes
router.post('/yearly-summary', dashboardController.addYearlySummary);
router.get('/yearly-summary', dashboardController.getYearlySummaries);

// Funding sources routes
router.post('/funding-sources', dashboardController.addFundingSources);
router.get('/funding-sources', dashboardController.getFundingSources);

module.exports = router; 