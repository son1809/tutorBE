const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Booking = sequelize.define('Booking', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  student_id: { type: DataTypes.INTEGER, allowNull: false },
  tutor_id: { type: DataTypes.INTEGER, allowNull: false },
  subject: { type: DataTypes.STRING(50) },
  grade_level: { type: DataTypes.STRING(50) },
  booking_date: { type: DataTypes.DATEONLY, allowNull: false }, // Ngày bắt đầu / khai giảng
  duration_months: { type: DataTypes.INTEGER, defaultValue: 1 }, // Số tháng đăng ký học
  days_of_week: { type: DataTypes.STRING(100) }, // Lưu trữ "T2, T4, T6"
  time_slot: { type: DataTypes.STRING(20), allowNull: false },
  note: { type: DataTypes.TEXT },
  status: { type: DataTypes.ENUM('pending', 'matched', 'cancelled'), defaultValue: 'pending' },
}, {
  tableName: 'bookings',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Booking;
