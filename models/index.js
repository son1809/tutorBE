const User = require('./User');
const Tutor = require('./Tutor');
const Booking = require('./Booking');
const Review = require('./Review');

// User - Tutor (1:1)
User.hasOne(Tutor, { foreignKey: 'user_id', as: 'tutorProfile' });
Tutor.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Student (User) - Booking (1:N)
User.hasMany(Booking, { foreignKey: 'student_id', as: 'bookings' });
Booking.belongsTo(User, { foreignKey: 'student_id', as: 'student' });

// Tutor - Booking (1:N)
Tutor.hasMany(Booking, { foreignKey: 'tutor_id', as: 'bookings' });
Booking.belongsTo(Tutor, { foreignKey: 'tutor_id', as: 'tutor' });

// Student (User) - Review (1:N)
User.hasMany(Review, { foreignKey: 'student_id', as: 'reviews' });
Review.belongsTo(User, { foreignKey: 'student_id', as: 'student' });

// Tutor - Review (1:N)
Tutor.hasMany(Review, { foreignKey: 'tutor_id', as: 'reviews' });
Review.belongsTo(Tutor, { foreignKey: 'tutor_id', as: 'tutor' });

module.exports = { User, Tutor, Booking, Review };
