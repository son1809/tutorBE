const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const auth = require('../middleware/auth');

// Lấy hoặc tạo conversation của user đang đăng nhập
router.get('/conversation', auth, chatController.getOrCreateConversation);

// Lấy messages của 1 conversation
router.get('/:conversationId/messages', auth, chatController.getMessages);

// Admin: lấy tất cả conversations
router.get('/admin/conversations', auth, chatController.getAllConversations);

// Tutor chat
router.post('/tutor-conversation', auth, chatController.getOrCreateTutorConversation);
router.get('/tutor/conversations', auth, chatController.getTutorConversations);
router.get('/user/tutor-conversations', auth, chatController.getUserTutorConversations);

module.exports = router;
