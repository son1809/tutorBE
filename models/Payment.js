const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Payment = sequelize.define('Payment', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

  // Thanh toán cho khóa học nào
  booking_id: { type: DataTypes.INTEGER, allowNull: false },

  // Ai thanh toán
  student_id: { type: DataTypes.INTEGER, allowNull: false },

  // Số tiền (đơn vị: VNĐ)
  amount: { type: DataTypes.BIGINT, allowNull: false },

  // Phương thức: VNPAY | MOMO | CASH
  // 'VNPAY' | 'MOMO' | 'CASH'
  payment_method: { type: DataTypes.STRING(20), defaultValue: 'VNPAY' },

  // Mã giao dịch trả về từ cổng thanh toán
  transaction_id: { type: DataTypes.STRING(100), unique: true },

  // Dữ liệu raw từ cổng thanh toán (JSON string) để đối soát
  gateway_data: { type: DataTypes.TEXT },

  // Trạng thái giao dịch
  // 'pending' | 'success' | 'failed' | 'refunded'
  status: { type: DataTypes.STRING(20), defaultValue: 'pending' },

  // Thời điểm thanh toán thành công
  paid_at: { type: DataTypes.DATE },
}, {
  tableName: 'payments',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Payment;
