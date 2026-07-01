const express = require('express');
const router = express.Router();
const subjectController = require('../controllers/subjectController');

// Lấy danh sách môn học (Public API)
router.get('/', subjectController.getAll);

module.exports = router;
