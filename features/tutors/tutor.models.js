const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const Tutor = sequelize.define('Tutor', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  title: { type: DataTypes.STRING(150) },
  subject: { type: DataTypes.STRING(50), allowNull: false },
  grade_level: { type: DataTypes.STRING(50) },
  about: { type: DataTypes.TEXT },
  education: { type: DataTypes.TEXT, get() {
    const raw = this.getDataValue('education');
    return raw ? JSON.parse(raw) : [];
  }, set(val) {
    this.setDataValue('education', JSON.stringify(val));
  }},
  experience: { type: DataTypes.TEXT, get() {
    const raw = this.getDataValue('experience');
    return raw ? JSON.parse(raw) : [];
  }, set(val) {
    this.setDataValue('experience', JSON.stringify(val));
  }},
  fee_min: { type: DataTypes.INTEGER, defaultValue: 0 },
  fee_max: { type: DataTypes.INTEGER, defaultValue: 0 },
  location: { type: DataTypes.STRING(200) },
  is_verified: { type: DataTypes.BOOLEAN, defaultValue: false },
  rating_avg: { type: DataTypes.FLOAT, defaultValue: 0 },
  total_students: { type: DataTypes.INTEGER, defaultValue: 0 },
}, {
  tableName: 'tutors',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Tutor;
