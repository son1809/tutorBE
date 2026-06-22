const express = require('express');
const { body } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../../shared/middleware/auth');
const validate = require('../../shared/middleware/validate');
const userController = require('./user.controller');

const router = express.Router();

const avatarDir = path.join(__dirname, '../../uploads/avatars');
fs.mkdirSync(avatarDir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: avatarDir,
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${req.user.id}-${Date.now()}${ext}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Chỉ được tải lên file ảnh.'));
    }
    cb(null, true);
  },
});

const profileValidation = [
  body('full_name')
    .optional()
    .trim()
    .notEmpty().withMessage('Họ tên không được để trống')
    .isLength({ max: 100 }).withMessage('Họ tên tối đa 100 ký tự'),
  body('phone')
    .optional({ nullable: true })
    .isLength({ max: 20 }).withMessage('Số điện thoại tối đa 20 ký tự'),
  body('school')
    .optional({ nullable: true })
    .isLength({ max: 150 }).withMessage('Tên trường tối đa 150 ký tự'),
  body('grade')
    .optional({ nullable: true })
    .isLength({ max: 20 }).withMessage('Lớp học tối đa 20 ký tự'),
  body('address')
    .optional({ nullable: true })
    .isLength({ max: 255 }).withMessage('Địa chỉ tối đa 255 ký tự'),
  body('children')
    .optional({ nullable: true })
    .isArray().withMessage('Thông tin trẻ em phải là một danh sách'),
];

router.get('/profile', auth, userController.getProfile);
router.put('/profile', auth, profileValidation, validate, userController.updateProfile);
router.post('/avatar', auth, upload.single('avatar'), userController.uploadAvatar);

module.exports = router;
