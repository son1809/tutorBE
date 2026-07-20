const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Attendance = sequelize.define('Attendance', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  booking_id: { type: DataTypes.INTEGER, allowNull: false },
  session_number: { type: DataTypes.INTEGER, allowNull: false }, // Buổi thứ mấy (1, 2, 3...)
  session_date: { type: DataTypes.DATEONLY, allowNull: false },  // Ngày buổi học
  status: {
    type: DataTypes.ENUM('scheduled', 'present', 'absent'),
    defaultValue: 'scheduled',
    // scheduled: chưa đến ngày / chưa điểm danh
    // present: đã điểm danh (gia sư xác nhận)
    // absent: vắng mặt
  },
  note: { type: DataTypes.TEXT, allowNull: true }, // Ghi chú của gia sư
  marked_at: { type: DataTypes.DATE, allowNull: true }, // Thời điểm điểm danh
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
