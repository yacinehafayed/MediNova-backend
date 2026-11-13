const mongoose = require('mongoose');

const medicationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  dosage: { type: String, required: true },
  times: [{ type: String }],
  daysOfWeek: { type: [Number], default: [], validate: { validator: (days) => days.every((day) => Number.isInteger(day) && day >= 0 && day <= 6), message: 'Invalid days of the week.', }, },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  taken: [{
    date: { type: Date },
    time: { type: String },
    status: { type: String, enum: ['taken', 'missed'], default: 'taken' }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Medication', medicationSchema);