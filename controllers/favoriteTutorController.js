const { FavoriteTutor, Tutor, User } = require('../models');

const favoriteTutorController = {
  // Lấy danh sách gia sư yêu thích của tôi
  getMy: async (req, res) => {
    try {
      const favorites = await FavoriteTutor.findAll({
        where: { user_id: req.user.id },
        include: [{
          model: Tutor,
          as: 'tutor',
          include: [{ model: User, as: 'user', attributes: ['id', 'full_name', 'avatar'] }],
        }],
        order: [['created_at', 'DESC']],
      });
      res.json(favorites);
    } catch (err) {
      res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
  },

  // Thêm vào yêu thích (toggle: nếu đã có thì xoá, chưa có thì thêm)
  toggle: async (req, res) => {
    try {
      const { tutor_id } = req.body;
      if (!tutor_id) return res.status(400).json({ message: 'Thiếu tutor_id.' });

      const existing = await FavoriteTutor.findOne({
        where: { user_id: req.user.id, tutor_id },
      });

      if (existing) {
        await existing.destroy();
        res.json({ favorited: false, message: 'Đã bỏ yêu thích' });
      } else {
        await FavoriteTutor.create({ user_id: req.user.id, tutor_id });
        res.json({ favorited: true, message: 'Đã thêm vào yêu thích' });
      }
    } catch (err) {
      res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
  },

  // Kiểm tra xem một gia sư cụ thể đã được yêu thích chưa
  checkOne: async (req, res) => {
    try {
      const { tutor_id } = req.params;
      const exists = await FavoriteTutor.findOne({
        where: { user_id: req.user.id, tutor_id },
      });
      res.json({ favorited: !!exists });
    } catch (err) {
      res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
  },
};

module.exports = favoriteTutorController;
