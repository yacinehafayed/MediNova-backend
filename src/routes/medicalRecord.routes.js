const express = require('express');
const { protect } = require('../../middleware/authMiddleware');
const medicalRecordController = require('../controllers/medicalRecord.controller');

const router = express.Router();

router.get('/', protect, medicalRecordController.getMedicalRecord);

router.put('/', protect, medicalRecordController.updateMedicalRecord);

module.exports = router;
