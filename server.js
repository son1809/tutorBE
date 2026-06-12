require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const sequelize = require('./config/db');

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
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/tutors', require('./routes/tutors'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/admin', require('./routes/admin'));

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

// Hàm seed admin
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
