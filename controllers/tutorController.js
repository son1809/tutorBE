const { Op } = require('sequelize');
const { Tutor, User, Review, Certificate } = require('../models');

// GET /api/tutors  (danh sách + filter)
exports.getAllTutors = async (req, res) => {
  const { subject, grade_level, search, location, rating, page = 1, limit = 12 } = req.query;

  const where = {};
  if (subject) where.subject = subject;
  if (grade_level) where.grade_level = grade_level;
  if (location) where.location = location;
  if (rating) {
    where.rating_avg = { [Op.gte]: parseFloat(rating) };
  }

  const userWhere = {};
  if (search) {
    userWhere.full_name = { [Op.like]: `%${search}%` };
  }

  try {
    const offset = (page - 1) * limit;
    const { count, rows } = await Tutor.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'full_name', 'avatar', 'phone'],
          where: Object.keys(userWhere).length ? userWhere : undefined,
        },
        {
          model: Certificate,
          as: 'certificates',
          attributes: ['id', 'file_name', 'file_url'],
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['rating_avg', 'DESC']],
    });

    return res.json({
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit),
      tutors: rows,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Lỗi server.' });
  }
};

// GET /api/tutors/:id  (chi tiết gia sư + reviews + certificates)
exports.getTutorById = async (req, res) => {
  try {
    const tutor = await Tutor.findByPk(req.params.id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'full_name', 'avatar', 'phone'] },
        {
          model: Review, as: 'reviews',
          include: [{ model: User, as: 'student', attributes: ['id', 'full_name', 'avatar'] }],
          limit: 10,
          order: [['created_at', 'DESC']],
        },
        {
          model: Certificate,
          as: 'certificates',
          attributes: ['id', 'file_name', 'file_url', 'created_at'],
        }
      ]
    });

    if (!tutor) return res.status(404).json({ message: 'Không tìm thấy gia sư.' });

    return res.json(tutor);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Lỗi server.' });
  }
};

// GET /api/tutors/my-profile
exports.getMyProfile = async (req, res) => {
  try {
    const tutor = await Tutor.findOne({
      where: { user_id: req.user.id },
      include: [
        { model: User, as: 'user', attributes: ['id', 'full_name', 'avatar', 'phone'] }
      ]
    });
    if (!tutor) return res.status(404).json({ message: 'Không tìm thấy hồ sơ gia sư của bạn.' });
    return res.json(tutor);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Lỗi server.' });
  }
};

// POST /api/tutors  (tạo hồ sơ gia sư - chỉ role tutor)
exports.createTutor = async (req, res) => {
  if (req.user.role !== 'tutor' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Chỉ gia sư mới có thể tạo hồ sơ.' });
  }

  const existing = await Tutor.findOne({ where: { user_id: req.user.id } });
  if (existing) return res.status(400).json({ message: 'Bạn đã có hồ sơ gia sư.' });

  try {
    const { title, subject, grade_level, about, education, experience, fee_min, fee_max, location } = req.body;
    const tutor = await Tutor.create({
      user_id: req.user.id,
      title, subject, grade_level, about,
      education: education || [],
      experience: experience || [],
      fee_min, fee_max, location
    });
    return res.status(201).json({ message: 'Tạo hồ sơ thành công!', tutor });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Lỗi server.' });
  }
};

// PUT /api/tutors/:id  (cập nhật hồ sơ - admin hoặc chủ hồ sơ)
exports.updateTutor = async (req, res) => {
  try {
    const tutor = await Tutor.findByPk(req.params.id);
    if (!tutor) return res.status(404).json({ message: 'Không tìm thấy gia sư.' });

    if (tutor.user_id != req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Bạn không có quyền chỉnh sửa.' });
    }

    const { title, subject, grade_level, about, education, experience, fee_min, fee_max, location } = req.body;
    await tutor.update({ title, subject, grade_level, about, education, experience, fee_min, fee_max, location });

    return res.json({ message: 'Cập nhật thành công!', tutor });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Lỗi server.' });
  }
};

// PUT /api/tutors/my-profile  (gia sư tự cập nhật hồ sơ của mình)
exports.updateMyProfile = async (req, res) => {
  try {
    if (req.user.role !== 'tutor' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Chỉ gia sư mới có thể cập nhật hồ sơ.' });
    }

    const tutor = await Tutor.findOne({ where: { user_id: req.user.id } });
    if (!tutor) return res.status(404).json({ message: 'Không tìm thấy hồ sơ gia sư của bạn.' });

    const { title, subject, grade_level, about, education, experience, fee_min, fee_max, location } = req.body;
    await tutor.update({ title, subject, grade_level, about, education, experience, fee_min, fee_max, location });

    return res.json({ message: 'Cập nhật thành công!', tutor });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Lỗi server.' });
  }
};

// GET /api/tutors/my-certificates
exports.getMyCertificates = async (req, res) => {
  try {
    const tutor = await Tutor.findOne({ where: { user_id: req.user.id } });
    if (!tutor) return res.status(404).json({ message: 'Không tìm thấy hồ sơ gia sư.' });

    const certificates = await Certificate.findAll({
      where: { tutor_id: tutor.id },
      order: [['created_at', 'DESC']]
    });
    return res.json(certificates);
  } catch (err) {
    console.error('Error fetching certificates:', err);
    return res.status(500).json({ message: 'Lỗi server khi tải chứng chỉ.' });
  }
};

// POST /api/tutors/my-certificates
exports.uploadCertificate = async (req, res) => {
  try {
    const tutor = await Tutor.findOne({ where: { user_id: req.user.id } });
    if (!tutor) return res.status(404).json({ message: 'Không tìm thấy hồ sơ gia sư.' });

    if (!req.file) {
      return res.status(400).json({ message: 'Vui lòng chọn file.' });
    }

    const { file_name } = req.body;
    if (!file_name) {
      return res.status(400).json({ message: 'Vui lòng nhập tên chứng chỉ.' });
    }

    const file_url = `/uploads/${req.file.filename}`;
    
    const cert = await Certificate.create({
      tutor_id: tutor.id,
      file_url,
      file_name
    });

    return res.status(201).json({ message: 'Tải lên chứng chỉ thành công!', certificate: cert });
  } catch (err) {
    console.error('Error uploading certificate:', err);
    return res.status(500).json({ message: 'Lỗi server khi upload chứng chỉ.' });
  }
};

// DELETE /api/tutors/my-certificates/:id
exports.deleteCertificate = async (req, res) => {
  try {
    const tutor = await Tutor.findOne({ where: { user_id: req.user.id } });
    if (!tutor) return res.status(404).json({ message: 'Không tìm thấy hồ sơ gia sư.' });

    const cert = await Certificate.findOne({
      where: { id: req.params.id, tutor_id: tutor.id }
    });

    if (!cert) return res.status(404).json({ message: 'Không tìm thấy chứng chỉ.' });

    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(__dirname, '..', cert.file_url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await cert.destroy();
    return res.json({ message: 'Xóa chứng chỉ thành công.' });
  } catch (err) {
    console.error('Error deleting certificate:', err);
    return res.status(500).json({ message: 'Lỗi server khi xóa chứng chỉ.' });
  }
};
