const { Conversation, Message, User } = require('../models');
const { Op } = require('sequelize');

// GET /api/chat/conversation  - Lấy hoặc tạo conversation của user hiện tại
exports.getOrCreateConversation = async (req, res) => {
  try {
    let conversation = await Conversation.findOne({
      where: { user_id: req.user.id },
      order: [['created_at', 'DESC']],
    });

    if (!conversation) {
      conversation = await Conversation.create({ user_id: req.user.id });
    }

    return res.json(conversation);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Lỗi server.' });
  }
};

// GET /api/chat/:conversationId/messages  - Lấy danh sách tin nhắn
exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;

    // Kiểm tra quyền truy cập
    const conversation = await Conversation.findByPk(conversationId);
    if (!conversation) return res.status(404).json({ message: 'Không tìm thấy hội thoại.' });

    // User chỉ được xem conversation của chính họ, admin xem tất cả
    if (req.user.role !== 'admin' && conversation.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Không có quyền truy cập.' });
    }

    const messages = await Message.findAll({
      where: { conversation_id: conversationId },
      include: [{ model: User, as: 'sender', attributes: ['id', 'full_name', 'avatar'] }],
      order: [['created_at', 'ASC']],
      limit: 100,
    });

    // Đánh dấu đã đọc
    const readerRole = req.user.role === 'admin' ? 'admin' : 'user';
    const senderRole = readerRole === 'admin' ? 'user' : 'admin';

    await Message.update(
      { is_read: true },
      { where: { conversation_id: conversationId, sender_role: senderRole, is_read: false } }
    );

    const field = readerRole === 'admin' ? 'unread_admin' : 'unread_user';
    await Conversation.update({ [field]: 0 }, { where: { id: conversationId } });

    return res.json(messages);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Lỗi server.' });
  }
};

// GET /api/chat/admin/conversations  - Admin lấy danh sách tất cả conversations
exports.getAllConversations = async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Chỉ admin mới có quyền.' });
  }

  try {
    const conversations = await Conversation.findAll({
      include: [{ model: User, as: 'user', attributes: ['id', 'full_name', 'avatar', 'email'] }],
      order: [['last_message_at', 'DESC']],
    });
    return res.json(conversations);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Lỗi server.' });
  }
};
