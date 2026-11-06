
const Alert = require('../models/Alert');

const thresholds = {
  heart_rate: {
    warning: 100,
    danger: 120,
    unit: 'bpm',
    label: 'rythme cardiaque',
  },
  blood_pressure: {
    warning: 130,
    danger: 140,
    unit: 'mmHg',
    label: 'tension artérielle',
  },
  weight: {
    warning: 150,
    danger: 180,
    unit: 'kg',
    label: 'poids',
  },
  blood_sugar: {
    warning: 1.1,
    danger: 1.5,
    unit: 'g/L',
    label: 'glycémie',
  },
};

const getUserAlerts = async (userId) => {
  return Alert.find({ user: userId }).sort({ createdAt: -1 });
};

const markAlertAsRead = async (alertId, userId) => {
  const alert = await Alert.findOne({
    _id: alertId,
    user: userId,
  });

  if (!alert) {
    const error = new Error('Alerte introuvable.');
    error.statusCode = 404;
    throw error;
  }

  alert.read = true;
  await alert.save();

  return alert;
};

const checkMeasurement = async (userId, type, value) => {
  const threshold = thresholds[type];

  if (!threshold) {
    return { alert: null };
  }

  let alertData = null;

  if (value >= threshold.danger) {
    alertData = {
      title: '⚠️ Alerte critique',
      message: `Votre ${threshold.label} est critique (${value} ${threshold.unit}). Consultez immédiatement un professionnel de santé.`,
      level: 'danger',
    };
  } else if (value > threshold.warning) {
    alertData = {
      title: 'Valeur élevée',
      message: `Votre ${threshold.label} dépasse le seuil recommandé (${value} ${threshold.unit}). Surveillez votre état.`,
      level: 'warning',
    };
  }

  if (!alertData) {
    return { alert: null };
  }

  const alert = await Alert.create({
    user: userId,
    ...alertData,
  });

  return { alert };
};

module.exports = {
  getUserAlerts,
  markAlertAsRead,
  checkMeasurement,
};
