const express = require('express');
const controller = require('../controllers/auth.controller');
const { protect } = require('../../middleware/authMiddleware');

const router = express.Router();

router.post('/register', controller.register);
router.post('/login', controller.login);

router.get('/profile', protect, controller.getProfile);
router.put('/profile', protect, controller.updateProfile);

router.put('/change-password', protect, controller.changePassword);

router.post('/forgot-password', controller.forgotPassword);
router.post('/reset-password', controller.resetPassword);

router.post('/social-login', controller.socialLogin);

router.put('/settings', protect, controller.updateSettings);

router.delete('/delete-account', protect, controller.deleteAccount);

module.exports = router;