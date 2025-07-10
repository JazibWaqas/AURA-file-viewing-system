const express = require('express');
const router = express.Router();
const chartDataController = require('../controllers/chartDataController');

router.get('/', chartDataController.getAll);
router.post('/', chartDataController.create);
router.put('/:id', chartDataController.update);

module.exports = router; 