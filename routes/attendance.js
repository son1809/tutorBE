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

// Lấy danh sách khung giờ bận của gia sư trong một ngày (phục vụ đổi lịch)
router.get('/tutor-busy-slots/:bookingId', auth, attendanceController.getTutorBusySlots);

// Xin đổi lịch
router.post('/:sessionId/reschedule-request', auth, attendanceController.requestReschedule);
router.post('/:sessionId/reschedule-approve', auth, attendanceController.approveReschedule);
router.post('/:sessionId/reschedule-reject', auth, attendanceController.rejectReschedule);
router.post('/:sessionId/reschedule-cancel', auth, attendanceController.cancelReschedule);
router.post('/:sessionId/reschedule-undo', auth, attendanceController.undoReschedule);

module.exports = router;
