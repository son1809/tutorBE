const { Op } = require('sequelize');
const { Tutor, User, Review } = require('../../models');

// GET /api/tutors  (danh sách + filter)
exports.getAllTutors = async (req, res) => {
  const { subject, grade_level, search, page = 1, limit = 12 } = req.query;

  const where = {};
  if (subject) where.subject = subject;
  if (grade_level) where.grade_level = grade_level;

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

// GET /api/tutors/:id  (chi tiết gia sư + reviews)
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
        }
      ]
    });

    if (!tutor) return res.status(404).json({ message: 'Không tìm thấy gia sư.' });

    const result = tutor.toJSON();
    result.availability = result.availability || [];
    return res.json(result);
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

// PUT /api/tutors/:id  (cập nhật hồ sơ)
exports.updateTutor = async (req, res) => {
  try {
    const tutor = await Tutor.findByPk(req.params.id);
    if (!tutor) return res.status(404).json({ message: 'Không tìm thấy gia sư.' });

    if (tutor.user_id !== req.user.id && req.user.role !== 'admin') {
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
