const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const WithdrawalRequest = sequelize.define('WithdrawalRequest', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  amount: { type: DataTypes.INTEGER, allowNull: false },           // Số tiền rút
  bank_name: { type: DataTypes.STRING(100), allowNull: false },   // Tên ngân hàng
  account_number: { type: DataTypes.STRING(50), allowNull: false }, // Số tài khoản
  account_name: { type: DataTypes.STRING(200), allowNull: false }, // Tên chủ tài khoản
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected', 'processed'),
    defaultValue: 'pending',
  },
  admin_note: { type: DataTypes.TEXT, allowNull: true },
  processed_at: { type: DataTypes.DATE, allowNull: true },
}, {
  tableName: 'withdrawal_requests',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = WithdrawalRequest;
