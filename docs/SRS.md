# EduMatch Software Requirements Specification (Demo Baseline)

## 1. Purpose

EduMatch is a web-based tutor marketplace that connects students with tutors and provides administration tools for managing users, tutors, bookings, reviews, subjects, blogs, reports, and support conversations.

This SRS describes the behavior visible in the current codebase. It is intended for a project demo and acceptance testing, not as a production-readiness claim.

## 2. Scope

### 2.1 In scope

- Public tutor and subject browsing
- Student and tutor registration and login
- Role-based student, tutor, and administrator interfaces
- Tutor profile and certificate management
- Lesson booking and booking conflict checks
- Student and tutor schedule views
- Administrator management functions
- Tutor reviews, favorites, notifications, blog posts, reports, and real-time support chat

### 2.2 Out of scope or incomplete in the current build

- A persistent “Find a new tutor” request: the student dashboard currently simulates success without saving data.
- The review form in the student dashboard: it is static; reviews submitted from supported tutor/review flows use the backend.
- Production payment processing: the frontend references VNPay/payment-history endpoints, but the backend does not mount payment routes. The frontend contains a demo fallback.
- Google login unless a valid Google OAuth client ID is configured.
- Production security, scalability, availability, backup, and recovery guarantees.

## 3. Product Overview

### 3.1 Technology

- Frontend: React, Vite, React Router
- Backend: Node.js, Express, Sequelize
- Database: MariaDB/MySQL
- Real-time communication: Socket.IO
- Authentication: JWT bearer tokens stored by the browser
- Deployment for demo: Compose containers

### 3.2 User roles

| Role | Main capabilities |
|---|---|
| Visitor | Browse tutors, subjects, reviews, and published blogs; view tutor details; register or log in |
| Student | Maintain a profile, book and cancel lessons, view schedule, favorite/review/report tutors, receive notifications, write blogs, and contact support |
| Tutor | Maintain tutor profile and certificates, view bookings, schedule, and income summary, and receive notifications |
| Administrator | View statistics and manage users, tutors, bookings, reviews, subjects, blogs, reports, and support chats |

## 4. Functional Requirements

### FR-01 Authentication and authorization

- The system shall allow a user to register as a student or tutor with name, email, and password.
- The system shall reject an already registered email.
- The system shall allow valid users to log in and shall return a JWT and user information.
- The system shall reject invalid credentials without identifying which credential was wrong.
- The system shall create an initial tutor profile when a tutor registers.
- The system shall restrict tutor pages to tutor accounts and admin pages to administrator accounts.
- The system shall allow an authenticated user to view and update their basic profile.

### FR-02 Tutor discovery

- The system shall list tutor profiles.
- The system shall support tutor filtering through query parameters used by the tutor listing UI.
- The system shall display a tutor’s identity, subject, grade level, description, fees, location, verification state, rating, and experience where available.
- The system shall provide subject-specific tutor pages.
- The system shall display only available data and handle an unknown tutor identifier as not found.

### FR-03 Tutor profile management

- A tutor shall be able to view and update their teaching profile.
- A tutor shall be able to upload and delete certificate evidence.
- An administrator shall be able to verify or unverify a tutor.
- A tutor’s verification state shall be visible in tutor data returned to clients.

### FR-04 Booking management

- An authenticated student shall be able to submit a booking containing tutor, subject, grade level, start date, duration, study days, time slot, session count, estimated price, and an optional note.
- The system shall reject a booking for a nonexistent tutor.
- The system shall reject a booking that overlaps a non-cancelled booking for the same tutor, intersecting course dates, at least one identical study day, and the same time slot.
- A new booking shall start in `pending` status.
- A student shall be able to list their bookings and cancel their own booking.
- A tutor shall be able to list bookings assigned to their tutor profile and view booking statistics.
- An administrator shall be able to list bookings, change status to a supported value (`pending`, `matched`, or `cancelled`), and delete a booking.
- Booking actions shall create relevant in-app notifications where implemented; email failure shall not prevent booking creation.

### FR-05 Reviews, favorites, and reports

- An authenticated user shall be able to submit a tutor review through a backend-connected review flow.
- Visitors shall be able to view tutor reviews and the review listing.
- A student shall be able to add or remove a tutor from favorites and list favorite tutors.
- An authenticated user shall be able to submit a report.
- An administrator shall be able to review, update, and delete reports and delete inappropriate reviews.

### FR-06 Notifications

- A signed-in user shall be able to list their notifications and unread count.
- A user shall be able to mark one or all notifications as read.
- A user shall be able to delete a notification.

### FR-07 Blog

- Visitors shall be able to list and read published blog posts.
- An authenticated user shall be able to create and manage their own posts.
- An administrator shall be able to create, update, delete, publish, or unpublish posts.

### FR-08 Support chat

- An authenticated user shall be able to get or create a support conversation and retrieve its messages.
- Users and administrators shall be able to exchange messages in real time through Socket.IO.
- The system shall store messages, update the last-message metadata, maintain unread counts, and support marking messages as read.
- An administrator shall be able to view support conversations in the admin chat interface.

### FR-09 Administration

- The system shall provide aggregate dashboard statistics.
- An administrator shall be able to list, update, or delete users.
- An administrator shall be able to list, verify, or delete tutors.
- An administrator shall be able to manage bookings, reviews, subjects, blogs, and reports.
- Non-admin accounts shall receive an authorization error when accessing admin-protected APIs or pages.

## 5. Data Requirements

Principal entities are User, Tutor, Certificate, Subject, Booking, Review, FavoriteTutor, Notification, Blog, Report, Conversation, Message, and Payment.

Important constraints:

- User email is unique.
- User role is `student`, `tutor`, or `admin`.
- Booking status is `pending`, `matched`, or `cancelled`.
- Tutor and student records are linked to users by identifiers.
- A booking belongs to one student and one tutor.
- A message belongs to one conversation.
- Uploaded files are served under `/uploads`.

## 6. External Interface Requirements

### 6.1 User interface

- The public UI shall be accessible at `http://localhost:5173` in the demo environment.
- The UI shall provide public navigation and separate full-screen layouts for tutor, admin, and payment-return pages.
- Forms shall show success, empty, loading, or error feedback where implemented.

### 6.2 API

- The REST API shall be accessible at `http://localhost:5000/api` in the demo environment.
- Protected requests shall use `Authorization: Bearer <token>`.
- API requests and responses shall use JSON except file uploads, which shall use multipart form data.

### 6.3 Email and OAuth

- Email notifications depend on configured SMTP credentials and are non-blocking for booking creation.
- Google login depends on a configured OAuth web client ID and is optional for the standard demo.

## 7. Non-Functional Requirements for Demo Acceptance

- NFR-01 Usability: the main demo tasks shall be reachable from visible navigation or documented URLs.
- NFR-02 Compatibility: the UI shall run in a current Chromium-based browser at desktop width.
- NFR-03 Response: local list/detail operations should normally complete within 3 seconds after containers are ready.
- NFR-04 Integrity: passwords shall be stored as bcrypt hashes and shall not be returned by login/profile APIs.
- NFR-05 Authorization: protected REST endpoints shall reject missing, invalid, or insufficient-role tokens.
- NFR-06 Persistence: database-backed changes shall survive page refresh and container restart when the database volume is retained.
- NFR-07 Error handling: unavailable resources and invalid actions shall return a clear error without crashing the API.

## 8. Assumptions and Known Risks

- Demo data and accounts are loaded as documented in the root README.
- The API currently performs schema synchronization at startup.
- JWTs are stored in browser local storage in the current implementation.
- Booking overlap checking is application-level and is not transaction-safe under concurrent requests.
- Socket chat currently trusts some client-provided identity/conversation fields; it is suitable only for a controlled demo.
- Payment secrets/fallback logic in frontend code must not be treated as a production payment design.

## 9. Demo Acceptance Criteria

The demo is accepted when:

1. All containers become healthy enough to load the web app and API.
2. Public tutor browsing and tutor details load from seeded data.
3. The student account can log in, create a real booking from a tutor detail page, and see it in their schedule.
4. The admin account can see that booking and change its status.
5. The selected tutor can log in and see the booking and updated status.
6. Role protection prevents a student from opening an admin page.
7. At least one secondary feature—favorites, notifications, blog, report, or chat—is demonstrated successfully.

