
const mongoose = require('mongoose');

const measurementSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['heart_rate', 'blood_pressure', 'weight', 'blood_sugar'],
  },
  value: {
    type: Number,
    required: function () {
      return this.type !== 'blood_pressure';
    },
  },
  mealTiming: {
    type: String,
    enum: ['fasting', 'after_meal'],
    required: function () {
      return this.type === 'blood_sugar';
    },
  },
  systolic: {
    type: Number,
    required: function () {
      return this.type === 'blood_pressure';
    },
    min: 1,
  },
  diastolic: {
    type: Number,
    required: function () {
      return this.type === 'blood_pressure';
    },
    min: 1,
  },
  unit: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

measurementSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('Measurement', measurementSchema);