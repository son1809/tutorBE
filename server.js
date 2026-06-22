require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const sequelize = require('./config/db');
const runMigrations = require('./config/migrate');

// Import models để đăng ký associations
require('./models');

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // Vite FE port
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./features/auth/auth.routes'));
app.use('/api/users', require('./features/users/user.routes'));
app.use('/api/tutors', require('./features/tutors/tutor.routes'));
app.use('/api/bookings', require('./features/bookings/booking.routes'));
app.use('/api/admin/bookings', require('./features/bookings/admin-booking.routes'));
app.use('/api/reviews', require('./features/reviews/review.routes'));

// Health check
app.get('/', (req, res) => {
  res.json({ message: '✅ TutorConnect API đang chạy!', version: '1.0.0' });
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

// Start server
const PORT = process.env.PORT || 5000;

sequelize.sync()
  .then(runMigrations)
  .then(() => {
    console.log('✅ Kết nối MySQL thành công!');
    app.listen(PORT, () => {
      console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ Lỗi kết nối database:', err.message || err);
    console.error('👉 Kiểm tra lại thông tin trong file .env (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME)');
    console.error('👉 Đảm bảo MySQL đang chạy trong XAMPP và đã tạo database "tutorconnect"');
    process.exit(1);
  });
