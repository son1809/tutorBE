const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Report = sequelize.define('Report', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

  reporter_id: { type: DataTypes.INTEGER, allowNull: false },

  target_type: {
    type: DataTypes.ENUM('tutor', 'blog', 'user', 'review'),
    allowNull: false,
  },

  target_id: { type: DataTypes.INTEGER, allowNull: false },

  reason: {
    type: DataTypes.ENUM('spam', 'fake_info', 'inappropriate', 'scam', 'other'),
    allowNull: false,
  },

  description: { type: DataTypes.TEXT },

  status: {
    type: DataTypes.ENUM('pending', 'reviewed', 'resolved', 'dismissed'),
    defaultValue: 'pending',
  },

  admin_note: { type: DataTypes.TEXT },
}, {
  tableName: 'reports',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Report;
