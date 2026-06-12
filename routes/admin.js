const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const adminController = require('../controllers/adminController');

// Middleware xác thực quyền Admin
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'Quyền truy cập bị từ chối. Yêu cầu quyền Admin.' });
};

// Áp dụng auth và adminOnly cho tất cả các route của admin
router.use(auth, adminOnly);

// ─── THỐNG KÊ ───
router.get('/stats', adminController.getStats);

// ─── QUẢN LÝ NGƯỜI DÙNG ───
router.get('/users', adminController.getUsers);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

// ─── QUẢN LÝ GIA SƯ ───
router.get('/tutors', adminController.getTutors);
router.patch('/tutors/:id/verify', adminController.verifyTutor);
router.delete('/tutors/:id', adminController.deleteTutor);

// ─── QUẢN LÝ ĐẶT LỊCH ───
router.get('/bookings', adminController.getBookings);
router.patch('/bookings/:id/status', adminController.updateBookingStatus);
router.delete('/bookings/:id', adminController.deleteBooking);

// ─── QUẢN LÝ ĐÁNH GIÁ ───
router.get('/reviews', adminController.getReviews);
router.delete('/reviews/:id', adminController.deleteReview);

module.exports = router;
