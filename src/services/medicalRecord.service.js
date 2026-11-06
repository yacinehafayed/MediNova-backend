const MedicalRecord = require('../models/MedicalRecord');

const getMedicalRecord = async (userId) => {
  let record = await MedicalRecord.findOne({ user: userId });

  if (!record) {
    record = await MedicalRecord.create({ user: userId });
  }

  return record;
};

const updateMedicalRecord = async (userId, data) => {
  let record = await MedicalRecord.findOne({ user: userId });

  if (!record) {
    record = new MedicalRecord({ user: userId });
  }

  record.bloodType = data.bloodType ?? record.bloodType;
  record.allergies = data.allergies ?? record.allergies;
  record.chronicDiseases = data.chronicDiseases ?? record.chronicDiseases;
  record.medicalHistory = data.medicalHistory ?? record.medicalHistory;
  record.currentTreatments = data.currentTreatments ?? record.currentTreatments;

  if (data.doctor) {
    record.doctor = {
      ...record.doctor.toObject(),
      ...data.doctor,
    };
  }

  if (data.documents !== undefined) {
    record.documents = data.documents;
  }

  return record.save();
};

module.exports = {
  getMedicalRecord,
  updateMedicalRecord,
};
