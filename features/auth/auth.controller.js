const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomUUID } = require('crypto');
const { User, AuthSession } = require('../../models');

// Tạo JWT token
const generateToken = async (user) => {
  const tokenId = randomUUID();
  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      jwtid: tokenId,
    }
  );

  const decoded = jwt.decode(token);
  await AuthSession.create({
    token_id: tokenId,
    user_id: user.id,
    expires_at: new Date(decoded.exp * 1000),
  });

  return token;
};

// POST /api/auth/register
exports.register = async (req, res) => {
  const { full_name, email, password, phone, role, school, grade, address, children } = req.body;

  try {
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: 'Email đã được sử dụng.' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      full_name, email, password: hashed, phone,
      role: role === 'tutor' ? 'tutor' : 'student',
      school, grade, address, children
    });

    const token = await generateToken(user);
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

    const token = await generateToken(user);
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
  try {
    await req.authSession.update({ revoked_at: new Date() });
    return res.json({ message: 'Đăng xuất thành công.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Lỗi server.' });
  }
};
