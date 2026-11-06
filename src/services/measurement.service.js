const Measurement = require('../models/Measurement');

const getUserMeasurements = async (userId) => {
  return Measurement.find({ user: userId }).sort({ date: -1 });
};

const createMeasurement = async (userId, data) => {
  const { type, value, unit } = data;

  if (!type || value === undefined || !unit) {
    const error = new Error('Type, valeur et unité requis.');
    error.statusCode = 400;
    throw error;
  }

  return Measurement.create({
    user: userId,
    type,
    value,
    unit,
  });
};

const deleteMeasurement = async (measurementId, userId) => {
  const measurement = await Measurement.findOne({
    _id: measurementId,
    user: userId,
  });

  if (!measurement) {
    const error = new Error('Mesure introuvable.');
    error.statusCode = 404;
    throw error;
  }

  await measurement.deleteOne();

  return { message: 'Mesure supprimée.' };
};

module.exports = {
  getUserMeasurements,
  createMeasurement,
  deleteMeasurement,
};