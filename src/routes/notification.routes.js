const express = require('express');
const { protect } = require('../../middleware/authMiddleware');
const notificationController = require('../controllers/notification.controller');

const router = express.Router();

router.get('/', protect, notificationController.getNotifications);

router.put('/read-all', protect, notificationController.markAllAsRead);

router.put('/:id/read', protect, notificationController.markAsRead);

router.post('/check-reminders', protect, notificationController.checkReminders);

router.post('/test', protect, notificationController.createTestNotifications);

router.post('/', protect, notificationController.createNotification);

router.delete('/:id', protect, notificationController.deleteNotification);

module.exports = router;
