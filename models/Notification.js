const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Notification = sequelize.define('Notification', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

  // Ai nhan thong bao
  user_id: { type: DataTypes.INTEGER, allowNull: false },

  // Loai thong bao: 'booking_new' | 'booking_confirmed' | 'booking_cancelled'
  // | 'booking_completed' | 'payment_success' | 'review_new' | 'blog_approved' | 'system'
  type: { type: DataTypes.STRING(50), defaultValue: 'system' },

  // Tieu de ngan
  title: { type: DataTypes.STRING(200), allowNull: false },

  // Noi dung chi tiet
  message: { type: DataTypes.TEXT },

  // Link dieu huong khi click
  link: { type: DataTypes.STRING(300) },

  // Da doc chua
  is_read: { type: DataTypes.BOOLEAN, defaultValue: false },

  // ID doi tuong lien quan
  ref_id: { type: DataTypes.INTEGER },
}, {
  tableName: 'notifications',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

module.exports = Notification;
