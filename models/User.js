const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  full_name: { type: DataTypes.STRING(100), allowNull: false },
  email: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  password: { type: DataTypes.STRING(255), allowNull: false },
  phone: { type: DataTypes.STRING(20) },
  role: { type: DataTypes.ENUM('student', 'tutor', 'admin'), defaultValue: 'student' },
  school: { type: DataTypes.STRING(150) },
  grade: { type: DataTypes.STRING(20) },
  avatar: { type: DataTypes.STRING(255) },
  balance: { type: DataTypes.INTEGER, defaultValue: 0 },
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = User;
