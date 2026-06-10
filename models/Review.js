const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Review = sequelize.define('Review', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  student_id: { type: DataTypes.INTEGER, allowNull: false },
  tutor_id: { type: DataTypes.INTEGER, allowNull: false },
  booking_id: { type: DataTypes.INTEGER },
  rating: { type: DataTypes.TINYINT, allowNull: false, validate: { min: 1, max: 5 } },
  comment: { type: DataTypes.TEXT },
}, {
  tableName: 'reviews',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Review;
