const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const reportController = require('../controllers/reportController');

// POST /api/reports - Người dùng đăng nhập gửi báo cáo
router.post('/', auth, reportController.createReport);

module.exports = router;
