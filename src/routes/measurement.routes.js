const express = require('express');
const { protect } = require('../../middleware/authMiddleware');
const measurementController = require('../controllers/measurement.controller');

const router = express.Router();

router.get('/', protect, measurementController.getMeasurements);
router.post('/', protect, measurementController.createMeasurement);
router.delete('/:id', protect, measurementController.deleteMeasurement);

module.exports = router;