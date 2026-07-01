const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Blog = sequelize.define('Blog', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  excerpt: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  content: {
    type: DataTypes.TEXT('long'),
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  tags: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  is_published: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  views: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  author_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  }
}, {
  tableName: 'blogs',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Blog;
