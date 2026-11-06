const express = require('express');
const { protect } = require('../../middleware/authMiddleware');
const emergencyController = require('../controllers/emergency.controller');

const router = express.Router();

router.get('/', protect, emergencyController.getEmergencyInfo);

router.put('/', protect, emergencyController.updateEmergencyInfo);

module.exports = router;
