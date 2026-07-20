const { Attendance, Booking, User, Tutor } = require('../models');

// ─── Helper: Sinh danh sách ngày học từ booking ──────────────────────────────
const generateSessionDates = (bookingDate, durationMonths, daysOfWeek) => {
  const DAY_MAP = { 'CN': 0, 'T2': 1, 'T3': 2, 'T4': 3, 'T5': 4, 'T6': 5, 'T7': 6 };
  const targetDays = (daysOfWeek || '').split(',').map(d => DAY_MAP[d.trim()]).filter(d => d !== undefined);

  if (targetDays.length === 0) return [];

  const sessions = [];
  let current = new Date(bookingDate);
  current.setHours(0, 0, 0, 0);

  const endDate = new Date(bookingDate);
  endDate.setMonth(endDate.getMonth() + durationMonths);

  while (current < endDate) {
    if (targetDays.includes(current.getDay())) {
      sessions.push(new Date(current));
    }
    current.setDate(current.getDate() + 1);
  }
  return sessions;
};

// POST /api/attendance/generate/:bookingId
// Sinh danh sách buổi học cho 1 booking (gọi 1 lần sau khi booking matched)
exports.generateSessions = async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.bookingId);
    if (!booking) return res.status(404).json({ message: 'Không tìm thấy booking.' });

    // Kiểm tra quyền: gia sư hoặc admin
    if (req.user.role !== 'admin') {
      const tutor = await Tutor.findOne({ where: { user_id: req.user.id } });
      if (!tutor || tutor.id !== booking.tutor_id) {
        return res.status(403).json({ message: 'Không có quyền truy cập.' });
      }
    }

    // Kiểm tra đã sinh chưa
    const existing = await Attendance.count({ where: { booking_id: booking.id } });
    if (existing > 0) {
      return res.status(400).json({ message: 'Danh sách buổi học đã được tạo.' });
    }

    const dates = generateSessionDates(booking.booking_date, booking.duration_months, booking.days_of_week);

    if (dates.length === 0) {
      return res.status(400).json({ message: 'Không thể sinh buổi học. Kiểm tra lại ngày bắt đầu và lịch học.' });
    }

    const records = dates.map((date, index) => ({
      booking_id: booking.id,
      session_number: index + 1,
      session_date: date.toISOString().split('T')[0],
      status: 'scheduled',
    }));

    await Attendance.bulkCreate(records);

    return res.status(201).json({
      message: `Đã tạo ${records.length} buổi học thành công.`,
      count: records.length,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Lỗi server.' });
  }
};

// GET /api/attendance/booking/:bookingId
// Lấy danh sách buổi học của 1 booking
exports.getByBooking = async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.bookingId);
    if (!booking) return res.status(404).json({ message: 'Không tìm thấy booking.' });

    // Kiểm tra quyền: gia sư, học sinh liên quan hoặc admin
    if (req.user.role !== 'admin') {
      if (req.user.role === 'tutor') {
        const tutor = await Tutor.findOne({ where: { user_id: req.user.id } });
        if (!tutor || tutor.id !== booking.tutor_id) {
          return res.status(403).json({ message: 'Không có quyền truy cập.' });
        }
      } else if (req.user.id !== booking.student_id) {
        return res.status(403).json({ message: 'Không có quyền truy cập.' });
      }
    }

    const attendances = await Attendance.findAll({
      where: { booking_id: req.params.bookingId },
      order: [['session_number', 'ASC']],
    });

    // Nếu chưa có buổi nào → tự động sinh (trường hợp cũ)
    if (attendances.length === 0 && booking.status === 'matched') {
      const dates = generateSessionDates(booking.booking_date, booking.duration_months, booking.days_of_week);
      if (dates.length > 0) {
        const records = dates.map((date, index) => ({
          booking_id: booking.id,
          session_number: index + 1,
          session_date: date.toISOString().split('T')[0],
          status: 'scheduled',
        }));
        await Attendance.bulkCreate(records);
        const created = await Attendance.findAll({
          where: { booking_id: req.params.bookingId },
          order: [['session_number', 'ASC']],
        });
        return res.json(created);
      }
    }

    return res.json(attendances);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Lỗi server.' });
  }
};

// PATCH /api/attendance/:sessionId/mark
// Gia sư điểm danh một buổi học (present hoặc absent)
exports.markAttendance = async (req, res) => {
  try {
    const { status, note } = req.body; // status: 'present' | 'absent'

    if (!['present', 'absent'].includes(status)) {
      return res.status(400).json({ message: 'Trạng thái không hợp lệ. Chọn "present" hoặc "absent".' });
    }

    const session = await Attendance.findByPk(req.params.sessionId, {
      include: [{ model: Booking, as: 'booking' }]
    });

    if (!session) return res.status(404).json({ message: 'Không tìm thấy buổi học.' });

    // Kiểm tra quyền gia sư
    if (req.user.role !== 'admin') {
      const tutor = await Tutor.findOne({ where: { user_id: req.user.id } });
      if (!tutor || tutor.id !== session.booking.tutor_id) {
        return res.status(403).json({ message: 'Chỉ gia sư của lớp mới được điểm danh.' });
      }
    }

    // Không cho điểm danh buổi tương lai (ngày học phải <= hôm nay)
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const sessionDate = new Date(session.session_date);
    if (sessionDate > today) {
      return res.status(400).json({ message: 'Chưa thể điểm danh cho buổi học trong tương lai.' });
    }

    const oldStatus = session.status;

    await session.update({
      status,
      note: note || null,
      marked_at: new Date(),
    });

    // Nếu chuyển từ chưa học (scheduled) sang đã học/vắng mặt -> Giải ngân tiền buổi học
    if (oldStatus === 'scheduled' && (status === 'present' || status === 'absent')) {
      if (session.booking.payment_method === 'vnpay') {
        const tutor = await Tutor.findByPk(session.booking.tutor_id);
        if (tutor) {
          const tutorUser = await User.findByPk(tutor.user_id);
          if (tutorUser) {
            const totalSessions = session.booking.total_sessions || 1;
            const feePerSession = Math.round(session.booking.estimated_price / totalSessions);
            
            await tutorUser.update({
              locked_balance: Math.max(0, (tutorUser.locked_balance || 0) - feePerSession),
              balance: (tutorUser.balance || 0) + feePerSession
            });
          }
        }
      }
    }

    return res.json({ message: 'Điểm danh thành công!', session });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Lỗi server.' });
  }
};

// GET /api/attendance/my-stats
// Thống kê điểm danh của tất cả bookings của gia sư
exports.getTutorAttendanceStats = async (req, res) => {
  try {
    if (req.user.role !== 'tutor') {
      return res.status(403).json({ message: 'Chỉ gia sư mới có quyền truy cập.' });
    }

    const tutor = await Tutor.findOne({ where: { user_id: req.user.id } });
    if (!tutor) return res.status(404).json({ message: 'Không tìm thấy hồ sơ gia sư.' });

    const bookings = await Booking.findAll({
      where: { tutor_id: tutor.id, status: 'matched' },
      include: [
        { model: User, as: 'student', attributes: ['id', 'full_name', 'avatar', 'phone'] },
        { model: Attendance, as: 'attendances' }
      ],
      order: [['created_at', 'DESC']],
    });

    const result = bookings.map(b => {
      const sessions = b.attendances || [];
      return {
        booking_id: b.id,
        subject: b.subject,
        grade_level: b.grade_level,
        student: b.student,
        days_of_week: b.days_of_week,
        time_slot: b.time_slot,
        booking_date: b.booking_date,
        duration_months: b.duration_months,
        total_sessions: b.total_sessions,
        sessions_present: sessions.filter(s => s.status === 'present').length,
        sessions_absent: sessions.filter(s => s.status === 'absent').length,
        sessions_scheduled: sessions.filter(s => s.status === 'scheduled').length,
        sessions_generated: sessions.length,
      };
    });

    return res.json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Lỗi server.' });
  }
};
