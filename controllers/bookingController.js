const { Booking, Tutor, User } = require('../models');

// POST /api/bookings  (học sinh đăng ký học)
exports.createBooking = async (req, res) => {
  const { tutor_id, subject, grade_level, booking_date, time_slot, note } = req.body;

  try {
    const tutor = await Tutor.findByPk(tutor_id);
    if (!tutor) return res.status(404).json({ message: 'Không tìm thấy gia sư.' });

    // Kiểm tra xem slot đã được đặt chưa (trạng thái pending hoặc matched)
    const { Op } = require('sequelize');
    const existingBooking = await Booking.findOne({
      where: {
        tutor_id,
        booking_date,
        time_slot,
        status: {
          [Op.ne]: 'cancelled'
        }
      }
    });

    if (existingBooking) {
      return res.status(400).json({ message: 'Khung giờ này đã được đặt, vui lòng chọn thời gian khác.' });
    }

    const booking = await Booking.create({
      student_id: req.user.id,
      tutor_id,
      subject,
      grade_level,
      booking_date,
      time_slot,
      note,
    });

    return res.status(201).json({ message: 'Đăng ký học thành công! Admin sẽ duyệt và xếp lịch sớm nhất.', booking });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Lỗi server.' });
  }
};

// GET /api/bookings/tutor/:id/availability  (lấy lịch trống của gia sư)
exports.getTutorAvailability = async (req, res) => {
  const { id } = req.params;
  const { Op } = require('sequelize');
  
  try {
    // Chỉ lấy những booking từ hôm nay trở đi mà không bị cancelled
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const bookings = await Booking.findAll({
      where: {
        tutor_id: id,
        status: { [Op.ne]: 'cancelled' },
        booking_date: { [Op.gte]: today }
      },
      attributes: ['booking_date', 'time_slot']
    });

    return res.json(bookings);
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

// PATCH /api/bookings/:id/cancel  (học sinh tự hủy đơn)
exports.cancelMyBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({
      where: {
        id: req.params.id,
        student_id: req.user.id
      }
    });

    if (!booking) return res.status(404).json({ message: 'Không tìm thấy đơn đăng ký.' });

    if (booking.status !== 'pending') {
      return res.status(400).json({ message: 'Chỉ có thể hủy đăng ký khi đang chờ duyệt.' });
    }

    await booking.update({ status: 'cancelled' });
    return res.json({ message: 'Đã hủy yêu cầu học.', booking });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Lỗi server.' });
  }
};
