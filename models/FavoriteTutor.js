const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const FavoriteTutor = sequelize.define('FavoriteTutor', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

  // Ai lưu yêu thích
  user_id: { type: DataTypes.INTEGER, allowNull: false },

  // Gia sư nào được lưu yêu thích
  tutor_id: { type: DataTypes.INTEGER, allowNull: false },
}, {
  tableName: 'favorite_tutors',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'tutor_id'], // Mỗi user chỉ yêu thích 1 gia sư 1 lần
    }
  ]
});

module.exports = FavoriteTutor;
