const express = require('express');
const router = express.Router();
const reviewController = require('./review.controller');
const auth = require('../../shared/middleware/auth');
const authorize = require('../../shared/middleware/authorize');
const validate = require('../../shared/middleware/validate');
const { body, param } = require('express-validator');

router.post('/', auth, authorize('student'), [
  body('tutor_id').isInt({ min: 1 }),
  body('booking_id').isInt({ min: 1 }),
  body('rating').isInt({ min: 1, max: 5 }),
  body('comment').optional({ nullable: true }).isLength({ max: 2000 }),
], validate, reviewController.createReview);
router.get('/tutor/:tutorId', [
  param('tutorId').isInt({ min: 1 }),
], validate, reviewController.getTutorReviews);

module.exports = router;
