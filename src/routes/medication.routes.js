
const express = require('express');
const { protect } = require('../../middleware/authMiddleware');
const medicationController = require('../controllers/medication.controller');

const router = express.Router();

router.get('/', protect, medicationController.getMedications);

router.post('/', protect, medicationController.createMedication);

router.put('/:id/mark', protect, medicationController.markMedication);

router.delete('/:id', protect, medicationController.deleteMedication);

module.exports = router;
