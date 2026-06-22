const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const AuthSession = sequelize.define('AuthSession', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  token_id: { type: DataTypes.UUID, allowNull: false, unique: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  expires_at: { type: DataTypes.DATE, allowNull: false },
  revoked_at: { type: DataTypes.DATE },
}, {
  tableName: 'auth_sessions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = AuthSession;
