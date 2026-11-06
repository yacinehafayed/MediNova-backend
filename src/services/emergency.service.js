const EmergencyInfo = require('../models/EmergencyInfo');

const getEmergencyInfo = async (userId) => {
  let info = await EmergencyInfo.findOne({ user: userId });

  if (!info) {
    info = await EmergencyInfo.create({ user: userId });
  }

  return info;
};

const updateEmergencyInfo = async (userId, data) => {
  let info = await EmergencyInfo.findOne({ user: userId });

  if (!info) {
    info = new EmergencyInfo({ user: userId });
  }

  info.contactName = data.contactName ?? info.contactName;
  info.contactPhone = data.contactPhone ?? info.contactPhone;
  info.bloodType = data.bloodType ?? info.bloodType;
  info.allergies = data.allergies ?? info.allergies;
  info.importantTreatments =
    data.importantTreatments ?? info.importantTreatments;

  return info.save();
};

module.exports = {
  getEmergencyInfo,
  updateEmergencyInfo,
};
