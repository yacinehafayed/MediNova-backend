
const express = require('express');
const { protect } = require('../../middleware/authMiddleware');
const alertController = require('../controllers/alert.controller');

const router = express.Router();

router.get('/', protect, alertController.getAlerts);

router.put('/:id/read', protect, alertController.markAlertAsRead);

router.post('/check', protect, alertController.checkMeasurement);

module.exports = router;
