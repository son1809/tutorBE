const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Report = sequelize.define('Report', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

  reporter_id: { type: DataTypes.INTEGER, allowNull: false },

  // 'tutor' | 'blog' | 'user' | 'review'
  target_type: { type: DataTypes.STRING(20), allowNull: false },

  target_id: { type: DataTypes.INTEGER, allowNull: false },

  // 'spam' | 'fake_info' | 'inappropriate' | 'scam' | 'other'
  reason: { type: DataTypes.STRING(30), allowNull: false },

  description: { type: DataTypes.TEXT },

  // 'pending' | 'reviewed' | 'resolved' | 'dismissed'
  status: { type: DataTypes.STRING(20), defaultValue: 'pending' },

  admin_note: { type: DataTypes.TEXT },
}, {
  tableName: 'reports',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Report;
