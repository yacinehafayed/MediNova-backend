const Measurement = require('../models/Measurement');
const Analysis = require('../models/Analysis');
const Medication = require('../models/Medication');

const calculateStats = (values) => {
  const validValues = values.filter(
    (value) => typeof value === 'number' && Number.isFinite(value)
  );

  if (validValues.length === 0) return null;

  return {
    min: Math.min(...validValues),
    max: Math.max(...validValues),
    avg: validValues.reduce((sum, value) => sum + value, 0) / validValues.length,
  };
};

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

  const groupedStats = {};

  measurements.forEach((measurement) => {
    const type = measurement.type;

    if (!groupedStats[type]) {
      groupedStats[type] = {
        unit: measurement.unit,
        count: 0,
        values: [],
        systolicValues: [],
        diastolicValues: [],
      };
    }

    const stat = groupedStats[type];
    stat.count++;

    if (type === 'blood_pressure') {
      if (Number.isFinite(measurement.systolic)) {
        stat.systolicValues.push(measurement.systolic);
      }

      if (Number.isFinite(measurement.diastolic)) {
        stat.diastolicValues.push(measurement.diastolic);
      }
    } else if (Number.isFinite(measurement.value)) {
      stat.values.push(measurement.value);
    }
  });

  const formattedStats = {};

  Object.keys(groupedStats).forEach((type) => {
    const stat = groupedStats[type];

    if (type === 'blood_pressure') {
      formattedStats[type] = {
        unit: stat.unit,
        count: stat.count,
        systolic: calculateStats(stat.systolicValues),
        diastolic: calculateStats(stat.diastolicValues),
      };
    } else {
      const values = calculateStats(stat.values);

      if (values) {
        formattedStats[type] = {
          unit: stat.unit,
          count: stat.count,
          ...values,
        };
      }
    }
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
