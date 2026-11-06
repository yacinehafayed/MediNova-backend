const Measurement = require('../models/Measurement');
const Analysis = require('../models/Analysis');
const Medication = require('../models/Medication');

const getUserReport = async (userId, query) => {
  const { start, end } = query;

  const startDate = start
    ? new Date(start)
    : new Date(Date.now() - 30 * 86400000);

  const endDate = end ? new Date(end) : new Date();

  if (
    Number.isNaN(startDate.getTime()) ||
    Number.isNaN(endDate.getTime()) ||
    startDate > endDate
  ) {
    const error = new Error('Période invalide.');
    error.statusCode = 400;
    throw error;
  }

  const measurements = await Measurement.find({
    user: userId,
    date: { $gte: startDate, $lte: endDate },
  }).sort({ date: 1 });

  const analyses = await Analysis.find({
    user: userId,
    date: { $gte: startDate, $lte: endDate },
  }).sort({ date: 1 });

  const medications = await Medication.find({ user: userId });

  const stats = {};

  measurements.forEach((measurement) => {
    if (!stats[measurement.type]) {
      stats[measurement.type] = {
        values: [],
        unit: measurement.unit,
      };
    }

    stats[measurement.type].values.push(measurement.value);
  });

  const formattedStats = {};

  Object.keys(stats).forEach((type) => {
    const values = stats[type].values;

    formattedStats[type] = {
      unit: stats[type].unit,
      count: values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      avg: values.reduce((sum, value) => sum + value, 0) / values.length,
    };
  });

  return {
    period: {
      start: startDate,
      end: endDate,
    },
    measurements,
    analyses,
    medications,
    stats: formattedStats,
    totalMeasures: measurements.length,
    totalAnalyses: analyses.length,
  };
};

module.exports = {
  getUserReport,
};
