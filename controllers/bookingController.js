const { Booking, Tutor, User } = require('../models');
const {
  sendBookingConfirmation,
  sendBookingApproved,
  sendBookingCancelled,
} = require('../utils/emailService');

// POST /api/bookings  (học sinh đăng ký học)
exports.createBooking = async (req, res) => {
  const { tutor_id, subject, grade_level, booking_date, duration_months, days_of_week, time_slot, note, total_sessions, estimated_price } = req.body;

  try {
    const tutor = await Tutor.findByPk(tutor_id, {
      include: [{ model: User, as: 'user', attributes: ['full_name'] }]
    });
    if (!tutor) return res.status(404).json({ message: 'Không tìm thấy gia sư.' });

    const { Op } = require('sequelize');
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const existingBookings = await Booking.findAll({
      where: {
        tutor_id,
        status: { [Op.ne]: 'cancelled' },
        booking_date: { [Op.gte]: sixMonthsAgo }
      }
    });

    const isOverlap = existingBookings.some(b => {
      if (b.time_slot !== time_slot) return false;
      
      const bStart = new Date(b.booking_date);
      bStart.setHours(0,0,0,0);
      const bEnd = new Date(bStart);
      bEnd.setMonth(bEnd.getMonth() + (b.duration_months || 1));

      const reqStart = new Date(booking_date);
      reqStart.setHours(0,0,0,0);
      const reqEnd = new Date(reqStart);
      reqEnd.setMonth(reqEnd.getMonth() + (duration_months || 1));

      // Không giao nhau về khoảng thời gian
      if (reqEnd < bStart || reqStart > bEnd) return false;

      // Nếu có giao nhau về khoảng thời gian, kiểm tra days_of_week
      const reqDays = (days_of_week || '').split(',').map(s => s.trim());
      const bDays = (b.days_of_week || '').split(',').map(s => s.trim());
      
      return reqDays.some(day => bDays.includes(day));
    });

    if (isOverlap) {
      return res.status(400).json({ message: 'Lịch học này bị trùng với học sinh khác. Vui lòng chọn khung giờ hoặc ngày khác.' });
    }

    const booking = await Booking.create({
      student_id: req.user.id,
      tutor_id,
      subject,
      grade_level,
      booking_date,
      duration_months: duration_months || 1,
      days_of_week: days_of_week || '',
      time_slot,
      total_sessions: total_sessions || 1,
      estimated_price: estimated_price || 200000,
      note,
    });

    // Gửi email xác nhận cho học sinh (không chặn response nếu lỗi mail)
    try {
      const student = await User.findByPk(req.user.id, { attributes: ['full_name', 'email'] });
      if (student?.email) {
        await sendBookingConfirmation({
          toEmail: student.email,
          studentName: student.full_name,
          booking,
          tutorName: tutor.user?.full_name || 'Gia sư',
        });
      }
    } catch (mailErr) {
      console.error('[Email] Gửi mail xác nhận đặt lịch thất bại:', mailErr.message);
    }

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
    // Lấy những booking trong vòng 6 tháng gần nhất để kiểm tra thời hạn (khóa học tối đa 6 tháng)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const bookings = await Booking.findAll({
      where: {
        tutor_id: id,
        status: { [Op.ne]: 'cancelled' },
        booking_date: { [Op.gte]: sixMonthsAgo }
      },
      attributes: ['booking_date', 'time_slot', 'duration_months', 'days_of_week']
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

    // Gửi email thông báo thay đổi trạng thái cho học sinh
    try {
      const student = await User.findByPk(booking.student_id, { attributes: ['full_name', 'email'] });
      const tutor = await Tutor.findByPk(booking.tutor_id, {
        include: [{ model: User, as: 'user', attributes: ['full_name'] }]
      });
      const tutorName = tutor?.user?.full_name || 'Gia sư';

      if (student?.email) {
        if (status === 'matched') {
          await sendBookingApproved({
            toEmail: student.email,
            studentName: student.full_name,
            booking,
            tutorName,
          });
        } else if (status === 'cancelled') {
          await sendBookingCancelled({
            toEmail: student.email,
            studentName: student.full_name,
            booking,
            tutorName,
            cancelledBy: 'admin',
          });
        }
      }
    } catch (mailErr) {
      console.error('[Email] Gửi mail cập nhật trạng thái thất bại:', mailErr.message);
    }

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

    // Gửi mail xác nhận hủy cho học sinh
    try {
      const student = await User.findByPk(req.user.id, { attributes: ['full_name', 'email'] });
      const tutor = await Tutor.findByPk(booking.tutor_id, {
        include: [{ model: User, as: 'user', attributes: ['full_name'] }]
      });

      if (student?.email) {
        await sendBookingCancelled({
          toEmail: student.email,
          studentName: student.full_name,
          booking,
          tutorName: tutor?.user?.full_name || 'Gia sư',
          cancelledBy: 'student',
        });
      }
    } catch (mailErr) {
      console.error('[Email] Gửi mail hủy lịch thất bại:', mailErr.message);
    }

    return res.json({ message: 'Đã hủy yêu cầu học.', booking });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Lỗi server.' });
  }
};
