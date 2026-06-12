const { User } = require('../models');

exports.getProfile = async (req, res) => {
  return res.json({ user: req.user });
};

exports.updateProfile = async (req, res) => {
  const allowedFields = ['full_name', 'phone', 'school', 'grade', 'address', 'children'];
  const updates = {};

  allowedFields.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(req.body, field)) {
      updates[field] = req.body[field];
    }
  });

  try {
    await User.update(updates, { where: { id: req.user.id } });
    const updated = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    return res.json({ message: 'Cập nhật thành công!', user: updated });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Lỗi server.' });
  }
};
