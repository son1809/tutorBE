const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Message = sequelize.define('Message', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

  // Thuộc cuộc hội thoại nào
  conversation_id: { type: DataTypes.INTEGER, allowNull: false },

  // Ai gửi (user_id của người gửi - có thể là user hoặc admin)
  sender_id: { type: DataTypes.INTEGER, allowNull: false },

  // Vai trò của người gửi để phân biệt bubble bên trái/phải
  // 'user' | 'admin'
  sender_role: { type: DataTypes.STRING(10), allowNull: false },

  // Nội dung tin nhắn
  content: { type: DataTypes.TEXT, allowNull: false },

  // Đã đọc chưa
  is_read: { type: DataTypes.BOOLEAN, defaultValue: false },
}, {
  tableName: 'messages',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Message;
