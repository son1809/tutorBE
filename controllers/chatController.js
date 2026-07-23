const { Conversation, Message, User } = require('../models');
const { Op } = require('sequelize');

// GET /api/chat/conversation  - Lấy hoặc tạo conversation của user hiện tại (với Admin)
exports.getOrCreateConversation = async (req, res) => {
  try {
    let conversation = await Conversation.findOne({
      where: { user_id: req.user.id, tutor_id: null },
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

    // User xem thì phải là user_id, Tutor xem thì phải là tutor_id, Admin xem được hết
    if (req.user.role !== 'admin' && conversation.user_id !== req.user.id && conversation.tutor_id !== req.user.id) {
      return res.status(403).json({ message: 'Không có quyền truy cập.' });
    }

    const messages = await Message.findAll({
      where: { conversation_id: conversationId },
      include: [{ model: User, as: 'sender', attributes: ['id', 'full_name', 'avatar'] }],
      order: [['created_at', 'ASC']],
      limit: 100,
    });

    // Đánh dấu đã đọc
    let readerRole = 'user';
    if (req.user.role === 'admin') readerRole = 'admin';
    if (req.user.id === conversation.tutor_id) readerRole = 'tutor';

    let senderRole = 'admin'; // if reader is user
    if (readerRole === 'admin') senderRole = 'user';
    if (readerRole === 'tutor') senderRole = 'user';
    if (readerRole === 'user' && conversation.tutor_id) senderRole = 'tutor';

    await Message.update(
      { is_read: true },
      { where: { conversation_id: conversationId, sender_role: senderRole, is_read: false } }
    );

    let field = 'unread_user';
    if (readerRole === 'admin') field = 'unread_admin';
    if (readerRole === 'tutor') field = 'unread_tutor';
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
      where: { tutor_id: null }, // Only admin conversations
      include: [
        { model: User, as: 'user', attributes: ['id', 'full_name', 'avatar', 'email'] },
        // Chỉ lấy conversation đã có ít nhất 1 tin nhắn
        { model: Message, as: 'messages', attributes: ['id'], required: true },
      ],
      order: [['last_message_at', 'DESC']],
    });
    return res.json(conversations);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Lỗi server.' });
  }
};

// POST /api/chat/tutor-conversation
exports.getOrCreateTutorConversation = async (req, res) => {
  try {
    const { tutor_id } = req.body;
    if (!tutor_id) return res.status(400).json({ message: 'tutor_id is required' });

    let conversation = await Conversation.findOne({
      where: { user_id: req.user.id, tutor_id },
    });

    if (!conversation) {
      conversation = await Conversation.create({ user_id: req.user.id, tutor_id });
    }

    return res.json(conversation);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Lỗi server.' });
  }
};

// GET /api/chat/tutor/conversations
exports.getTutorConversations = async (req, res) => {
  try {
    const conversations = await Conversation.findAll({
      where: { tutor_id: req.user.id },
      include: [
        { model: User, as: 'user', attributes: ['id', 'full_name', 'avatar', 'email'] },
        { model: Message, as: 'messages', attributes: ['id'], required: false },
      ],
      order: [['last_message_at', 'DESC']],
    });
    return res.json(conversations);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Lỗi server.' });
  }
};

// GET /api/chat/user/tutor-conversations
exports.getUserTutorConversations = async (req, res) => {
  try {
    const conversations = await Conversation.findAll({
      where: { user_id: req.user.id, tutor_id: { [Op.not]: null } },
      include: [
        { 
          model: User, 
          as: 'tutor', 
          attributes: ['id', 'full_name', 'avatar', 'email', 'role'],
          where: { role: { [Op.ne]: 'admin' } }
        },
        { model: Message, as: 'messages', attributes: ['id'], required: false },
      ],
      order: [['last_message_at', 'DESC']],
    });
    return res.json(conversations);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Lỗi server.' });
  }
};
