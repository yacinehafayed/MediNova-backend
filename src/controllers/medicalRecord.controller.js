const medicalRecordService = require('../services/medicalRecord.service');

const getMedicalRecord = async (req, res, next) => {
  try {
    const record = await medicalRecordService.getMedicalRecord(
      req.user._id
    );

    res.status(200).json(record);
  } catch (error) {
    next(error);
  }
};

const updateMedicalRecord = async (req, res, next) => {
  try {
    const record = await medicalRecordService.updateMedicalRecord(
      req.user._id,
      req.body
    );

    res.status(200).json(record);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMedicalRecord,
  updateMedicalRecord,
};
