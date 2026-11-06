const Notification = require('../models/Notification');
const Appointment = require('../models/Appointment');
const Medication = require('../models/Medication');

const getNotifications = async (userId) => {
  return Notification.find({ user: userId }).sort({ createdAt: -1 });
};

const markAsRead = async (notificationId, userId) => {
  const notification = await Notification.findOne({
    _id: notificationId,
    user: userId,
  });

  if (!notification) {
    const error = new Error('Notification introuvable.');
    error.statusCode = 404;
    throw error;
  }

  notification.read = true;
  return notification.save();
};

const markAllAsRead = async (userId) => {
  await Notification.updateMany(
    { user: userId, read: false },
    { $set: { read: true } }
  );

  return { message: 'Toutes les notifications sont lues.' };
};

const createNotification = async (userId, data) => {
  const { type, title, message, level } = data;

  return Notification.create({
    user: userId,
    type,
    title,
    message,
    level: level || 'info',
  });
};

const deleteNotification = async (notificationId, userId) => {
  const notification = await Notification.findOneAndDelete({
    _id: notificationId,
    user: userId,
  });

  if (!notification) {
    const error = new Error('Notification introuvable.');
    error.statusCode = 404;
    throw error;
  }

  return {
    success: true,
    message: 'Notification supprimée.',
  };
};

const checkReminders = async (userId) => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const appointments = await Appointment.find({ user: userId });

  for (const appointment of appointments) {
    const appointmentDate = new Date(appointment.date)
      .toISOString()
      .split('T')[0];

    if (appointmentDate === tomorrowStr) {
      const exists = await Notification.findOne({
        user: userId,
        type: 'appointment',
        message: {
          $regex: appointment.doctor,
          $options: 'i',
        },
      });

      if (!exists) {
        await Notification.create({
          user: userId,
          type: 'appointment',
          title: 'Rendez-vous demain',
          message: `Rappel : Rendez-vous avec ${appointment.doctor} (${appointment.specialty}) demain.`,
          level: 'warning',
        });
      }
    }
  }

  const medications = await Medication.find({ user: userId });
  const today = new Date();

  for (const medication of medications) {
    if (
      today >= new Date(medication.startDate) &&
      today <= new Date(medication.endDate)
    ) {
      const exists = await Notification.findOne({
        user: userId,
        type: 'medication',
        message: {
          $regex: medication.name,
          $options: 'i',
        },
      });

      if (!exists) {
        await Notification.create({
          user: userId,
          type: 'medication',
          title: 'Rappel de médicament',
          message: `N'oubliez pas de prendre ${medication.name} (${medication.dosage}).`,
          level: 'info',
        });
      }
    }
  }

  return {
    success: true,
    message: 'Vérification terminée.',
  };
};

const createTestNotifications = async (userId) => {
  await Notification.create([
    {
      user: userId,
      type: 'appointment',
      title: 'Rappel de rendez-vous',
      message: 'Vous avez un rendez-vous avec Dr. Sarah Lee demain à 16:30.',
      level: 'info',
      read: false,
    },
    {
      user: userId,
      type: 'medication',
      title: 'Prise de médicament',
      message: "N'oubliez pas de prendre votre Paracétamol (500mg).",
      level: 'warning',
      read: false,
    },
    {
      user: userId,
      type: 'alert',
      title: 'Tension élevée',
      message: 'Votre tension a été mesurée à 150 mmHg.',
      level: 'danger',
      read: false,
    },
  ]);

  return { message: '3 notifications de test créées.' };
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
