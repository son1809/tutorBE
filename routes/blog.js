const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
const auth = require('../middleware/auth');

// ─── PUBLIC ROUTES ───
// Lấy danh sách blog
router.get('/', blogController.getAllBlogs);

// Lấy chi tiết blog
router.get('/:id', blogController.getBlogById);

// ─── USER ROUTES (yêu cầu đăng nhập) ───
// Tạo bài viết mới (is_published = false, chờ Admin duyệt)
router.post('/', auth, blogController.createBlogByUser);

// Lấy danh sách bài của chính mình
router.get('/my/posts', auth, blogController.getMyBlogs);

// Cập nhật bài của mình
router.put('/my/:id', auth, blogController.updateMyBlog);

// Xóa bài của mình
router.delete('/my/:id', auth, blogController.deleteMyBlog);

module.exports = router;
