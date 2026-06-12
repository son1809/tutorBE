const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { User } = require('../models');

// Tạo JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// POST /api/auth/register
exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { full_name, email, password, phone, role, school, grade } = req.body;

  try {
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: 'Email đã được sử dụng.' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      full_name, email, password: hashed, phone,
      role: role || 'student', school, grade
    });

    const token = generateToken(user);
    const { password: _, ...userInfo } = user.toJSON();

    return res.status(201).json({
      message: 'Đăng ký thành công!',
      token,
      user: userInfo
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Lỗi server.' });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Email hoặc mật khẩu không đúng.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Email hoặc mật khẩu không đúng.' });
    }

    const token = generateToken(user);
    const { password: _, ...userInfo } = user.toJSON();

    return res.json({
      message: 'Đăng nhập thành công!',
      token,
      user: userInfo
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Lỗi server.' });
  }
};

// POST /api/auth/logout
exports.logout = async (req, res) => {
  return res.json({ message: 'Đăng xuất thành công!' });
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
  return res.json({ user: req.user });
};

// PUT /api/auth/me  (cập nhật thông tin cá nhân)
exports.updateMe = async (req, res) => {
  const { full_name, phone, school, grade } = req.body;
  try {
    await User.update({ full_name, phone, school, grade }, { where: { id: req.user.id } });
    const updated = await User.findByPk(req.user.id, { attributes: { exclude: ['password'] } });
    return res.json({ message: 'Cập nhật thành công!', user: updated });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Lỗi server.' });
  }
};
