const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const RefundRequest = sequelize.define('RefundRequest', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  booking_id: { type: DataTypes.INTEGER, allowNull: false },
  student_id: { type: DataTypes.INTEGER, allowNull: false },
  sessions_attended: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 }, // Số buổi đã học
  sessions_total: { type: DataTypes.INTEGER, allowNull: false },   // Tổng buổi của khóa
  sessions_remaining: { type: DataTypes.INTEGER, allowNull: false }, // Số buổi chưa học
  fee_per_session: { type: DataTypes.INTEGER, allowNull: false },   // Học phí mỗi buổi
  gross_refund: { type: DataTypes.INTEGER, allowNull: false },      // Tiền hoàn thô (chưa trừ phí)
  fee_rate: { type: DataTypes.FLOAT, defaultValue: 0.05 },          // Tỷ lệ phí hủy (5% hoặc 10%)
  fee_amount: { type: DataTypes.INTEGER, defaultValue: 0 },         // Số tiền phí hủy
  net_refund: { type: DataTypes.INTEGER, allowNull: false },        // Tiền hoàn thực tế
  reason: { type: DataTypes.TEXT, allowNull: true },                // Lý do hoàn tiền
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected', 'processed'),
    defaultValue: 'pending',
  },
  admin_note: { type: DataTypes.TEXT, allowNull: true },
  processed_at: { type: DataTypes.DATE, allowNull: true },
}, {
  tableName: 'refund_requests',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = RefundRequest;
