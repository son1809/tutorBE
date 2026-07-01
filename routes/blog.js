const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');

// ─── PUBLIC ROUTES ───
// Lấy danh sách blog
router.get('/', blogController.getAllBlogs);

// Lấy chi tiết blog
router.get('/:id', blogController.getBlogById);

module.exports = router;
