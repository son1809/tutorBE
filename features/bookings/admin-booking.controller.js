const { Booking, User, Tutor } = require('../../models');

const adminBookingIncludes = [
  {
    model: User,
    as: 'student',
    attributes: ['id', 'full_name', 'email', 'phone', 'address', 'children'],
  },
  {
    model: Tutor,
    as: 'tutor',
    required: false,
    include: [{
      model: User,
      as: 'user',
      attributes: ['id', 'full_name', 'phone', 'avatar'],
    }],
  },
];

// GET /api/admin/bookings/pending
exports.getPendingBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      where: { status: 'pending' },
      include: adminBookingIncludes,
      order: [['created_at', 'ASC']],
    });

    return res.json({ bookings });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Lỗi server.' });
  }
};

// PUT /api/admin/bookings/:id/assign
exports.assignBooking = async (req, res) => {
  const {
    tutor_id,
    tutor_name,
    tutor_phone,
    confirmed_schedule,
  } = req.body;

  try {
    const booking = await Booking.findByPk(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Không tìm thấy yêu cầu đặt lịch.' });
    }

    if (booking.status !== 'pending') {
      return res.status(409).json({ message: 'Chỉ có thể xếp lịch cho yêu cầu đang chờ.' });
    }

    let assignedTutorName = tutor_name;
    let assignedTutorPhone = tutor_phone;

    if (tutor_id) {
      const tutor = await Tutor.findByPk(tutor_id, {
        include: [{ model: User, as: 'user', attributes: ['full_name', 'phone'] }],
      });

      if (!tutor) {
        return res.status(404).json({ message: 'Không tìm thấy gia sư.' });
      }

      assignedTutorName = assignedTutorName || tutor.user?.full_name;
      assignedTutorPhone = assignedTutorPhone || tutor.user?.phone;
    }

    if (!assignedTutorName || !assignedTutorPhone) {
      return res.status(400).json({ message: 'Cần tên và số điện thoại gia sư.' });
    }

    await booking.update({
      tutor_id: tutor_id || null,
      assigned_tutor_name: assignedTutorName,
      assigned_tutor_phone: assignedTutorPhone,
      confirmed_schedule,
      status: 'matched',
      cancellation_reason: null,
      assigned_by: req.user.id,
      assigned_at: new Date(),
      cancelled_at: null,
    });

    return res.json({ message: 'Xếp lịch thành công.', booking });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Lỗi server.' });
  }
};

// PUT /api/admin/bookings/:id/cancel
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Không tìm thấy yêu cầu đặt lịch.' });
    }

    if (booking.status === 'completed' || booking.status === 'cancelled') {
      return res.status(409).json({ message: 'Không thể hủy yêu cầu ở trạng thái hiện tại.' });
    }

    await booking.update({
      status: 'cancelled',
      cancellation_reason: req.body.reason,
      assigned_by: req.user.id,
      cancelled_at: new Date(),
    });

    return res.json({ message: 'Hủy yêu cầu thành công.', booking });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Lỗi server.' });
  }
};

// PUT /api/admin/bookings/:id/status
exports.updateBookingStatus = async (req, res) => {
  const transitions = {
    matched: 'in_progress',
    in_progress: 'completed',
  };

  try {
    const booking = await Booking.findByPk(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Không tìm thấy yêu cầu đặt lịch.' });
    }
    if (transitions[booking.status] !== req.body.status) {
      return res.status(409).json({ message: 'Chuyển trạng thái không hợp lệ.' });
    }

    await booking.update({ status: req.body.status });
    return res.json({ message: 'Cập nhật trạng thái thành công.', booking });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Lỗi server.' });
  }
};

// GET /api/admin/bookings/all
exports.getAllBookings = async (req, res) => {
  const { status } = req.query;
  const where = status ? { status } : {};

  try {
    const bookings = await Booking.findAll({
      where,
      include: adminBookingIncludes,
      order: [['created_at', 'DESC']],
    });

    return res.json({ bookings });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Lỗi server.' });
  }
};
