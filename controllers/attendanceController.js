const { Attendance, Booking, User, Tutor, Notification } = require('../models');

// ─── Helper: Chuyển Date sang YYYY-MM-DD theo local timezone ─────────────────
const toLocalDate = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

// ─── Helper: Sinh danh sách ngày học từ booking ──────────────────────────────
const generateSessionDates = (bookingDate, durationMonths, daysOfWeek) => {
  const DAY_MAP = { 'CN': 0, 'T2': 1, 'T3': 2, 'T4': 3, 'T5': 4, 'T6': 5, 'T7': 6 };
  const targetDays = (daysOfWeek || '').split(',').map(d => DAY_MAP[d.trim()]).filter(d => d !== undefined);

  if (targetDays.length === 0) return [];

  const sessions = [];
  // Dùng noon (12:00) để tránh lệch ngày khi chuyển UTC
  const parts = String(bookingDate).split('T')[0].split('-');
  let current = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]), 12, 0, 0);

  const endDate = new Date(current);
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
      session_date: toLocalDate(date),
      time_slot: booking.time_slot,
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
          time_slot: booking.time_slot,
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

    // Kiểm tra điểm danh tuần tự (phải điểm danh buổi trước mới được điểm danh buổi sau)
    const allSessions = await Attendance.findAll({
      where: { booking_id: session.booking_id },
      order: [['session_date', 'ASC'], ['id', 'ASC']]
    });

    const currentIndex = allSessions.findIndex(s => s.id === session.id);
    if (currentIndex > 0) {
      const previousSession = allSessions[currentIndex - 1];
      if (previousSession.status === 'scheduled') {
        return res.status(400).json({ message: 'Vui lòng điểm danh các buổi học trước đó theo thứ tự thời gian.' });
      }
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

// ─── ĐỔI LỊCH (RESCHEDULE) ──────────────────────────────────────────────────

// GET /api/attendance/tutor-busy-slots/:bookingId
exports.getTutorBusySlots = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ message: 'Thiếu tham số ngày (date).' });

    const booking = await Booking.findByPk(req.params.bookingId);
    if (!booking) return res.status(404).json({ message: 'Không tìm thấy lớp học.' });

    const tutorId = booking.tutor_id;

    const { Op } = require('sequelize');
    // Tìm các buổi học gốc có lịch vào ngày này (chưa bị đổi sang ngày khác)
    const originalSessions = await Attendance.findAll({
      where: {
        session_date: date,
        status: { [Op.ne]: 'absent' }
      },
      include: [{
        model: Booking,
        as: 'booking',
        where: { tutor_id: tutorId },
        attributes: ['time_slot']
      }]
    });

    // Tìm các buổi học xin đổi lịch sang ngày này đang chờ duyệt (pending)
    const pendingReschedules = await Attendance.findAll({
      where: {
        reschedule_requested_date: date,
        reschedule_status: 'pending'
      },
      include: [{
        model: Booking,
        as: 'booking',
        where: { tutor_id: tutorId },
        attributes: ['time_slot']
      }]
    });

    // Lấy các khung giờ bận
    // Đối với buổi học gốc: nếu có reschedule_time_slot đã duyệt thì lấy nó, ngược lại lấy time_slot gốc hoặc time_slot của booking.
    // LƯU Ý: Nếu buổi học đã được duyệt đổi LỊCH SANG NGÀY KHÁC thì nó không bận trong ngày hiện tại. Nhưng code này chỉ query theo session_date, nên nếu duyệt rồi thì session_date của nó đã đổi.
    const busySlots = originalSessions.map(s => s.time_slot || s.booking.time_slot);
    
    // Thêm các khung giờ đang xin đổi tới
    const pendingSlots = pendingReschedules.map(s => s.reschedule_time_slot);

    // Hợp nhất và loại bỏ trùng lặp
    const uniqueBusySlots = [...new Set([...busySlots, ...pendingSlots].filter(Boolean))];

    res.json(uniqueBusySlots);
  } catch (err) {
    console.error('Error in getTutorBusySlots:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// POST /api/attendance/:sessionId/reschedule-request
exports.requestReschedule = async (req, res) => {
  try {
    const { proposed_date, proposed_time_slot, reason } = req.body;
    if (!proposed_date || !proposed_time_slot) return res.status(400).json({ message: 'Vui lòng chọn ngày và giờ đề xuất.' });

    const session = await Attendance.findByPk(req.params.sessionId, {
      include: [{ model: Booking, as: 'booking' }]
    });

    if (!session) return res.status(404).json({ message: 'Không tìm thấy buổi học.' });
    if (session.status !== 'scheduled') {
      return res.status(400).json({ message: 'Chỉ có thể xin đổi lịch cho buổi học chưa diễn ra.' });
    }

    if (session.reschedule_count >= 2) {
      return res.status(400).json({ message: 'Bạn đã đạt giới hạn 2 lần đổi lịch cho buổi học này.' });
    }

    // Kiểm tra thời gian trước 2 tiếng
    const startTimeStr = (session.booking.time_slot || '00:00').split('-')[0].trim();
    // Tạo chuỗi thời gian hợp lệ, giả sử GMT+0700
    const sessionDateTime = new Date(`${session.session_date}T${startTimeStr}:00+07:00`); 
    const now = new Date();
    
    // So sánh: now phải <= sessionDateTime - 2 giờ
    if (now.getTime() > sessionDateTime.getTime() - 2 * 60 * 60 * 1000) {
      return res.status(400).json({ message: 'Đã quá hạn xin đổi lịch (phải gửi yêu cầu trước 2 tiếng).' });
    }

    // Determine role
    let role = '';
    let receiverId = null;
    let senderName = req.user.full_name || 'Người dùng';
    if (req.user.role === 'student' && req.user.id === session.booking.student_id) {
      role = 'student';
      const tutor = await Tutor.findByPk(session.booking.tutor_id);
      receiverId = tutor.user_id;
    } else {
      const tutor = await Tutor.findOne({ where: { user_id: req.user.id } });
      if (tutor && tutor.id === session.booking.tutor_id) {
        role = 'tutor';
        receiverId = session.booking.student_id;
      } else {
        return res.status(403).json({ message: 'Không có quyền truy cập.' });
      }
    }

    await session.update({
      reschedule_requested_date: proposed_date,
      reschedule_time_slot: proposed_time_slot,
      reschedule_requested_by: role,
      reschedule_reason: reason,
      reschedule_status: 'pending',
      reschedule_count: session.reschedule_count + 1
    });

    if (receiverId) {
      await Notification.create({
        user_id: receiverId,
        title: 'Yêu cầu đổi lịch học',
        message: `${senderName} vừa gửi yêu cầu đổi lịch buổi học sang ${proposed_time_slot} ngày ${proposed_date}.`,
        link: role === 'tutor' ? '/dashboard' : '/tutor/dashboard'
      });
    }

    return res.json({ message: 'Gửi yêu cầu đổi lịch thành công.', session });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Lỗi server.' });
  }
};

// POST /api/attendance/:sessionId/reschedule-approve
exports.approveReschedule = async (req, res) => {
  try {
    const session = await Attendance.findByPk(req.params.sessionId, {
      include: [{ model: Booking, as: 'booking' }]
    });

    if (!session || session.reschedule_status !== 'pending') {
      return res.status(400).json({ message: 'Không có yêu cầu đổi lịch nào đang chờ.' });
    }

    let isReceiver = false;
    let notifyUserId = null;
    if (session.reschedule_requested_by === 'student') {
      const tutor = await Tutor.findOne({ where: { user_id: req.user.id } });
      if (tutor && tutor.id === session.booking.tutor_id) {
        isReceiver = true;
        notifyUserId = session.booking.student_id;
      }
    } else if (session.reschedule_requested_by === 'tutor') {
      if (req.user.id === session.booking.student_id) {
        isReceiver = true;
        const tutor = await Tutor.findByPk(session.booking.tutor_id);
        notifyUserId = tutor.user_id;
      }
    }

    if (!isReceiver) return res.status(403).json({ message: 'Chỉ đối tác mới có quyền duyệt yêu cầu này.' });

    const newDate = session.reschedule_requested_date;
    const newTimeSlot = session.reschedule_time_slot;
    const oldDate = session.session_date;
    const oldTimeSlot = session.time_slot || session.booking.time_slot;

    // Lưu lại lịch sử
    let history = [];
    if (session.reschedule_history) {
      try {
        history = JSON.parse(session.reschedule_history);
      } catch (e) {}
    }
    history.push({
      from_date: oldDate,
      from_time_slot: oldTimeSlot,
      to_date: newDate,
      to_time_slot: newTimeSlot,
      approved_at: new Date().toISOString()
    });

    await session.update({
      session_date: newDate,
      time_slot: newTimeSlot,
      reschedule_requested_date: null,
      reschedule_time_slot: null,
      reschedule_requested_by: null,
      reschedule_reason: null,
      reschedule_status: null,
      reschedule_history: JSON.stringify(history)
    });

    if (notifyUserId) {
      await Notification.create({
        user_id: notifyUserId,
        title: 'Yêu cầu đổi lịch được chấp nhận',
        message: `Yêu cầu đổi lịch của bạn sang ${newTimeSlot} ngày ${newDate} đã được đối tác đồng ý.`,
        link: session.reschedule_requested_by === 'student' ? '/dashboard' : '/tutor/dashboard'
      });
    }

    return res.json({ message: 'Đã duyệt yêu cầu đổi lịch.', session });
  } catch(err) {
    console.error(err);
    return res.status(500).json({ message: 'Lỗi server.' });
  }
};

// POST /api/attendance/:sessionId/reschedule-reject
exports.rejectReschedule = async (req, res) => {
  try {
    const session = await Attendance.findByPk(req.params.sessionId, {
      include: [{ model: Booking, as: 'booking' }]
    });

    if (!session || session.reschedule_status !== 'pending') {
      return res.status(400).json({ message: 'Không có yêu cầu đổi lịch nào đang chờ.' });
    }

    let isReceiver = false;
    let notifyUserId = null;
    if (session.reschedule_requested_by === 'student') {
      const tutor = await Tutor.findOne({ where: { user_id: req.user.id } });
      if (tutor && tutor.id === session.booking.tutor_id) {
        isReceiver = true;
        notifyUserId = session.booking.student_id;
      }
    } else if (session.reschedule_requested_by === 'tutor') {
      if (req.user.id === session.booking.student_id) {
        isReceiver = true;
        const tutor = await Tutor.findByPk(session.booking.tutor_id);
        notifyUserId = tutor.user_id;
      }
    }

    if (!isReceiver) return res.status(403).json({ message: 'Chỉ đối tác mới có quyền từ chối yêu cầu này.' });

    await session.update({
      reschedule_status: 'rejected'
    });

    if (notifyUserId) {
      await Notification.create({
        user_id: notifyUserId,
        title: 'Yêu cầu đổi lịch bị từ chối',
        message: `Yêu cầu đổi lịch của bạn cho buổi học ngày ${session.session_date} đã bị đối tác từ chối.`,
        link: session.reschedule_requested_by === 'student' ? '/dashboard' : '/tutor/dashboard'
      });
    }

    return res.json({ message: 'Đã từ chối yêu cầu đổi lịch.', session });
  } catch(err) {
    console.error(err);
    return res.status(500).json({ message: 'Lỗi server.' });
  }
};

// POST /api/attendance/:sessionId/reschedule-undo
exports.undoReschedule = async (req, res) => {
  try {
    const session = await Attendance.findByPk(req.params.sessionId, {
      include: [{ model: Booking, as: 'booking' }]
    });

    if (!session) return res.status(404).json({ message: 'Không tìm thấy buổi học.' });

    // Validate access (tutor or student involved)
    let isAuthorized = false;
    if (req.user.role === 'student' && req.user.id === session.booking.student_id) isAuthorized = true;
    else if (req.user.role === 'tutor') {
      const tutor = await Tutor.findOne({ where: { user_id: req.user.id } });
      if (tutor && tutor.id === session.booking.tutor_id) isAuthorized = true;
    }
    if (!isAuthorized) return res.status(403).json({ message: 'Không có quyền truy cập.' });

    if (!session.reschedule_history) {
      return res.status(400).json({ message: 'Không có lịch sử đổi lịch để hoàn tác.' });
    }

    let history = [];
    try {
      history = JSON.parse(session.reschedule_history);
    } catch (e) {}

    if (history.length === 0) {
      return res.status(400).json({ message: 'Không có lịch sử đổi lịch để hoàn tác.' });
    }

    // Lấy lần đổi gần nhất
    const lastReschedule = history.pop();

    await session.update({
      session_date: lastReschedule.from_date,
      time_slot: lastReschedule.from_time_slot,
      reschedule_history: history.length > 0 ? JSON.stringify(history) : null
    });

    return res.json({ message: 'Đã hoàn tác lịch học về ngày cũ.', session });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Lỗi server.' });
  }
};

// POST /api/attendance/:sessionId/reschedule-cancel
exports.cancelReschedule = async (req, res) => {
  try {
    const session = await Attendance.findByPk(req.params.sessionId, {
      include: [{ model: Booking, as: 'booking' }]
    });

    if (!session || session.reschedule_status !== 'pending') {
      return res.status(400).json({ message: 'Không có yêu cầu đổi lịch nào đang chờ.' });
    }

    let isSender = false;
    let notifyUserId = null;
    if (session.reschedule_requested_by === 'student') {
      if (req.user.role === 'student' && req.user.id === session.booking.student_id) {
        isSender = true;
        const tutor = await Tutor.findByPk(session.booking.tutor_id);
        notifyUserId = tutor.user_id;
      }
    } else if (session.reschedule_requested_by === 'tutor') {
      const tutor = await Tutor.findOne({ where: { user_id: req.user.id } });
      if (tutor && tutor.id === session.booking.tutor_id) {
        isSender = true;
        notifyUserId = session.booking.student_id;
      }
    }

    if (!isSender) return res.status(403).json({ message: 'Chỉ người gửi mới có quyền hủy yêu cầu này.' });

    await session.update({
      reschedule_requested_date: null,
      reschedule_time_slot: null,
      reschedule_requested_by: null,
      reschedule_reason: null,
      reschedule_status: null,
      reschedule_count: session.reschedule_count > 0 ? session.reschedule_count - 1 : 0
    });

    if (notifyUserId) {
      await Notification.create({
        user_id: notifyUserId,
        title: 'Yêu cầu đổi lịch đã bị hủy',
        message: `Đối tác đã hủy yêu cầu đổi lịch của họ.`,
        link: session.reschedule_requested_by === 'student' ? '/tutor/dashboard' : '/dashboard'
      });
    }

    return res.json({ message: 'Đã hủy yêu cầu đổi lịch.', session });
  } catch(err) {
    console.error(err);
    return res.status(500).json({ message: 'Lỗi server.' });
  }
};
