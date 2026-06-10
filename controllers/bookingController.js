const { Booking, Tutor, User } = require('../models');

// POST /api/bookings  (học sinh đăng ký học)
exports.createBooking = async (req, res) => {
  const { tutor_id, subject, grade_level, schedule_days, schedule_time, note } = req.body;

  try {
    const tutor = await Tutor.findByPk(tutor_id);
    if (!tutor) return res.status(404).json({ message: 'Không tìm thấy gia sư.' });

    const booking = await Booking.create({
      student_id: req.user.id,
      tutor_id,
      subject,
      grade_level,
      schedule_days,
      schedule_time,
      note,
    });

    return res.status(201).json({ message: 'Đăng ký học thành công! Gia sư sẽ liên hệ sớm nhất.', booking });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Lỗi server.' });
  }
};

// GET /api/bookings/my  (lấy danh sách đăng ký của tôi)
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      where: { student_id: req.user.id },
      include: [
        {
          model: Tutor, as: 'tutor',
          include: [{ model: User, as: 'user', attributes: ['full_name', 'avatar', 'phone'] }]
        }
      ],
      order: [['created_at', 'DESC']],
    });

    return res.json(bookings);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Lỗi server.' });
  }
};

// PATCH /api/bookings/:id/status  (admin cập nhật trạng thái)
exports.updateStatus = async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Chỉ admin mới có quyền cập nhật.' });
  }

  const { status } = req.body;
  const validStatuses = ['pending', 'matched', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Trạng thái không hợp lệ.' });
  }

  try {
    const booking = await Booking.findByPk(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Không tìm thấy đơn đăng ký.' });

    await booking.update({ status });
    return res.json({ message: 'Cập nhật trạng thái thành công!', booking });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Lỗi server.' });
  }
};
