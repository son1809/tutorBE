const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Booking = sequelize.define('Booking', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  student_id: { type: DataTypes.INTEGER, allowNull: false },
  tutor_id: { type: DataTypes.INTEGER, allowNull: false },
  subject: { type: DataTypes.STRING(50) },
  grade_level: { type: DataTypes.STRING(50) },
  schedule_days: { type: DataTypes.STRING(100) }, // "Thứ 2, 4, 6"
  schedule_time: { type: DataTypes.STRING(10) },  // "19:30"
  note: { type: DataTypes.TEXT },
  status: { type: DataTypes.ENUM('pending', 'matched', 'cancelled'), defaultValue: 'pending' },
}, {
  tableName: 'bookings',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Booking;
