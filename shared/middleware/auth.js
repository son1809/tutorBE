const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { User, AuthSession } = require('../../models');

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Không có token xác thực.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const session = await AuthSession.findOne({
      where: {
        token_id: decoded.jti,
        user_id: decoded.id,
        revoked_at: null,
        expires_at: { [Op.gt]: new Date() },
      },
    });

    if (!session) {
      return res.status(401).json({ message: 'Phiên đăng nhập không hợp lệ hoặc đã đăng xuất.' });
    }

    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) return res.status(401).json({ message: 'Người dùng không tồn tại.' });

    req.user = user;
    req.authSession = session;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn.' });
  }
};

module.exports = authMiddleware;
