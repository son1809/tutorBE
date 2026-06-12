const User = require('./User');
const Tutor = require('./Tutor');
const Booking = require('./Booking');
const Review = require('./Review');
const AuthSession = require('./AuthSession');

// User - Tutor (1:1)
User.hasOne(Tutor, { foreignKey: 'user_id', as: 'tutorProfile' });
Tutor.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Student (User) - Booking (1:N)
User.hasMany(Booking, {
  foreignKey: { name: 'student_id', allowNull: false },
  as: 'bookings',
  onDelete: 'RESTRICT',
});
Booking.belongsTo(User, {
  foreignKey: { name: 'student_id', allowNull: false },
  as: 'student',
  onDelete: 'RESTRICT',
});

// Tutor - Booking (1:N)
Tutor.hasMany(Booking, {
  foreignKey: { name: 'tutor_id', allowNull: true },
  as: 'bookings',
  onDelete: 'RESTRICT',
});
Booking.belongsTo(Tutor, {
  foreignKey: { name: 'tutor_id', allowNull: true },
  as: 'tutor',
  onDelete: 'RESTRICT',
});

// Admin - Booking assignment (1:N)
User.hasMany(Booking, { foreignKey: 'assigned_by', as: 'assignedBookings' });
Booking.belongsTo(User, { foreignKey: 'assigned_by', as: 'assignedByAdmin' });

// User - AuthSession (1:N)
User.hasMany(AuthSession, { foreignKey: 'user_id', as: 'authSessions' });
AuthSession.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Student (User) - Review (1:N)
User.hasMany(Review, { foreignKey: 'student_id', as: 'reviews' });
Review.belongsTo(User, { foreignKey: 'student_id', as: 'student' });

// Tutor - Review (1:N)
Tutor.hasMany(Review, { foreignKey: 'tutor_id', as: 'reviews' });
Review.belongsTo(Tutor, { foreignKey: 'tutor_id', as: 'tutor' });

module.exports = { User, Tutor, Booking, Review, AuthSession };
