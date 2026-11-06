const authService = require('../services/auth.service');

const handleError = (res, err) => {
  res.status(err.statusCode || 500).json({
    message: err.message || 'Erreur serveur.',
    ...(err.code ? { error: err.message } : {}),
  });
};

const register = async (req, res) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  } catch (err) {
    handleError(res, err);
  }
};

const login = async (req, res) => {
  try {
    res.json(await authService.login(req.body));
  } catch (err) {
    handleError(res, err);
  }
};

const getProfile = (req, res) => {
  res.json(authService.getProfile(req.user));
};

const updateProfile = async (req, res) => {
  try {
    res.json(await authService.updateProfile(req.user._id, req.body));
  } catch (err) {
    handleError(res, err);
  }
};

const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    res.json(
      await authService.changePassword(
        req.user._id,
        oldPassword,
        newPassword
      )
    );
  } catch (err) {
    handleError(res, err);
  }
};

const forgotPassword = async (req, res) => {
  try {
    res.json(await authService.forgotPassword(req.body.email));
  } catch (err) {
    handleError(res, err);
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    res.json(
      await authService.resetPassword(email, code, newPassword)
    );
  } catch (err) {
    handleError(res, err);
  }
};

const socialLogin = async (req, res) => {
  try {
    res.json(await authService.socialLogin(req.body));
  } catch (err) {
    handleError(res, err);
  }
};

const updateSettings = async (req, res) => {
  try {
    res.json(
      await authService.updateSettings(req.user._id, req.body)
    );
  } catch (err) {
    handleError(res, err);
  }
};

const deleteAccount = async (req, res) => {
  try {
    res.json(await authService.deleteAccount(req.user._id));
  } catch (err) {
    handleError(res, err);
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  socialLogin,
  updateSettings,
  deleteAccount,
};