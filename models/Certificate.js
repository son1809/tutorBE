const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Certificate = sequelize.define('Certificate', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  tutor_id: { type: DataTypes.INTEGER, allowNull: false },
  file_url: { type: DataTypes.STRING, allowNull: false },
  file_name: { type: DataTypes.STRING, allowNull: false },
}, {
  tableName: 'certificates',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Certificate;
