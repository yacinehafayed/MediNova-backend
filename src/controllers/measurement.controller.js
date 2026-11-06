const measurementService = require('../services/measurement.service');

const getMeasurements = async (req, res, next) => {
  try {
    const measurements = await measurementService.getUserMeasurements(
      req.user._id
    );

    res.status(200).json(measurements);
  } catch (error) {
    next(error);
  }
};

const createMeasurement = async (req, res, next) => {
  try {
    const measurement = await measurementService.createMeasurement(
      req.user._id,
      req.body
    );

    res.status(201).json(measurement);
  } catch (error) {
    next(error);
  }
};

const deleteMeasurement = async (req, res, next) => {
  try {
    const result = await measurementService.deleteMeasurement(
      req.params.id,
      req.user._id
    );

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMeasurements,
  createMeasurement,
  deleteMeasurement,
};