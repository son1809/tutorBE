const { Blog, User } = require('../models');

const blogController = {
  // Public & Admin: Lấy danh sách blog
  getAllBlogs: async (req, res) => {
    try {
      const { limit, is_published, search } = req.query;
      const whereClause = {};
      
      // Nếu là public request (hoặc truyền is_published=true), chỉ lấy bài đã publish
      if (is_published === 'true') {
        whereClause.is_published = true;
      }
      
      if (search) {
        whereClause.title = {
          [require('sequelize').Op.like]: `%${search}%`
        };
      }

      const options = {
        where: whereClause,
        include: [{ model: User, as: 'author', attributes: ['id', 'full_name'] }],
        order: [['created_at', 'DESC']],
      };

      if (limit) {
        options.limit = parseInt(limit);
      }

      const blogs = await Blog.findAll(options);
      res.json(blogs);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Lỗi server khi lấy danh sách blog' });
    }
  },

  // Public & Admin: Lấy chi tiết blog
  getBlogById: async (req, res) => {
    try {
      const blog = await Blog.findByPk(req.params.id, {
        include: [{ model: User, as: 'author', attributes: ['id', 'full_name'] }]
      });
      if (!blog) {
        return res.status(404).json({ message: 'Không tìm thấy bài viết' });
      }
      
      // Tăng view
      await blog.increment('views');
      
      res.json(blog);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Lỗi server khi lấy chi tiết blog' });
    }
  },

  // Admin: Tạo blog mới
  createBlog: async (req, res) => {
    try {
      const { title, excerpt, content, tags, category, is_published } = req.body;
      const newBlog = await Blog.create({
        title,
        excerpt,
        content,
        tags,
        category,
        is_published: is_published || false,
        author_id: req.user.id // Lấy từ auth middleware
      });
      res.status(201).json({ message: 'Tạo bài viết thành công', blog: newBlog });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Lỗi server khi tạo bài viết' });
    }
  },

  // Admin: Cập nhật blog
  updateBlog: async (req, res) => {
    try {
      const { title, excerpt, content, tags, category, is_published } = req.body;
      const blog = await Blog.findByPk(req.params.id);
      if (!blog) {
        return res.status(404).json({ message: 'Không tìm thấy bài viết' });
      }

      await blog.update({
        title,
        excerpt,
        content,
        tags,
        category,
        is_published: is_published !== undefined ? is_published : blog.is_published
      });

      res.json({ message: 'Cập nhật thành công', blog });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Lỗi server khi cập nhật bài viết' });
    }
  },

  // Admin: Xóa blog
  deleteBlog: async (req, res) => {
    try {
      const blog = await Blog.findByPk(req.params.id);
      if (!blog) {
        return res.status(404).json({ message: 'Không tìm thấy bài viết' });
      }

      await blog.destroy();
      res.json({ message: 'Xóa bài viết thành công' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Lỗi server khi xóa bài viết' });
    }
  },

  // Admin: Toggle publish
  togglePublish: async (req, res) => {
    try {
      const blog = await Blog.findByPk(req.params.id);
      if (!blog) {
        return res.status(404).json({ message: 'Không tìm thấy bài viết' });
      }

      blog.is_published = !blog.is_published;
      await blog.save();

      res.json({ message: blog.is_published ? 'Đã xuất bản' : 'Đã ẩn', blog });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Lỗi server khi cập nhật trạng thái' });
    }
  }
};

module.exports = blogController;
