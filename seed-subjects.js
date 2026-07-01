require('dotenv').config();
const { Subject } = require('./models');
const sequelize = require('./config/db');

const subjects = [
  { name: 'Toán', icon: '📐', color: '#6366f1', category: 'Tự nhiên' },
  { name: 'Vật Lý', icon: '🔬', color: '#10b981', category: 'Tự nhiên' },
  { name: 'Hóa Học', icon: '⚗️', color: '#f59e0b', category: 'Tự nhiên' },
  { name: 'Sinh Học', icon: '🧬', color: '#ef4444', category: 'Tự nhiên' },
  { name: 'Lịch Sử', icon: '🏛️', color: '#ec4899', category: 'Xã hội' },
  { name: 'Địa Lý', icon: '🌍', color: '#14b8a6', category: 'Xã hội' },
  { name: 'Ngữ Văn', icon: '📚', color: '#8b5cf6', category: 'Xã hội' },
  { name: 'Tiếng Anh', icon: '🇬🇧', color: '#3b82f6', category: 'Ngoại ngữ' },
];

async function seed() {
  try {
    await sequelize.sync();
    for (const sub of subjects) {
      const [subject, created] = await Subject.findOrCreate({
        where: { name: sub.name },
        defaults: sub
      });
      if (created) {
        console.log(`Đã thêm môn: ${sub.name}`);
      } else {
        console.log(`Đã tồn tại môn: ${sub.name}`);
      }
    }
    console.log('Hoàn tất thêm môn học.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
