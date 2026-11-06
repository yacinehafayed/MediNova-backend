
const medicationService = require('../services/medication.service');

const getMedications = async (req, res, next) => {
  try {
    const medications = await medicationService.getUserMedications(
      req.user._id
    );

    res.status(200).json(medications);
  } catch (error) {
    next(error);
  }
};

const createMedication = async (req, res, next) => {
  try {
    const medication = await medicationService.createMedication(
      req.user._id,
      req.body
    );

    res.status(201).json(medication);
  } catch (error) {
    next(error);
  }
};

const markMedication = async (req, res, next) => {
  try {
    const medication = await medicationService.markMedication(
      req.params.id,
      req.user._id,
      req.body
    );

    res.status(200).json(medication);
  } catch (error) {
    next(error);
  }
};

const deleteMedication = async (req, res, next) => {
  try {
    const result = await medicationService.deleteMedication(
      req.params.id,
      req.user._id
    );

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMedications,
  createMedication,
  markMedication,
  deleteMedication,
};
