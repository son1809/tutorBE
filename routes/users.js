const express = require('express');
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const userController = require('../controllers/userController');

const router = express.Router();

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
router.put('/profile', auth, profileValidation, userController.updateProfile);

module.exports = router;
