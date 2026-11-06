const Appointment = require('../models/Appointment');

const getUserAppointments = async (userId) => {
  return Appointment.find({ user: userId }).sort({ date: 1 });
};

const createAppointment = async (userId, data) => {
  const { doctor, specialty, date, location, mode } = data;

  if (!doctor || !specialty || !date) {
    const error = new Error('Champs requis manquants.');
    error.statusCode = 400;
    throw error;
  }

  const appointmentDate = new Date(date);

  if (Number.isNaN(appointmentDate.getTime())) {
    const error = new Error('Date invalide.');
    error.statusCode = 400;
    throw error;
  }

  return Appointment.create({
    user: userId,
    doctor,
    specialty,
    date: appointmentDate,
    location,
    mode,
  });
};

const deleteAppointment = async (appointmentId, userId) => {
  const appointment = await Appointment.findOne({
    _id: appointmentId,
    user: userId,
  });

  if (!appointment) {
    const error = new Error('RDV introuvable.');
    error.statusCode = 404;
    throw error;
  }

  await appointment.deleteOne();

  return { message: 'Rendez-vous supprimé.' };
};

module.exports = {
  getUserAppointments,
  createAppointment,
  deleteAppointment,
};