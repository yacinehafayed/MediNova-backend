const analysisService = require('../services/analysis.service');

const getAnalyses = async (req, res, next) => {
  try {
    const analyses = await analysisService.getUserAnalyses(req.user._id);
    res.status(200).json(analyses);
  } catch (error) {
    next(error);
  }
};

const createAnalysis = async (req, res, next) => {
  try {
    const analysis = await analysisService.createAnalysis(
      req.user._id,
      req.body
    );

    res.status(201).json(analysis);
  } catch (error) {
    next(error);
  }
};

const deleteAnalysis = async (req, res, next) => {
  try {
    const result = await analysisService.deleteAnalysis(
      req.params.id,
      req.user._id
    );

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAnalyses,
  createAnalysis,
  deleteAnalysis,
};
