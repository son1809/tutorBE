const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Attendance = sequelize.define('Attendance', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  booking_id: { type: DataTypes.INTEGER, allowNull: false },
  session_number: { type: DataTypes.INTEGER, allowNull: false },
  session_date: { type: DataTypes.DATEONLY, allowNull: false },
  // 'scheduled' | 'present' | 'absent'
  status: { type: DataTypes.STRING(20), defaultValue: 'scheduled' },
  time_slot: { type: DataTypes.STRING(20), allowNull: true },
  note: { type: DataTypes.TEXT, allowNull: true },
  marked_at: { type: DataTypes.DATE, allowNull: true },

  // Doi lich
  reschedule_requested_date: { type: DataTypes.DATEONLY, allowNull: true },
  reschedule_time_slot: { type: DataTypes.STRING(20), allowNull: true },
  // 'student' | 'tutor'
  reschedule_requested_by: { type: DataTypes.STRING(10), allowNull: true },
  reschedule_reason: { type: DataTypes.TEXT, allowNull: true },
  // 'pending' | 'rejected'
  reschedule_status: { type: DataTypes.STRING(10), allowNull: true },
  reschedule_count: { type: DataTypes.INTEGER, defaultValue: 0 },
  reschedule_history: { type: DataTypes.TEXT, allowNull: true },
}, {
  tableName: 'attendance',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { unique: true, fields: ['booking_id', 'session_number'] }
  ]
});

module.exports = Attendance;
