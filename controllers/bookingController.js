const { Booking, Tutor, User } = require('../models');

const bookingIncludes = [
  {
    model: Tutor,
    as: 'tutor',
    required: false,
    include: [{
      model: User,
      as: 'user',
      attributes: ['id', 'full_name', 'avatar', 'phone'],
    }],
  },
];

// POST /api/bookings
exports.createBooking = async (req, res) => {
  const {
    subject,
    grade_level,
    schedule_days,
    schedule_time,
    learning_method,
    learning_address,
    note,
  } = req.body;

  try {
    const booking = await Booking.create({
      student_id: req.user.id,
      subject,
      grade_level,
      schedule_days,
      schedule_time,
      learning_method,
      learning_address: learning_method === 'offline' ? learning_address : null,
      note,
      status: 'pending',
    });

    return res.status(201).json({
      message: 'Gửi yêu cầu đặt lịch thành công.',
      booking,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Lỗi server.' });
  }
};

// GET /api/bookings/my-requests
exports.getMyRequests = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      where: { student_id: req.user.id },
      include: bookingIncludes,
      order: [['created_at', 'DESC']],
    });

    return res.json({ bookings });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Lỗi server.' });
  }
};

// GET /api/bookings/:id
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findOne({
      where: { id: req.params.id, student_id: req.user.id },
      include: bookingIncludes,
    });

    if (!booking) {
      return res.status(404).json({ message: 'Không tìm thấy yêu cầu đặt lịch.' });
    }

    return res.json({ booking });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Lỗi server.' });
  }
};
