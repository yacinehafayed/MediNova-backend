const express = require('express');
const { protect } = require('../../middleware/authMiddleware');
const aiController = require('../controllers/ai.controller');

const router = express.Router();

router.post('/chat', protect, aiController.chat);

module.exports = router;
