const emergencyService = require('../services/emergency.service');

const getEmergencyInfo = async (req, res, next) => {
  try {
    const info = await emergencyService.getEmergencyInfo(req.user._id);

    res.status(200).json(info);
  } catch (error) {
    next(error);
  }
};

const updateEmergencyInfo = async (req, res, next) => {
  try {
    const info = await emergencyService.updateEmergencyInfo(
      req.user._id,
      req.body
    );

    res.status(200).json(info);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEmergencyInfo,
  updateEmergencyInfo,
};
