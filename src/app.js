const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const appointmentRoutes = require('./routes/appointment.routes');
const alertRoutes = require('./routes/alert.routes');
const analysisRoutes = require('./routes/analysis.routes');
const emergencyRoutes = require('./routes/emergency.routes');
const measurementRoutes = require('./routes/measurement.routes');
const medicalRecordRoutes = require('./routes/medicalRecord.routes');
const medicationRoutes = require('./routes/medication.routes');
const notificationRoutes = require('./routes/notification.routes');
const reportRoutes = require('./routes/report.routes');
const aiRoutes = require('./routes/ai.routes');

const errorMiddleware = require('./middleware/errorMiddleware');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/appointments', appointmentRoutes);
app.use('/api/v1/alerts', alertRoutes);
app.use('/api/v1/analyses', analysisRoutes);
app.use('/api/v1/emergency', emergencyRoutes);
app.use('/api/v1/measurements', measurementRoutes);
app.use('/api/v1/medical-records', medicalRecordRoutes);
app.use('/api/v1/medications', medicationRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/ai', aiRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'API MediNova v1 en ligne.' });
});

app.use(errorMiddleware);

module.exports = app;
