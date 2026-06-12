const { DataTypes } = require('sequelize');
const sequelize = require('./db');

const addColumnIfMissing = async (table, columns, name, definition) => {
  if (!columns[name]) {
    await sequelize.getQueryInterface().addColumn(table, name, definition);
  }
};

const runMigrations = async () => {
  const queryInterface = sequelize.getQueryInterface();
  const bookingColumns = await queryInterface.describeTable('bookings');

  await queryInterface.changeColumn('bookings', 'tutor_id', {
    type: DataTypes.INTEGER,
    allowNull: true,
  });
  await queryInterface.changeColumn('bookings', 'schedule_days', {
    type: DataTypes.STRING(255),
    allowNull: true,
  });
  await queryInterface.changeColumn('bookings', 'schedule_time', {
    type: DataTypes.STRING(100),
    allowNull: true,
  });
  await queryInterface.changeColumn('bookings', 'status', {
    type: DataTypes.ENUM('pending', 'matched', 'in_progress', 'completed', 'cancelled'),
    allowNull: false,
    defaultValue: 'pending',
  });

  await addColumnIfMissing('bookings', bookingColumns, 'learning_method', {
    type: DataTypes.ENUM('offline', 'online'),
    allowNull: true,
  });
  await addColumnIfMissing('bookings', bookingColumns, 'learning_address', {
    type: DataTypes.STRING(255),
    allowNull: true,
  });
  await addColumnIfMissing('bookings', bookingColumns, 'assigned_tutor_name', {
    type: DataTypes.STRING(100),
    allowNull: true,
  });
  await addColumnIfMissing('bookings', bookingColumns, 'assigned_tutor_phone', {
    type: DataTypes.STRING(20),
    allowNull: true,
  });
  await addColumnIfMissing('bookings', bookingColumns, 'confirmed_schedule', {
    type: DataTypes.STRING(255),
    allowNull: true,
  });
  await addColumnIfMissing('bookings', bookingColumns, 'cancellation_reason', {
    type: DataTypes.TEXT,
    allowNull: true,
  });
  await addColumnIfMissing('bookings', bookingColumns, 'assigned_by', {
    type: DataTypes.INTEGER,
    allowNull: true,
  });
  await addColumnIfMissing('bookings', bookingColumns, 'assigned_at', {
    type: DataTypes.DATE,
    allowNull: true,
  });
  await addColumnIfMissing('bookings', bookingColumns, 'cancelled_at', {
    type: DataTypes.DATE,
    allowNull: true,
  });
};

module.exports = runMigrations;
