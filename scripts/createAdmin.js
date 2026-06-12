require('dotenv').config();
const bcrypt = require('bcryptjs');
const sequelize = require('../config/db');
const { User } = require('../models');

const [email, password, fullName = 'EduMatch Admin'] = process.argv.slice(2);

const createAdmin = async () => {
  if (!email || !password || password.length < 6) {
    throw new Error('Cách dùng: npm run create-admin -- <email> <password-tối-thiểu-6-ký-tự> [họ-tên]');
  }

  await sequelize.sync();

  const hashedPassword = await bcrypt.hash(password, 10);
  const [admin, created] = await User.findOrCreate({
    where: { email },
    defaults: {
      full_name: fullName,
      password: hashedPassword,
      role: 'admin',
    },
  });

  if (!created) {
    await admin.update({
      full_name: fullName,
      password: hashedPassword,
      role: 'admin',
    });
  }

  console.log(`Admin ${created ? 'đã tạo' : 'đã cập nhật'}: ${email}`);
};

createAdmin()
  .then(() => sequelize.close())
  .catch(async (err) => {
    console.error(err.message || err);
    await sequelize.close();
    process.exit(1);
  });
