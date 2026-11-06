const reportService = require('../services/report.service');

const getReport = async (req, res, next) => {
  try {
    const report = await reportService.getUserReport(
      req.user._id,
      req.query
    );

    res.status(200).json(report);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getReport,
};
