require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const sequelize = require('./config/db');

// Import models để đăng ký associations
require('./models');

const app = express();
const httpServer = http.createServer(app);

// ─── Socket.io ──────────────────────────────────────────────────────
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Map lưu socketId theo userId để gửi tin nhắn đúng người
const onlineUsers = new Map(); // userId → socketId

io.on('connection', (socket) => {
  // User/Admin đăng ký online
  socket.on('register', (userId) => {
    onlineUsers.set(String(userId), socket.id);
    socket.userId = String(userId);
    console.log(`[Socket] User ${userId} connected: ${socket.id}`);
  });

  // User gửi tin nhắn → server lưu DB → forward tới Admin
  socket.on('send_message', async ({ conversation_id, sender_id, sender_role, content }) => {
    try {
      const { Message, Conversation, User } = require('./models');

      // Lưu tin nhắn vào DB
      const message = await Message.create({
        conversation_id,
        sender_id,
        sender_role,
        content,
      });

      // Lấy thông tin sender để gửi kèm
      const sender = await User.findByPk(sender_id, { attributes: ['id', 'full_name', 'avatar'] });
      const fullMessage = { ...message.toJSON(), sender };

      // Cập nhật conversation
      const updateData = {
        last_message: content,
        last_message_at: new Date(),
      };
      // Logic cập nhật unread
      // Nếu sender là user: tăng unread của admin (nếu là chat admin) hoặc tutor (nếu chat tutor)
      // Nếu sender là admin: tăng unread của user
      // Nếu sender là tutor: tăng unread của user
      if (sender_role === 'user') {
        const conversation = await Conversation.findByPk(conversation_id);
        if (conversation && conversation.tutor_id) {
          updateData.unread_tutor = sequelize.literal('unread_tutor + 1');
        } else {
          updateData.unread_admin = sequelize.literal('unread_admin + 1');
        }
      } else {
        updateData.unread_user = sequelize.literal('unread_user + 1');
      }

      await Conversation.update(updateData, { where: { id: conversation_id } });

      // Broadcast tin nhắn vào "room" của conversation
      io.to(`conv_${conversation_id}`).emit('new_message', fullMessage);
    } catch (err) {
      console.error('[Socket] Error saving message:', err.message);
      socket.emit('error', { message: 'Gửi tin nhắn thất bại.' });
    }
  });

  // Join vào room của cuộc hội thoại để nhận tin real-time
  socket.on('join_conversation', (conversation_id) => {
    socket.join(`conv_${conversation_id}`);
  });

  // Đánh dấu đã đọc
  socket.on('mark_read', async ({ conversation_id, role }) => {
    try {
      const { Conversation, Message } = require('./models');
      
      let field = 'unread_user';
      if (role === 'admin') field = 'unread_admin';
      if (role === 'tutor') field = 'unread_tutor';
      
      await Conversation.update({ [field]: 0 }, { where: { id: conversation_id } });
      
      let senderRoleToMark = 'admin'; // if reader is user, they mark admin's messages as read
      if (role === 'admin') senderRoleToMark = 'user';
      if (role === 'tutor') senderRoleToMark = 'user';
      
      // If reader is user, they might be reading tutor messages.
      // So we just mark all messages in this conversation where sender_role != role as read
      await Message.update(
        { is_read: true },
        { 
          where: { 
            conversation_id, 
            sender_role: { [require('sequelize').Op.ne]: role } 
          } 
        }
      );
    } catch (err) {
      console.error('[Socket] Error marking read:', err.message);
    }
  });

  socket.on('disconnect', () => {
    if (socket.userId) onlineUsers.delete(socket.userId);
    console.log(`[Socket] User ${socket.userId} disconnected`);
  });
});

// Gắn io vào app để dùng trong controllers
app.set('io', io);
app.set('onlineUsers', onlineUsers);

// ─── Middleware ──────────────────────────────────────────────────────
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── Routes ─────────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/tutors', require('./routes/tutors'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/blog', require('./routes/blog'));
app.use('/api/subjects', require('./routes/subjects'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/favorites', require('./routes/favorites'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/refunds', require('./routes/refunds'));

// Health check
app.get('/', (req, res) => {
  res.json({ message: '✅ EduMatch API đang chạy!', version: '1.0.0' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route không tồn tại.' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Lỗi server không xác định.' });
});

// ─── Start Server ────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const seedAdmin = async () => {
  try {
    const bcrypt = require('bcryptjs');
    const { User } = require('./models');
    const adminEmail = 'admin@tutorconnect.com';
    const existingAdmin = await User.findOne({ where: { email: adminEmail } });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.create({
        full_name: 'System Admin',
        email: adminEmail,
        password: hashedPassword,
        phone: '0123456789',
        role: 'admin'
      });
      console.log('✨ Seeded default admin account: admin@tutorconnect.com / admin123');
    }
  } catch (err) {
    console.error('❌ Error seeding admin user:', err);
  }
};

sequelize.sync({ alter: true })
  .then(async () => {
    console.log('✅ Kết nối MySQL thành công!');
    await seedAdmin();
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
      console.log(`🔌 Socket.io đã kích hoạt`);
    });
  })
  .catch(err => {
    console.error('❌ Lỗi kết nối database:', err.message || err);
    process.exit(1);
  });

