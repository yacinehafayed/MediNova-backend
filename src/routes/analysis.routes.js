const express = require('express');
const { protect } = require('../../middleware/authMiddleware');
const analysisController = require('../controllers/analysis.controller');

const router = express.Router();

router.get('/', protect, analysisController.getAnalyses);

router.post('/', protect, analysisController.createAnalysis);

router.delete('/:id', protect, analysisController.deleteAnalysis);

module.exports = router;
