const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/register', [
  body('full_name').notEmpty().withMessage('Họ tên không được để trống'),
  body('email').isEmail().withMessage('Email không hợp lệ'),
  body('password').isLength({ min: 6 }).withMessage('Mật khẩu tối thiểu 6 ký tự'),
], authController.register);

router.post('/login', [
  body('email').isEmail().withMessage('Email không hợp lệ'),
  body('password').notEmpty().withMessage('Mật khẩu không được để trống'),
], authController.login);

router.post('/logout', auth, authController.logout);
router.get('/me', auth, authController.getMe);
router.put('/me', auth, authController.updateMe);
router.put('/me/avatar', auth, upload.single('avatar'), authController.updateAvatar);

module.exports = router;
