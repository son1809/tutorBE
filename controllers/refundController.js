const { RefundRequest, WithdrawalRequest, Booking, Attendance, User, Tutor } = require('../models');

// ─── Helper tính phí hủy ─────────────────────────────────────────────────────
const calcFeeRate = (attended, total) => {
  const ratio = attended / total;
  if (attended === 0) return 0;           // Chưa học buổi nào → 0%
  if (ratio <= 0.5) return 0.05;          // Học dưới 50% → 5%
  if (ratio <= 0.8) return 0.1;           // Học 50-80% → 10%
  return null;                             // Học trên 80% → không hoàn
};

// POST /api/refunds
// Học sinh gửi yêu cầu hoàn tiền
exports.createRefundRequest = async (req, res) => {
  try {
    const { booking_id, reason } = req.body;

    const booking = await Booking.findByPk(booking_id, {
      include: [{ model: Attendance, as: 'attendances' }]
    });

    if (!booking) return res.status(404).json({ message: 'Không tìm thấy booking.' });
    if (booking.student_id !== req.user.id) {
      return res.status(403).json({ message: 'Bạn không có quyền yêu cầu hoàn tiền cho booking này.' });
    }
    if (booking.status !== 'matched') {
      return res.status(400).json({ message: 'Chỉ có thể hoàn tiền khóa học đang diễn ra.' });
    }

    // Kiểm tra đã có yêu cầu hoàn tiền pending chưa
    const existingRefund = await RefundRequest.findOne({
      where: { booking_id, status: 'pending' }
    });
    if (existingRefund) {
      return res.status(400).json({ message: 'Đã có yêu cầu hoàn tiền đang chờ xử lý cho khóa học này.' });
    }

    const sessions_attended = (booking.attendances || []).filter(a => a.status === 'present').length;
    const sessions_total = booking.total_sessions || 1;
    const sessions_remaining = Math.max(0, sessions_total - sessions_attended);

    // Kiểm tra có buổi nào còn lại không
    if (sessions_remaining === 0) {
      return res.status(400).json({ message: 'Khóa học đã hoàn thành. Không thể hoàn tiền.' });
    }

    const fee_per_session = Math.round((booking.estimated_price || 0) / sessions_total);
    const gross_refund = sessions_remaining * fee_per_session;

    const fee_rate = calcFeeRate(sessions_attended, sessions_total);
    if (fee_rate === null) {
      return res.status(400).json({ message: 'Đã học trên 80% khóa học, không đủ điều kiện hoàn tiền.' });
    }

    const fee_amount = Math.round(gross_refund * fee_rate);
    const net_refund = gross_refund - fee_amount;

    const refund = await RefundRequest.create({
      booking_id,
      student_id: req.user.id,
      sessions_attended,
      sessions_total,
      sessions_remaining,
      fee_per_session,
      gross_refund,
      fee_rate,
      fee_amount,
      net_refund,
      reason: reason || '',
    });

    return res.status(201).json({
      message: 'Gửi yêu cầu hoàn tiền thành công. Admin sẽ xử lý trong 1-3 ngày làm việc.',
      refund,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Lỗi server.' });
  }
};

// GET /api/refunds/my
// Học sinh xem các yêu cầu hoàn tiền của mình
exports.getMyRefunds = async (req, res) => {
  try {
    const refunds = await RefundRequest.findAll({
      where: { student_id: req.user.id },
      include: [
        {
          model: Booking, as: 'booking',
          include: [{ model: Tutor, as: 'tutor', include: [{ model: User, as: 'user', attributes: ['full_name'] }] }]
        }
      ],
      order: [['created_at', 'DESC']],
    });
    return res.json(refunds);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Lỗi server.' });
  }
};

// GET /api/refunds/preview/:bookingId
// Tính trước số tiền hoàn (không tạo request)
exports.previewRefund = async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.bookingId, {
      include: [{ model: Attendance, as: 'attendances' }]
    });

    if (!booking) return res.status(404).json({ message: 'Không tìm thấy booking.' });
    if (booking.student_id !== req.user.id) {
      return res.status(403).json({ message: 'Không có quyền truy cập.' });
    }

    const sessions_attended = (booking.attendances || []).filter(a => a.status === 'present').length;
    const sessions_total = booking.total_sessions || 1;
    const sessions_remaining = Math.max(0, sessions_total - sessions_attended);
    const fee_per_session = Math.round((booking.estimated_price || 0) / sessions_total);
    const gross_refund = sessions_remaining * fee_per_session;
    const fee_rate = calcFeeRate(sessions_attended, sessions_total);
    const fee_amount = fee_rate !== null ? Math.round(gross_refund * fee_rate) : gross_refund;
    const net_refund = fee_rate !== null ? gross_refund - fee_amount : 0;
    const eligible = fee_rate !== null && sessions_remaining > 0;

    return res.json({
      sessions_attended,
      sessions_total,
      sessions_remaining,
      fee_per_session,
      gross_refund,
      fee_rate: fee_rate || 0,
      fee_amount,
      net_refund,
      eligible,
      message: !eligible
        ? 'Đã học trên 80% hoặc đã học hết, không đủ điều kiện hoàn tiền.'
        : sessions_remaining === 0
        ? 'Không còn buổi nào chưa học.'
        : null,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Lỗi server.' });
  }
};

// GET /api/refunds/admin  (Admin xem tất cả)
exports.getAllRefunds = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Không có quyền.' });
    const refunds = await RefundRequest.findAll({
      include: [
        { model: User, as: 'student', attributes: ['id', 'full_name', 'email', 'phone'] },
        { model: Booking, as: 'booking' }
      ],
      order: [['created_at', 'DESC']],
    });
    return res.json(refunds);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Lỗi server.' });
  }
};

// PATCH /api/refunds/:id/status  (Admin duyệt/từ chối)
exports.updateRefundStatus = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Không có quyền.' });

    const { status, admin_note } = req.body;
    if (!['approved', 'rejected', 'processed'].includes(status)) {
      return res.status(400).json({ message: 'Trạng thái không hợp lệ.' });
    }

    const refund = await RefundRequest.findByPk(req.params.id);
    if (!refund) return res.status(404).json({ message: 'Không tìm thấy yêu cầu hoàn tiền.' });

    const oldStatus = refund.status;

    await refund.update({
      status,
      admin_note: admin_note || null,
      processed_at: status === 'processed' ? new Date() : null,
    });

    // Nếu approved/processed → cập nhật booking thành cancelled
    if (status === 'approved' || status === 'processed') {
      await Booking.update({ status: 'cancelled' }, { where: { id: refund.booking_id } });
    }

    // Nếu chuyển sang processed, cộng tiền vào số dư của user
    if (status === 'processed' && oldStatus !== 'processed') {
      const student = await User.findByPk(refund.student_id);
      if (student) {
        await student.update({ balance: student.balance + refund.net_refund });
      }
    }

    return res.json({ message: 'Cập nhật trạng thái yêu cầu hoàn tiền thành công.', refund });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Lỗi server.' });
  }
};

// ─── WITHDRAWAL REQUESTS ─────────────────────────────────────────────────────

// POST /api/refunds/withdraw
// Học sinh tạo yêu cầu rút tiền
exports.createWithdrawal = async (req, res) => {
  try {
    const { amount, bank_name, account_number, account_name } = req.body;

    if (!amount || !bank_name || !account_number || !account_name) {
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin rút tiền.' });
    }
    if (amount < 10000) {
      return res.status(400).json({ message: 'Số tiền rút tối thiểu là 10.000đ.' });
    }

    const user = await User.findByPk(req.user.id);
    if (amount > user.balance) {
      return res.status(400).json({ message: 'Số tiền vượt quá số dư hiện có.' });
    }

    const withdrawal = await WithdrawalRequest.create({
      user_id: req.user.id,
      amount,
      bank_name,
      account_number,
      account_name,
    });

    // Trừ số dư ngay lập tức
    await user.update({ balance: user.balance - amount });

    return res.status(201).json({
      message: 'Gửi yêu cầu rút tiền thành công. Admin sẽ xử lý trong 1-3 ngày làm việc.',
      withdrawal,
      balance: user.balance
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Lỗi server.' });
  }
};

// GET /api/refunds/withdrawals/my
exports.getMyWithdrawals = async (req, res) => {
  try {
    const withdrawals = await WithdrawalRequest.findAll({
      where: { user_id: req.user.id },
      order: [['created_at', 'DESC']],
    });
    return res.json(withdrawals);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Lỗi server.' });
  }
};

// GET /api/refunds/withdrawals/admin (Admin xem tất cả yêu cầu rút tiền)
exports.getAllWithdrawals = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Không có quyền.' });
    const withdrawals = await WithdrawalRequest.findAll({
      include: [{ model: User, as: 'user', attributes: ['id', 'full_name', 'email', 'phone'] }],
      order: [['created_at', 'DESC']],
    });
    return res.json(withdrawals);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Lỗi server.' });
  }
};

// PATCH /api/refunds/withdrawals/:id/status (Admin duyệt rút tiền)
exports.updateWithdrawalStatus = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Không có quyền.' });

    const { status, admin_note } = req.body;
    if (!['approved', 'rejected', 'processed'].includes(status)) {
      return res.status(400).json({ message: 'Trạng thái không hợp lệ.' });
    }

    const withdrawal = await WithdrawalRequest.findByPk(req.params.id);
    if (!withdrawal) return res.status(404).json({ message: 'Không tìm thấy yêu cầu rút tiền.' });

    const oldStatus = withdrawal.status;

    await withdrawal.update({
      status,
      admin_note: admin_note || null,
      processed_at: status === 'processed' ? new Date() : null,
    });

    // Nếu từ chối, hoàn lại tiền vào số dư
    if (status === 'rejected' && oldStatus !== 'rejected') {
      const user = await User.findByPk(withdrawal.user_id);
      if (user) {
        await user.update({ balance: user.balance + withdrawal.amount });
      }
    }

    return res.json({ message: 'Cập nhật trạng thái thành công.', withdrawal });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Lỗi server.' });
  }
};
