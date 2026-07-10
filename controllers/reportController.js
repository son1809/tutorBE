const { Report, User } = require('../models');
const { Op } = require('sequelize');

const REASON_LABELS = {
  spam: 'Spam / Quảng cáo',
  fake_info: 'Thông tin giả mạo',
  inappropriate: 'Nội dung không phù hợp',
  scam: 'Lừa đảo',
  other: 'Khác',
};

// POST /api/reports  - Người dùng gửi báo cáo
exports.createReport = async (req, res) => {
  const { target_type, target_id, reason, description } = req.body;

  if (!target_type || !target_id || !reason) {
    return res.status(400).json({ message: 'Thiếu thông tin bắt buộc.' });
  }

  const validTypes = ['tutor', 'blog', 'user', 'review'];
  const validReasons = ['spam', 'fake_info', 'inappropriate', 'scam', 'other'];

  if (!validTypes.includes(target_type)) {
    return res.status(400).json({ message: 'Loại đối tượng không hợp lệ.' });
  }
  if (!validReasons.includes(reason)) {
    return res.status(400).json({ message: 'Lý do báo cáo không hợp lệ.' });
  }

  try {
    // Kiểm tra đã báo cáo đối tượng này chưa
    const existing = await Report.findOne({
      where: {
        reporter_id: req.user.id,
        target_type,
        target_id,
        status: { [Op.ne]: 'dismissed' },
      },
    });

    if (existing) {
      return res.status(409).json({ message: 'Bạn đã báo cáo đối tượng này rồi.' });
    }

    const report = await Report.create({
      reporter_id: req.user.id,
      target_type,
      target_id,
      reason,
      description: description || null,
    });

    return res.status(201).json({ message: 'Báo cáo đã được gửi thành công.', report });
  } catch (err) {
    console.error('Error creating report:', err);
    return res.status(500).json({ message: 'Lỗi server.' });
  }
};

// GET /api/admin/reports  - Admin xem danh sách báo cáo
exports.getReports = async (req, res) => {
  const { status, target_type, search } = req.query;
  const where = {};
  if (status) where.status = status;
  if (target_type) where.target_type = target_type;

  try {
    const reports = await Report.findAll({
      where,
      include: [
        { model: User, as: 'reporter', attributes: ['id', 'full_name', 'email', 'avatar'] },
      ],
      order: [['created_at', 'DESC']],
    });

    // Filter theo search tên người báo cáo
    const filtered = search
      ? reports.filter(r =>
          r.reporter?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
          r.reporter?.email?.toLowerCase().includes(search.toLowerCase())
        )
      : reports;

    return res.json(filtered);
  } catch (err) {
    console.error('Error getting reports:', err);
    return res.status(500).json({ message: 'Lỗi server.' });
  }
};

// PATCH /api/admin/reports/:id  - Admin cập nhật trạng thái + ghi chú
exports.updateReport = async (req, res) => {
  const { id } = req.params;
  const { status, admin_note } = req.body;

  const validStatuses = ['pending', 'reviewed', 'resolved', 'dismissed'];
  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Trạng thái không hợp lệ.' });
  }

  try {
    const report = await Report.findByPk(id);
    if (!report) return res.status(404).json({ message: 'Không tìm thấy báo cáo.' });

    await report.update({
      ...(status && { status }),
      ...(admin_note !== undefined && { admin_note }),
    });

    return res.json({ message: 'Cập nhật báo cáo thành công.', report });
  } catch (err) {
    console.error('Error updating report:', err);
    return res.status(500).json({ message: 'Lỗi server.' });
  }
};

// DELETE /api/admin/reports/:id  - Admin xóa báo cáo
exports.deleteReport = async (req, res) => {
  const { id } = req.params;
  try {
    const report = await Report.findByPk(id);
    if (!report) return res.status(404).json({ message: 'Không tìm thấy báo cáo.' });

    await report.destroy();
    return res.json({ message: 'Xóa báo cáo thành công.' });
  } catch (err) {
    console.error('Error deleting report:', err);
    return res.status(500).json({ message: 'Lỗi server.' });
  }
};

module.exports.REASON_LABELS = REASON_LABELS;
