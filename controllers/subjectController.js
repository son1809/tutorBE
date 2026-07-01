const { Subject, Tutor, Booking } = require('../models');

const subjectController = {
  // Lấy tất cả môn học (chỉ lấy các môn đang active)
  getAll: async (req, res) => {
    try {
      const subjects = await Subject.findAll({ where: { is_active: true } });
      res.json(subjects);
    } catch (err) {
      res.status(500).json({ message: 'Lỗi khi lấy danh sách môn học.', error: err.message });
    }
  },

  // Dành cho Admin: Lấy tất cả môn học kèm thống kê
  getStats: async (req, res) => {
    try {
      const subjects = await Subject.findAll();
      
      const stats = await Promise.all(subjects.map(async (s) => {
        // Đếm số gia sư có môn dạy chính là môn này
        const tutor_count = await Tutor.count({ where: { subject: s.name } });
        
        // Đếm số booking liên quan đến gia sư dạy môn này
        // Hơi thủ công nhưng dễ hiểu: Lấy danh sách tutor dạy môn này, sau đó đếm booking của họ
        const tutors = await Tutor.findAll({ where: { subject: s.name }, attributes: ['id'] });
        const tutorIds = tutors.map(t => t.id);
        
        let booking_count = 0;
        if (tutorIds.length > 0) {
          booking_count = await Booking.count({ where: { tutor_id: tutorIds } });
        }

        return {
          ...s.toJSON(),
          tutor_count,
          booking_count
        };
      }));
      
      res.json(stats);
    } catch (err) {
      res.status(500).json({ message: 'Lỗi khi lấy thống kê môn học.', error: err.message });
    }
  },

  // Dành cho Admin: Thêm môn học
  create: async (req, res) => {
    try {
      const { name, icon, color, category } = req.body;
      const subject = await Subject.create({ name, icon, color, category });
      res.status(201).json({ message: 'Tạo môn học thành công', subject });
    } catch (err) {
      res.status(500).json({ message: 'Lỗi khi tạo môn học.', error: err.message });
    }
  },

  // Dành cho Admin: Cập nhật môn học
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, icon, color, category, is_active } = req.body;
      const subject = await Subject.findByPk(id);
      
      if (!subject) return res.status(404).json({ message: 'Không tìm thấy môn học.' });
      
      await subject.update({ name, icon, color, category, is_active });
      res.json({ message: 'Cập nhật thành công', subject });
    } catch (err) {
      res.status(500).json({ message: 'Lỗi khi cập nhật.', error: err.message });
    }
  },

  // Dành cho Admin: Xóa môn học
  delete: async (req, res) => {
    try {
      const { id } = req.params;
      const subject = await Subject.findByPk(id);
      
      if (!subject) return res.status(404).json({ message: 'Không tìm thấy môn học.' });
      
      await subject.destroy();
      res.json({ message: 'Xóa môn học thành công' });
    } catch (err) {
      res.status(500).json({ message: 'Lỗi khi xóa môn học.', error: err.message });
    }
  }
};

module.exports = subjectController;
