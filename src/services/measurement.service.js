const Measurement = require('../models/Measurement');

const getUserMeasurements = async (userId) => {
  return Measurement.find({ user: userId }).sort({ date: -1 });
};

const createMeasurement = async (userId, data) => {
  const {  type,  value,  systolic,  diastolic,  unit,  mealTiming,} = data;

  const allowedTypes = [  'heart_rate',  'blood_pressure',  'weight',  'blood_sugar',];

  const invalid = (message) => {
    const error = new Error(message);
    error.statusCode = 400;
    throw error;
  };

  if (!allowedTypes.includes(type)) {
    invalid('Type de mesure invalide.');
  }

  if (!unit || typeof unit !== 'string') {
    invalid('Unité requise.');
  }

  if (type === 'blood_pressure') {
    if (
      !Number.isFinite(systolic) ||
      !Number.isFinite(diastolic) ||
      systolic < 50 ||
      systolic > 300 ||
      diastolic < 30 ||
      diastolic > 200 ||
      systolic <= diastolic
    ) {
      invalid( 'Valeurs de tension invalides. Vérifiez les nombres saisis en mmHg.' );
    }

    return Measurement.create({ user: userId, type, systolic, diastolic, unit, });
  }

  if (type === 'heart_rate') {
    if (!Number.isFinite(value) || value < 20 || value > 250) {
      invalid( 'Fréquence cardiaque invalide. Vérifiez la valeur saisie en bpm.' );
    }
  }

  if (type === 'weight') {
    if (!Number.isFinite(value) || value < 2 || value > 300) {
      invalid( 'Poids invalide. Vérifiez la valeur saisie en kilogrammes.' );
    }
  }

  if (type === 'blood_sugar') {
    if (!Number.isFinite(value) || value < 0.1 || value > 10) {
      invalid( 'Glycémie invalide. Vérifiez la valeur saisie en g/L.');
    }

    if (!['fasting', 'after_meal'].includes(mealTiming)) {
      invalid( 'Veuillez préciser si la glycémie a été mesurée à jeun ou après le repas.' );
    }
  }

  return Measurement.create({ user: userId, type, value, ...(type === 'blood_sugar' && { mealTiming }), unit, });
};

const deleteMeasurement = async (measurementId, userId) => {
  const measurement = await Measurement.findOne({ _id: measurementId, user: userId, });

  if (!measurement) {
    const error = new Error('Mesure introuvable.');
    error.statusCode = 404;
    throw error;
  }

  await measurement.deleteOne();

  return { message: 'Mesure supprimée.' };
};

module.exports = {  getUserMeasurements,  createMeasurement,  deleteMeasurement,};
