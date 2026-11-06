const Analysis = require('../models/Analysis');

const getUserAnalyses = async (userId) => {
  return Analysis.find({ user: userId }).sort({ date: -1 });
};

const createAnalysis = async (userId, data) => {
  const { name, value, unit, reference, date, notes } = data;

  if (!name || value === undefined || !unit || !date) {
    const error = new Error('Champs requis manquants.');
    error.statusCode = 400;
    throw error;
  }

  return Analysis.create({
    user: userId,
    name,
    value,
    unit,
    reference,
    date,
    notes,
  });
};

const deleteAnalysis = async (analysisId, userId) => {
  const analysis = await Analysis.findOne({
    _id: analysisId,
    user: userId,
  });

  if (!analysis) {
    const error = new Error('Analyse introuvable.');
    error.statusCode = 404;
    throw error;
  }

  await analysis.deleteOne();

  return { message: 'Analyse supprimée.' };
};

module.exports = {
  getUserAnalyses,
  createAnalysis,
  deleteAnalysis,
};
