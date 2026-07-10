const User = require('./User');
const Tutor = require('./Tutor');
const Booking = require('./Booking');
const Review = require('./Review');
const Payment = require('./Payment');
const Conversation = require('./Conversation');
const Message = require('./Message');
const Blog = require('./Blog');
const Subject = require('./Subject');
const Notification = require('./Notification');
const FavoriteTutor = require('./FavoriteTutor');
const Report = require('./Report');

// ─── User ↔ Tutor (1:1) ───────────────────────────────────────────
User.hasOne(Tutor, { foreignKey: 'user_id', as: 'tutorProfile' });
Tutor.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// ─── Student (User) ↔ Booking (1:N) ──────────────────────────────
User.hasMany(Booking, { foreignKey: 'student_id', as: 'bookings' });
Booking.belongsTo(User, { foreignKey: 'student_id', as: 'student' });

// ─── Tutor ↔ Booking (1:N) ───────────────────────────────────────
Tutor.hasMany(Booking, { foreignKey: 'tutor_id', as: 'bookings' });
Booking.belongsTo(Tutor, { foreignKey: 'tutor_id', as: 'tutor' });

// ─── Student (User) ↔ Review (1:N) ───────────────────────────────
User.hasMany(Review, { foreignKey: 'student_id', as: 'reviews' });
Review.belongsTo(User, { foreignKey: 'student_id', as: 'student' });

// ─── Tutor ↔ Review (1:N) ────────────────────────────────────────
Tutor.hasMany(Review, { foreignKey: 'tutor_id', as: 'reviews' });
Review.belongsTo(Tutor, { foreignKey: 'tutor_id', as: 'tutor' });

// ─── Payment ─────────────────────────────────────────────────────
// Booking có thể có nhiều Payment (trường hợp retry khi thất bại)
Booking.hasMany(Payment, { foreignKey: 'booking_id', as: 'payments' });
Payment.belongsTo(Booking, { foreignKey: 'booking_id', as: 'booking' });

User.hasMany(Payment, { foreignKey: 'student_id', as: 'payments' });
Payment.belongsTo(User, { foreignKey: 'student_id', as: 'student' });

// ─── Chat: Conversation ↔ Message ────────────────────────────────
// Mỗi User mở 1 cuộc hội thoại với Admin
User.hasMany(Conversation, { foreignKey: 'user_id', as: 'conversations' });
Conversation.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Mỗi Conversation có nhiều Messages
Conversation.hasMany(Message, { foreignKey: 'conversation_id', as: 'messages' });
Message.belongsTo(Conversation, { foreignKey: 'conversation_id', as: 'conversation' });

// Người gửi tin nhắn
User.hasMany(Message, { foreignKey: 'sender_id', as: 'sentMessages' });
Message.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' });

// ─── Blog ────────────────────────────────────────────────────────
// Tác giả blog
User.hasMany(Blog, { foreignKey: 'author_id', as: 'blogs' });
Blog.belongsTo(User, { foreignKey: 'author_id', as: 'author' });

// ─── Notifications ────────────────────────────────────────────
User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// ─── FavoriteTutors ───────────────────────────────────────────
User.hasMany(FavoriteTutor, { foreignKey: 'user_id', as: 'favoriteTutors' });
FavoriteTutor.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Tutor.hasMany(FavoriteTutor, { foreignKey: 'tutor_id', as: 'favoritedBy' });
FavoriteTutor.belongsTo(Tutor, { foreignKey: 'tutor_id', as: 'tutor' });

// ─── Reports ─────────────────────────────────────────────────────
User.hasMany(Report, { foreignKey: 'reporter_id', as: 'reports' });
Report.belongsTo(User, { foreignKey: 'reporter_id', as: 'reporter' });

module.exports = { User, Tutor, Booking, Review, Payment, Conversation, Message, Blog, Subject, Notification, FavoriteTutor, Report };
