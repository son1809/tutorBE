const express = require('express');
const { body, param, query } = require('express-validator');
const adminBookingController = require('../controllers/adminBookingController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(auth, authorize('admin'));

router.get('/pending', adminBookingController.getPendingBookings);

router.put(
  '/:id/assign',
  [
    param('id').isInt({ min: 1 }).withMessage('ID lịch học không hợp lệ'),
    body('tutor_id').optional({ nullable: true }).isInt({ min: 1 }),
    body('tutor_name').optional({ nullable: true }).trim().isLength({ min: 1, max: 100 }),
    body('tutor_phone').optional({ nullable: true }).trim().isLength({ min: 6, max: 20 }),
    body('confirmed_schedule').trim().notEmpty().withMessage('Thời gian học chính thức không được để trống'),
  ],
  validate,
  adminBookingController.assignBooking
);

router.put(
  '/:id/cancel',
  [
    param('id').isInt({ min: 1 }).withMessage('ID lịch học không hợp lệ'),
    body('reason').trim().notEmpty().withMessage('Lý do hủy không được để trống').isLength({ max: 2000 }),
  ],
  validate,
  adminBookingController.cancelBooking
);

router.get(
  '/all',
  query('status')
    .optional()
    .isIn(['pending', 'matched', 'in_progress', 'completed', 'cancelled'])
    .withMessage('Trạng thái không hợp lệ'),
  validate,
  adminBookingController.getAllBookings
);

module.exports = router;
