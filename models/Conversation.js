const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Một cuộc hội thoại giữa 1 User (học sinh/phụ huynh) và Admin
const Conversation = sequelize.define('Conversation', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

  // User tạo cuộc hội thoại
  user_id: { type: DataTypes.INTEGER, allowNull: false },

  // Trạng thái: open (đang mở), closed (đã giải quyết)
  // 'open' | 'closed'
  status: { type: DataTypes.STRING(10), defaultValue: 'open' },

  // Số tin nhắn chưa đọc phía admin
  unread_admin: { type: DataTypes.INTEGER, defaultValue: 0 },

  // Gia sư (nếu đây là cuộc hội thoại giữa học sinh và gia sư)
  tutor_id: { type: DataTypes.INTEGER, allowNull: true },

  // Số tin nhắn chưa đọc phía gia sư
  unread_tutor: { type: DataTypes.INTEGER, defaultValue: 0 },

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
