const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const auth = require('../middleware/auth');

router.post('/', auth, bookingController.createBooking);
router.get('/my', auth, bookingController.getMyBookings);
router.get('/tutor-bookings', auth, bookingController.getTutorBookings);
router.get('/tutor-stats', auth, bookingController.getTutorStats);
router.patch('/:id/status', auth, bookingController.updateStatus);
router.patch('/:id/cancel', auth, bookingController.cancelMyBooking);
router.get('/tutor/:id/availability', bookingController.getTutorAvailability);

module.exports = router;
