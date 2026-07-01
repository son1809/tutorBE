const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Notification = sequelize.define('Notification', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

  // Ai nhận thông báo
  user_id: { type: DataTypes.INTEGER, allowNull: false },

  // Loại thông báo
  type: {
    type: DataTypes.ENUM(
      'booking_new',       // Có đặt lịch mới (gia sư nhận)
      'booking_confirmed', // Đặt lịch được xác nhận (học viên nhận)
      'booking_cancelled', // Đặt lịch bị huỷ
      'booking_completed', // Hoàn thành buổi học
      'payment_success',   // Thanh toán thành công
      'review_new',        // Có đánh giá mới (gia sư nhận)
      'blog_approved',     // Blog được Admin duyệt (tác giả nhận)
      'system'             // Thông báo hệ thống chung
    ),
    defaultValue: 'system',
  },

  // Tiêu đề ngắn
  title: { type: DataTypes.STRING(200), allowNull: false },

  // Nội dung chi tiết
  message: { type: DataTypes.TEXT },

  // Link điều hướng khi click (VD: /schedule, /blog/5)
  link: { type: DataTypes.STRING(300) },

  // Đã đọc chưa
  is_read: { type: DataTypes.BOOLEAN, defaultValue: false },

  // ID đối tượng liên quan (booking_id, blog_id, ...) để dễ debug
  ref_id: { type: DataTypes.INTEGER },
}, {
  tableName: 'notifications',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false, // Không cần updated_at cho notifications
});

module.exports = Notification;
