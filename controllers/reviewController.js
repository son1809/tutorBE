const { Review, User, Tutor } = require('../models');

// POST /api/reviews  (gửi đánh giá)
exports.createReview = async (req, res) => {
  const { tutor_id, booking_id, rating, comment } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'Số sao phải từ 1 đến 5.' });
  }

  try {
    // Kiểm tra không đánh giá 2 lần
    const existing = await Review.findOne({
      where: { student_id: req.user.id, tutor_id }
    });
    if (existing) {
      return res.status(400).json({ message: 'Bạn đã đánh giá gia sư này rồi.' });
    }

    const review = await Review.create({
      student_id: req.user.id,
      tutor_id, booking_id, rating, comment
    });

    // Tính lại rating_avg cho gia sư
    const allReviews = await Review.findAll({ where: { tutor_id } });
    const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    await Tutor.update({ rating_avg: Math.round(avg * 10) / 10 }, { where: { id: tutor_id } });

    return res.status(201).json({ message: 'Cảm ơn đánh giá của bạn!', review });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Lỗi server.' });
  }
};

// GET /api/reviews/tutor/:tutorId
exports.getTutorReviews = async (req, res) => {
  try {
    const reviews = await Review.findAll({
      where: { tutor_id: req.params.tutorId },
      include: [{ model: User, as: 'student', attributes: ['id', 'full_name', 'avatar'] }],
      order: [['created_at', 'DESC']],
    });
    return res.json(reviews);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Lỗi server.' });
  }
};
