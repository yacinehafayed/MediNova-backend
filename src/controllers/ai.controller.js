const aiService = require('../services/ai.service');

const chat = async (req, res, next) => {
  try {
    const { messages } = req.body;

    const reply = await aiService.generateResponse(messages);

    res.status(200).json({
      success: true,
      reply,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  chat,
};
