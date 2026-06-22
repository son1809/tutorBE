const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('./auth.controller');
const auth = require('../../shared/middleware/auth');
const validate = require('../../shared/middleware/validate');

router.post('/register', [
  body('full_name').notEmpty().withMessage('Họ tên không được để trống'),
  body('email').trim().isEmail().withMessage('Email không hợp lệ').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Mật khẩu tối thiểu 6 ký tự'),
  body('role')
    .optional()
    .isIn(['student', 'tutor']).withMessage('Vai trò chỉ có thể là student hoặc tutor'),
  body('children')
    .optional({ nullable: true })
    .isArray().withMessage('Thông tin trẻ em phải là một danh sách'),
], validate, authController.register);

router.post('/login', [
  body('email').trim().isEmail().withMessage('Email không hợp lệ').normalizeEmail(),
  body('password').notEmpty().withMessage('Mật khẩu không được để trống'),
], validate, authController.login);

router.post('/logout', auth, authController.logout);

module.exports = router;
