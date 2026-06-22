const express = require('express');
const { body, param } = require('express-validator');
const bookingController = require('./booking.controller');
const auth = require('../../shared/middleware/auth');
const authorize = require('../../shared/middleware/authorize');
const validate = require('../../shared/middleware/validate');

const router = express.Router();

const createBookingValidation = [
  body('tutor_id').optional({ nullable: true }).isInt({ min: 1 }).withMessage('ID gia sư không hợp lệ'),
  body('subject').trim().notEmpty().withMessage('Môn học không được để trống'),
  body('grade_level').trim().notEmpty().withMessage('Lớp học không được để trống'),
  body('schedule_days').trim().notEmpty().withMessage('Thời gian mong muốn không được để trống'),
  body('schedule_time').optional({ nullable: true }).isLength({ max: 100 }),
  body('learning_method')
    .isIn(['offline', 'online'])
    .withMessage('Hình thức học phải là offline hoặc online'),
  body('learning_address')
    .if(body('learning_method').equals('offline'))
    .trim()
    .notEmpty().withMessage('Địa chỉ học không được để trống khi học offline'),
  body('note').optional({ nullable: true }).isLength({ max: 2000 }),
];

const idValidation = [
  param('id').isInt({ min: 1 }).withMessage('ID lịch học không hợp lệ'),
];

router.post(
  '/',
  auth,
  authorize('student'),
  createBookingValidation,
  validate,
  bookingController.createBooking
);
router.put('/:id/cancel', auth, idValidation, validate, bookingController.cancelMyBooking);
router.get('/my-requests', auth, bookingController.getMyRequests);

// Alias giữ tương thích frontend cũ.
router.get('/my', auth, async (req, res, next) => {
  const originalJson = res.json.bind(res);
  res.json = (payload) => originalJson(payload.bookings || payload);
  return bookingController.getMyRequests(req, res, next);
});

router.get('/:id', auth, idValidation, validate, bookingController.getBookingById);

module.exports = router;
