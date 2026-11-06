const notificationService = require('../services/notification.service');

const getNotifications = async (req, res, next) => {
  try {
    const notifications = await notificationService.getNotifications(
      req.user._id
    );
    res.status(200).json(notifications);
  } catch (error) {
    next(error);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const notification = await notificationService.markAsRead(
      req.params.id,
      req.user._id
    );
    res.status(200).json(notification);
  } catch (error) {
    next(error);
  }
};

const markAllAsRead = async (req, res, next) => {
  try {
    const result = await notificationService.markAllAsRead(req.user._id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const createNotification = async (req, res, next) => {
  try {
    const notification = await notificationService.createNotification(
      req.user._id,
      req.body
    );
    res.status(201).json(notification);
  } catch (error) {
    next(error);
  }
};

const deleteNotification = async (req, res, next) => {
  try {
    const result = await notificationService.deleteNotification(
      req.params.id,
      req.user._id
    );
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const checkReminders = async (req, res, next) => {
  try {
    const result = await notificationService.checkReminders(req.user._id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const createTestNotifications = async (req, res, next) => {
  try {
    const result = await notificationService.createTestNotifications(
      req.user._id
    );
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  createNotification,
  deleteNotification,
  checkReminders,
  createTestNotifications,
};
