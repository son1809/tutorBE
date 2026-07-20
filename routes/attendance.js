const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const auth = require('../middleware/auth');

// Sinh danh sách buổi học cho 1 booking
router.post('/generate/:bookingId', auth, attendanceController.generateSessions);

// Lấy danh sách buổi học theo booking
router.get('/booking/:bookingId', auth, attendanceController.getByBooking);

// Điểm danh / đánh dấu vắng một buổi
router.patch('/:sessionId/mark', auth, attendanceController.markAttendance);

// Thống kê điểm danh toàn bộ lớp của gia sư
router.get('/my-stats', auth, attendanceController.getTutorAttendanceStats);

module.exports = router;
