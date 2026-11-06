const express = require('express');
const { protect } = require('../../middleware/authMiddleware');
const appointmentController = require('../controllers/appointment.controller');

const router = express.Router();

router.get('/', protect, appointmentController.getAppointments);
router.post('/', protect, appointmentController.createAppointment);
router.delete('/:id', protect, appointmentController.deleteAppointment);

module.exports = router;