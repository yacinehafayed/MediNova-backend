const appointmentService = require('../services/appointment.service');

const getAppointments = async (req, res, next) => {
  try {
    const appointments = await appointmentService.getUserAppointments(
      req.user._id
    );

    res.status(200).json(appointments);
  } catch (error) {
    next(error);
  }
};

const createAppointment = async (req, res, next) => {
  try {
    const appointment = await appointmentService.createAppointment(
      req.user._id,
      req.body
    );

    res.status(201).json(appointment);
  } catch (error) {
    next(error);
  }
};

const deleteAppointment = async (req, res, next) => {
  try {
    const result = await appointmentService.deleteAppointment(
      req.params.id,
      req.user._id
    );

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAppointments,
  createAppointment,
  deleteAppointment,
};