const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

// Yearly summary routes
router.post('/yearly-summary', dashboardController.addYearlySummary);
router.get('/yearly-summary', dashboardController.getYearlySummaries);

// Funding sources routes
router.post('/funding-sources', dashboardController.addFundingSources);
router.get('/funding-sources', dashboardController.getFundingSources);

// Storage statistics routes
router.get('/storage-stats', dashboardController.getStorageStats);
router.post('/storage-stats/update', dashboardController.updateStorageStats);

// Patient data routes
router.get('/patient-data', dashboardController.getPatientData);
router.post('/patient-data', dashboardController.addPatientData);

//Delete Data

router.delete('/yearly-summary/:year', dashboardController.deleteYearlySummary);
router.delete('/funding-sources/:year', dashboardController.deleteFundingSources);

module.exports = router; 