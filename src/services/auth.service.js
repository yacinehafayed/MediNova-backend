const mongoose = require('mongoose');

const Analysis = require('../models/Analysis');
const Medication = require('../models/Medication');
const Alert = require('../models/Alert');
const Notification = require('../models/Notification');
const EmergencyInfo = require('../models/EmergencyInfo');
const MedicalRecord = require('../models/MedicalRecord');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Measurement = require('../models/Measurement');
const Appointment = require('../models/Appointment');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

const register = async ({ name, email, password }) => {
  if (!name || !email || !password) {
    throw new Error('Tous les champs sont requis.');
  }

  if (password.length < 6) {
    throw new Error('Le mot de passe doit faire au moins 6 caractères.');
  }

  const normalizedEmail = email.trim().toLowerCase();

  const userExists = await User.findOne({ email: normalizedEmail });
  if (userExists) {
    throw new Error('Cet email est déjà utilisé.');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email: normalizedEmail,
    password: hashedPassword,
  });

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    token: generateToken(user._id),
  };
};

const login = async ({ email, password }) => {
  if (!email || !password) {
    throw new Error('Email et mot de passe requis.');
  }

  const user = await User.findOne({
    email: email.trim().toLowerCase(),
  });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    const error = new Error('Email ou mot de passe incorrect.');
    error.statusCode = 401;
    throw error;
  }

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    token: generateToken(user._id),
  };
};

const getProfile = (user) => user;

const updateProfile = async (userId, data) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('Utilisateur non trouvé.');
    error.statusCode = 404;
    throw error;
  }

  user.name = data.name || user.name;
  user.email = data.email
    ? data.email.trim().toLowerCase()
    : user.email;
  user.phone = data.phone ?? user.phone;
  user.dateOfBirth = data.dateOfBirth ?? user.dateOfBirth;
  user.gender = data.gender ?? user.gender;
  user.height = data.height ?? user.height;
  user.weight = data.weight ?? user.weight;

  const updated = await user.save();

  return {
    _id: updated._id,
    name: updated.name,
    email: updated.email,
    phone: updated.phone,
    dateOfBirth: updated.dateOfBirth,
    gender: updated.gender,
    height: updated.height,
    weight: updated.weight,
  };
};

const changePassword = async (userId, oldPassword, newPassword) => {
  if (!oldPassword || !newPassword) {
    throw new Error('Tous les champs sont requis.');
  }

  if (newPassword.length < 6) {
    throw new Error('Le nouveau mot de passe doit faire au moins 6 caractères.');
  }

  const user = await User.findById(userId);

  if (!user) {
    const error = new Error('Utilisateur non trouvé.');
    error.statusCode = 404;
    throw error;
  }

  if (!(await bcrypt.compare(oldPassword, user.password))) {
    const error = new Error('Ancien mot de passe incorrect.');
    error.statusCode = 401;
    throw error;
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  return { message: 'Mot de passe modifié avec succès.' };
};

const forgotPassword = async (email) => {
  if (!email) throw new Error('Email requis.');

  const user = await User.findOne({
    email: email.trim().toLowerCase(),
  });

  if (!user) {
    return {
      message: 'Si un compte existe, un code a été envoyé.',
    };
  }

  const resetCode = Math.floor(
    100000 + Math.random() * 900000
  ).toString();

  user.resetPasswordToken = resetCode;
  user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);

  await user.save();

  console.log(`Code de réinitialisation pour ${email}: ${resetCode}`);

  return {
    message: 'Code envoyé.',
    resetCode,
  };
};

const resetPassword = async (email, code, newPassword) => {
  if (!email || !code || !newPassword) {
    throw new Error('Champs manquants.');
  }

  if (newPassword.length < 6) {
    throw new Error('Min. 6 caractères.');
  }

  const user = await User.findOne({
    email: email.trim().toLowerCase(),
  });

  if (!user) {
    const error = new Error('Utilisateur introuvable.');
    error.statusCode = 404;
    throw error;
  }

  if (user.resetPasswordToken !== code) {
    throw new Error('Code invalide.');
  }

  if (
    !user.resetPasswordExpires ||
    Date.now() > user.resetPasswordExpires.getTime()
  ) {
    throw new Error('Code expiré.');
  }

  user.password = await bcrypt.hash(newPassword, 10);
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;

  await user.save();

  return {
    message: 'Mot de passe réinitialisé avec succès.',
  };
};

const socialLogin = async ({ provider, email, name }) => {
  if (!provider || !email) {
    throw new Error('Données manquantes.');
  }

  const normalizedEmail = email.trim().toLowerCase();

  let user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    const randomPass = Math.random().toString(36).slice(-12);
    const hashedPassword = await bcrypt.hash(randomPass, 10);

    user = await User.create({
      name: name || 'Utilisateur',
      email: normalizedEmail,
      password: hashedPassword,
      provider,
    });
  }

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    token: generateToken(user._id),
  };
};

const updateSettings = async (userId, data) => {
  const user = await User.findById(userId);

  if (!user) {
    const error = new Error('Utilisateur introuvable.');
    error.statusCode = 404;
    throw error;
  }

  if (typeof data.notificationsEnabled === 'boolean') {
    user.notificationsEnabled = data.notificationsEnabled;
  }

  if (typeof data.remindersEnabled === 'boolean') {
    user.remindersEnabled = data.remindersEnabled;
  }

  if (typeof data.biometricEnabled === 'boolean') {
    user.biometricEnabled = data.biometricEnabled;
  }

  await user.save();

  return {
    notificationsEnabled: user.notificationsEnabled,
    remindersEnabled: user.remindersEnabled,
    biometricEnabled: user.biometricEnabled,
  };
};

const deleteAccount = async (userId) => {
  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      const user = await User.findById(userId)
        .select('_id')
        .session(session);

      if (!user) {
        const error = new Error('Utilisateur non trouvé.');
        error.statusCode = 404;
        throw error;
      }

      const models = [
        Measurement,
        Appointment,
        Analysis,
        Medication,
        Alert,
        Notification,
        EmergencyInfo,
        MedicalRecord,
      ];

      for (const Model of models) {
        await Model.deleteMany({ user: userId }).session(session);
      }

      await User.deleteOne({ _id: userId }).session(session);
    });

    return {
      success: true,
      message: 'Compte supprimé définitivement.',
    };
  } finally {
    await session.endSession();
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