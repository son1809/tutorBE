const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const auth = require('../middleware/auth');

router.post('/', auth, reviewController.createReview);
router.get('/tutor/:tutorId', reviewController.getTutorReviews);
router.get('/', reviewController.getAllReviews);

module.exports = router;
