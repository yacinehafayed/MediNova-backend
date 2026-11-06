
const alertService = require('../services/alert.service');

const getAlerts = async (req, res, next) => {
  try {
    const alerts = await alertService.getUserAlerts(req.user._id);

    res.status(200).json(alerts);
  } catch (error) {
    next(error);
  }
};

const markAlertAsRead = async (req, res, next) => {
  try {
    const alert = await alertService.markAlertAsRead(
      req.params.id,
      req.user._id
    );

    res.status(200).json(alert);
  } catch (error) {
    next(error);
  }
};

const checkMeasurement = async (req, res, next) => {
  try {
    const { type, value } = req.body;

    const result = await alertService.checkMeasurement(
      req.user._id,
      type,
      value
    );

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAlerts,
  markAlertAsRead,
  checkMeasurement,
};
