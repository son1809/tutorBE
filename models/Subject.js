const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Subject = sequelize.define('Subject', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
  icon: { type: DataTypes.STRING(20), defaultValue: '📚' },
  color: { type: DataTypes.STRING(20), defaultValue: '#3b82f6' },
  category: { type: DataTypes.STRING(50) },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  tableName: 'subjects',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Subject;
