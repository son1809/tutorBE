const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Booking = sequelize.define('Booking', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  student_id: { type: DataTypes.INTEGER, allowNull: false },
  tutor_id: { type: DataTypes.INTEGER, allowNull: true },
  subject: { type: DataTypes.STRING(50) },
  grade_level: { type: DataTypes.STRING(50) },
  schedule_days: { type: DataTypes.STRING(255) },
  schedule_time: { type: DataTypes.STRING(100) },
  learning_method: { type: DataTypes.ENUM('offline', 'online') },
  learning_address: { type: DataTypes.STRING(255) },
  note: { type: DataTypes.TEXT },
  status: {
    type: DataTypes.ENUM('pending', 'matched', 'in_progress', 'completed', 'cancelled'),
    allowNull: false,
    defaultValue: 'pending',
  },
  assigned_tutor_name: { type: DataTypes.STRING(100) },
  assigned_tutor_phone: { type: DataTypes.STRING(20) },
  confirmed_schedule: { type: DataTypes.STRING(255) },
  cancellation_reason: { type: DataTypes.TEXT },
  assigned_by: { type: DataTypes.INTEGER },
  assigned_at: { type: DataTypes.DATE },
  cancelled_at: { type: DataTypes.DATE },
}, {
  tableName: 'bookings',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Booking;
