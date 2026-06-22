const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Một cuộc hội thoại giữa 1 User (học sinh/phụ huynh) và Admin
const Conversation = sequelize.define('Conversation', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

  // User tạo cuộc hội thoại
  user_id: { type: DataTypes.INTEGER, allowNull: false },

  // Trạng thái: open (đang mở), closed (đã giải quyết)
  status: {
    type: DataTypes.ENUM('open', 'closed'),
    defaultValue: 'open',
  },

  // Số tin nhắn chưa đọc phía admin
  unread_admin: { type: DataTypes.INTEGER, defaultValue: 0 },

  // Số tin nhắn chưa đọc phía user
  unread_user: { type: DataTypes.INTEGER, defaultValue: 0 },

  // Nội dung tin nhắn cuối cùng (để hiển thị preview)
  last_message: { type: DataTypes.STRING(255) },

  // Thời gian tin nhắn cuối
  last_message_at: { type: DataTypes.DATE },
}, {
  tableName: 'conversations',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Conversation;
