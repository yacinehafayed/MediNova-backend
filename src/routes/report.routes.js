const express = require('express');
const { protect } = require('../../middleware/authMiddleware');
const reportController = require('../controllers/report.controller');

const router = express.Router();

router.get('/', protect, reportController.getReport);

module.exports = router;
