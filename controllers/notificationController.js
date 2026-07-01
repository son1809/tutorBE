const { Notification } = require('../models');

const notificationController = {
  // Lấy tất cả thông báo của tôi (mới nhất trước)
  getMy: async (req, res) => {
    try {
      const notifications = await Notification.findAll({
        where: { user_id: req.user.id },
        order: [['created_at', 'DESC']],
        limit: 50,
      });
      res.json(notifications);
    } catch (err) {
      res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
  },

  // Đếm số thông báo chưa đọc
  getUnreadCount: async (req, res) => {
    try {
      const count = await Notification.count({
        where: { user_id: req.user.id, is_read: false },
      });
      res.json({ count });
    } catch (err) {
      res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
  },

  // Đánh dấu một thông báo đã đọc
  markRead: async (req, res) => {
    try {
      const noti = await Notification.findOne({
        where: { id: req.params.id, user_id: req.user.id },
      });
      if (!noti) return res.status(404).json({ message: 'Không tìm thấy thông báo.' });
      await noti.update({ is_read: true });
      res.json({ message: 'Đã đánh dấu đã đọc' });
    } catch (err) {
      res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
  },

  // Đánh dấu tất cả đã đọc
  markAllRead: async (req, res) => {
    try {
      await Notification.update(
        { is_read: true },
        { where: { user_id: req.user.id, is_read: false } }
      );
      res.json({ message: 'Đã đánh dấu tất cả đã đọc' });
    } catch (err) {
      res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
  },

  // Xoá một thông báo
  deleteOne: async (req, res) => {
    try {
      const noti = await Notification.findOne({
        where: { id: req.params.id, user_id: req.user.id },
      });
      if (!noti) return res.status(404).json({ message: 'Không tìm thấy thông báo.' });
      await noti.destroy();
      res.json({ message: 'Đã xoá thông báo' });
    } catch (err) {
      res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
  },

  // Helper: Tạo thông báo từ server (dùng nội bộ trong các controller khác)
  create: async ({ user_id, type, title, message, link, ref_id }) => {
    try {
      await Notification.create({ user_id, type, title, message, link, ref_id });
    } catch (err) {
      console.error('Lỗi tạo notification:', err.message);
    }
  },
};

module.exports = notificationController;
