
const Medication = require('../models/Medication');

const getUserMedications = async (userId) => {
  return Medication.find({ user: userId })
    .sort({ startDate: -1 });
};

const createMedication = async (userId, data) => {
  const {
    name,
    description,
    dosage,
    times,
    daysOfWeek,
    startDate,
    endDate,
  } = data;

  if (
    !name ||
    !dosage ||
    !Array.isArray(times) ||
    times.length === 0 ||
    !Array.isArray(daysOfWeek) ||
    daysOfWeek.length === 0 ||
    !daysOfWeek.every((day) => Number.isInteger(day) && day >= 0 && day <= 6) ||
    !startDate ||
    !endDate
  ) {
    const error = new Error('Champs requis manquants.');
    error.statusCode = 400;
    throw error;
  }

  return Medication.create({
    user: userId,
    name,
    description,
    dosage,
    times,
    daysOfWeek,
    startDate,
    endDate,
  });
};

const markMedication = async (medicationId, userId, data) => {
  const medication = await Medication.findOne({
    _id: medicationId,
    user: userId,
  });

  if (!medication) {
    const error = new Error('Médicament introuvable.');
    error.statusCode = 404;
    throw error;
  }

  medication.taken.push({
    date: data.date,
    time: data.time,
    status: data.status,
  });

  return medication.save();
};

const deleteMedication = async (medicationId, userId) => {
  const medication = await Medication.findOne({
    _id: medicationId,
    user: userId,
  });

  if (!medication) {
    const error = new Error('Médicament introuvable.');
    error.statusCode = 404;
    throw error;
  }

  await medication.deleteOne();

  return { message: 'Médicament supprimé.' };
};

module.exports = {
  getUserMedications,
  createMedication,
  markMedication,
  deleteMedication,
};
