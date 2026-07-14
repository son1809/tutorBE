const { User, Tutor, Booking, Review, Certificate } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/db');
const {
  sendBookingApproved,
  sendBookingCancelled,
} = require('../utils/emailService');
const notificationController = require('./notificationController');

// Lấy thống kê tổng quan
exports.getStats = async (req, res) => {
  try {
    const studentCount = await User.count({ where: { role: 'student' } });
    const tutorCount = await Tutor.count();
    const bookingCount = await Booking.count();
    const reviewCount = await Review.count();

    // Thống kê trạng thái booking
    const bookingStats = await Booking.findAll({
      attributes: ['status', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['status']
    });

    // Hoạt động gần đây (5 booking mới nhất)
    const recentBookings = await Booking.findAll({
      limit: 5,
      order: [['created_at', 'DESC']],
      include: [
        { model: User, as: 'student', attributes: ['id', 'full_name', 'email'] },
        { 
          model: Tutor, 
          as: 'tutor', 
          attributes: ['id', 'subject'],
          include: [{ model: User, as: 'user', attributes: ['id', 'full_name'] }]
        }
      ]
    });

    // 5 gia sư chờ duyệt gần đây
    const pendingTutors = await Tutor.findAll({
      where: { is_verified: false },
      limit: 5,
      order: [['created_at', 'DESC']],
      include: [{ model: User, as: 'user', attributes: ['id', 'full_name', 'email', 'phone'] }]
    });

    // 5 đánh giá gần đây nhất
    const recentReviews = await Review.findAll({
      limit: 5,
      order: [['created_at', 'DESC']],
      include: [
        { model: User, as: 'student', attributes: ['id', 'full_name'] },
        { 
          model: Tutor, 
          as: 'tutor', 
          attributes: ['id', 'subject'],
          include: [{ model: User, as: 'user', attributes: ['id', 'full_name'] }]
        }
      ]
    });

    return res.json({
      counts: {
        students: studentCount,
        tutors: tutorCount,
        bookings: bookingCount,
        reviews: reviewCount
      },
      bookingStats,
      recentBookings,
      pendingTutors,
      recentReviews
    });
  } catch (err) {
    console.error('Error getting admin stats:', err);
    return res.status(500).json({ message: 'Lỗi lấy số liệu thống kê.' });
  }
};

// Lấy danh sách người dùng
exports.getUsers = async (req, res) => {
  const { search, role } = req.query;
  const where = {};
  if (role) {
    where.role = role;
  }
  if (search) {
    where[Op.or] = [
      { full_name: { [Op.like]: `%${search}%` } },
      { email: { [Op.like]: `%${search}%` } }
    ];
  }
  try {
    const users = await User.findAll({
      where,
      attributes: { exclude: ['password'] },
      order: [['created_at', 'DESC']]
    });
    return res.json(users);
  } catch (err) {
    console.error('Error getting users for admin:', err);
    return res.status(500).json({ message: 'Lỗi lấy danh sách người dùng.' });
  }
};

// Cập nhật thông tin người dùng
exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { full_name, phone, role, school, grade } = req.body;
  try {
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
    
    await user.update({ full_name, phone, role, school, grade });
    return res.json({ message: 'Cập nhật người dùng thành công.', user });
  } catch (err) {
    console.error('Error updating user from admin:', err);
    return res.status(500).json({ message: 'Lỗi cập nhật người dùng.' });
  }
};

// Xóa người dùng
exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
    if (user.role === 'admin' && user.email === 'admin@edumatch.vn') {
      return res.status(400).json({ message: 'Không thể xóa tài khoản admin hệ thống.' });
    }
    
    // Xóa hồ sơ gia sư liên quan nếu có
    await Tutor.destroy({ where: { user_id: id } });
    await user.destroy();
    return res.json({ message: 'Xóa người dùng thành công.' });
  } catch (err) {
    console.error('Error deleting user from admin:', err);
    return res.status(500).json({ message: 'Lỗi xóa người dùng.' });
  }
};

// Lấy tất cả gia sư
exports.getTutors = async (req, res) => {
  const { search, is_verified } = req.query;
  const where = {};
  if (is_verified !== undefined) {
    where.is_verified = is_verified === 'true';
  }
  const userWhere = {};
  if (search) {
    userWhere[Op.or] = [
      { full_name: { [Op.like]: `%${search}%` } },
      { email: { [Op.like]: `%${search}%` } }
    ];
  }
  try {
    const tutors = await Tutor.findAll({
      where,
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'full_name', 'email', 'phone', 'avatar'],
        where: Object.keys(userWhere).length ? userWhere : undefined
      }, {
        model: Certificate,
        as: 'certificates',
        attributes: ['id', 'file_name', 'file_url', 'created_at']
      }],
      order: [['created_at', 'DESC']]
    });
    return res.json(tutors);
  } catch (err) {
    console.error('Error getting tutors for admin:', err);
    return res.status(500).json({ message: 'Lỗi lấy danh sách gia sư.' });
  }
};

// Duyệt / Hủy duyệt gia sư
exports.verifyTutor = async (req, res) => {
  const { id } = req.params;
  const { is_verified } = req.body;
  try {
    const tutor = await Tutor.findByPk(id, {
      include: [{ model: Certificate, as: 'certificates' }]
    });
    if (!tutor) return res.status(404).json({ message: 'Không tìm thấy gia sư.' });
    
    // Nếu admin duyệt (is_verified = true) thì kiểm tra chứng chỉ
    if (is_verified) {
      if (!tutor.certificates || tutor.certificates.length === 0) {
        return res.status(400).json({ message: 'Không thể duyệt vì gia sư này chưa nộp bằng cấp/chứng chỉ nào.' });
      }
    }
    
    await tutor.update({ is_verified });
    
    // Gửi thông báo cho gia sư
    try {
      await notificationController.create({
        user_id: tutor.user_id,
        type: 'system',
        title: is_verified ? 'Hồ sơ gia sư đã được duyệt!' : 'Hồ sơ gia sư bị huỷ duyệt',
        message: is_verified 
          ? 'Chúc mừng! Hồ sơ của bạn đã được quản trị viên phê duyệt. Bây giờ học viên có thể tìm thấy và đặt lịch với bạn.'
          : 'Hồ sơ của bạn đã bị quản trị viên huỷ duyệt do không đáp ứng đủ yêu cầu. Vui lòng liên hệ để biết thêm chi tiết.',
        link: '/tutor/profile',
        ref_id: tutor.id
      });
    } catch (notifErr) {
      console.error('Lỗi khi gửi thông báo verify tutor:', notifErr);
    }

    return res.json({ message: is_verified ? 'Đã duyệt gia sư.' : 'Đã hủy duyệt gia sư.', tutor });
  } catch (err) {
    console.error('Error verifying tutor:', err);
    return res.status(500).json({ message: 'Lỗi cập nhật trạng thái duyệt.' });
  }
};

// Xóa hồ sơ gia sư
exports.deleteTutor = async (req, res) => {
  const { id } = req.params;
  try {
    const tutor = await Tutor.findByPk(id);
    if (!tutor) return res.status(404).json({ message: 'Không tìm thấy gia sư.' });
    
    await tutor.destroy();
    return res.json({ message: 'Xóa hồ sơ gia sư thành công.' });
  } catch (err) {
    console.error('Error deleting tutor:', err);
    return res.status(500).json({ message: 'Lỗi xóa hồ sơ gia sư.' });
  }
};

// Lấy danh sách bookings (lịch học đăng ký)
exports.getBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      include: [
        { model: User, as: 'student', attributes: ['id', 'full_name', 'email', 'phone'] },
        { 
          model: Tutor, 
          as: 'tutor', 
          attributes: ['id', 'subject', 'grade_level'],
          include: [{ model: User, as: 'user', attributes: ['id', 'full_name', 'email'] }]
        }
      ],
      order: [['created_at', 'DESC']]
    });
    return res.json(bookings);
  } catch (err) {
    console.error('Error getting bookings for admin:', err);
    return res.status(500).json({ message: 'Lỗi lấy danh sách đặt lịch.' });
  }
};

// Cập nhật trạng thái booking
exports.updateBookingStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const booking = await Booking.findByPk(id);
    if (!booking) return res.status(404).json({ message: 'Không tìm thấy lịch đặt.' });

    const oldStatus = booking.status;
    await booking.update({ status });

    // Gửi email thông báo cho học sinh khi trạng thái thay đổi
    if (oldStatus !== status && (status === 'matched' || status === 'cancelled')) {
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
            console.log(`[Email] Đã gửi mail xác nhận lịch học tới ${student.email}`);
          } else if (status === 'cancelled') {
            await sendBookingCancelled({
              toEmail: student.email,
              studentName: student.full_name,
              booking,
              tutorName,
              cancelledBy: 'admin',
            });
            console.log(`[Email] Đã gửi mail hủy lịch học tới ${student.email}`);
          }
        }
      } catch (mailErr) {
        console.error('[Email] Gửi mail thất bại:', mailErr.message);
      }
    }

    return res.json({ message: 'Cập nhật trạng thái thành công.', booking });
  } catch (err) {
    console.error('Error updating booking status:', err);
    return res.status(500).json({ message: 'Lỗi cập nhật trạng thái.' });
  }
};

// Xóa booking
exports.deleteBooking = async (req, res) => {
  const { id } = req.params;
  try {
    const booking = await Booking.findByPk(id);
    if (!booking) return res.status(404).json({ message: 'Không tìm thấy lịch đặt.' });
    
    await booking.destroy();
    return res.json({ message: 'Xóa lịch đặt thành công.' });
  } catch (err) {
    console.error('Error deleting booking:', err);
    return res.status(500).json({ message: 'Lỗi xóa lịch đặt.' });
  }
};

// Lấy danh sách đánh giá
exports.getReviews = async (req, res) => {
  try {
    const reviews = await Review.findAll({
      include: [
        { model: User, as: 'student', attributes: ['id', 'full_name', 'email'] },
        { 
          model: Tutor, 
          as: 'tutor', 
          attributes: ['id', 'subject'],
          include: [{ model: User, as: 'user', attributes: ['id', 'full_name'] }]
        }
      ],
      order: [['created_at', 'DESC']]
    });
    return res.json(reviews);
  } catch (err) {
    console.error('Error getting reviews for admin:', err);
    return res.status(500).json({ message: 'Lỗi lấy danh sách đánh giá.' });
  }
};

// Xóa đánh giá
exports.deleteReview = async (req, res) => {
  const { id } = req.params;
  try {
    const review = await Review.findByPk(id);
    if (!review) return res.status(404).json({ message: 'Không tìm thấy đánh giá.' });
    
    const tutorId = review.tutor_id;
    await review.destroy();

    // Cập nhật lại rating trung bình cho gia sư
    const reviews = await Review.findAll({ where: { tutor_id: tutorId } });
    const avg = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;
    await Tutor.update({ rating_avg: avg }, { where: { id: tutorId } });

    return res.json({ message: 'Xóa đánh giá thành công và đã cập nhật lại rating gia sư.' });
  } catch (err) {
    console.error('Error deleting review:', err);
    return res.status(500).json({ message: 'Lỗi xóa đánh giá.' });
  }
};

// Lấy danh sách học sinh và lịch học chi tiết
exports.getStudentSchedules = async (req, res) => {
  try {
    const { search } = req.query;
    const where = { role: 'student' }; // Học sinh có role = student
    if (search) {
      where[Op.or] = [
        { full_name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } }
      ];
    }

    const students = await User.findAll({
      where,
      attributes: ['id', 'full_name', 'email', 'phone', 'avatar', 'grade', 'school'],
      include: [
        {
          model: Booking,
          as: 'bookings',
          where: { status: 'matched' },
          required: false, // Lấy cả những học sinh chưa có lớp nào
          include: [
            {
              model: Tutor,
              as: 'tutor',
              attributes: ['id', 'subject'],
              include: [{ model: User, as: 'user', attributes: ['id', 'full_name', 'email', 'phone'] }]
            }
          ]
        }
      ],
      order: [['created_at', 'DESC']]
    });

    return res.json(students);
  } catch (err) {
    console.error('Error getting student schedules:', err);
    return res.status(500).json({ message: 'Lỗi lấy lịch học học sinh.' });
  }
};
