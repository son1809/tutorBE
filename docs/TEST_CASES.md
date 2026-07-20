# EduMatch Demo Test Cases

## 1. Test Setup

Start the application:

```bash
podman compose up -d --build
```

URLs:

- Web: `http://localhost:5173`
- API health check: `http://localhost:5000`
- Admin login: `http://localhost:5173/admin/login`

Seeded credentials from the demo data:

| Role | Email | Password |
|---|---|---|
| Admin | `admin@edumatch.local` | `Demo@123` |
| Student | `student@edumatch.local` | `Demo@123` |
| Tutor | `minhanh.tutor@edumatch.local` | `Demo@123` |

Use a future start date for booking tests. If the database already contains bookings, choose a different tutor/day/time slot or reset the demo database.

## 2. Five-Minute Smoke Demo

| ID | Actor | Action | Expected result |
|---|---|---|---|
| SM-01 | Visitor | Open `/tutors`, select a tutor, and open their detail page | Tutor cards and selected tutor details load |
| SM-02 | Student | Log in with the seeded student account | Login succeeds and student navigation is shown |
| SM-03 | Student | From a tutor detail page, enter valid booking data and submit | Success is shown; a new booking is stored with `pending` status |
| SM-04 | Student | Open `/schedule` | The new booking appears with tutor, date, study days/time, price, and pending status |
| SM-05 | Admin | Log out, open `/admin/login`, and log in as admin | Admin dashboard loads |
| SM-06 | Admin | Open Bookings, find the new booking, and change it to `matched` | Status update succeeds and persists after refresh |
| SM-07 | Tutor | Log in as the booked tutor and open `/tutor/bookings` | The booking appears with student and schedule details and matched status |
| SM-08 | Student | Log back in and open the schedule | Updated matched status is visible |

## 3. Functional Test Cases

### Authentication and access control

| ID | Scenario / steps | Expected result | Priority |
|---|---|---|---|
| AUTH-01 | Register a student with a new valid email and password of at least 6 characters | HTTP/UI success; user and token are returned; role is student | High |
| AUTH-02 | Register using an email that already exists | Registration is rejected with “Email đã được sử dụng.” | High |
| AUTH-03 | Log in with `student@edumatch.local / Demo@123` | Login succeeds; student data is loaded | Critical |
| AUTH-04 | Log in with a correct email and wrong password | Login is rejected with a generic invalid-credentials message | High |
| AUTH-05 | Open `/admin/dashboard` while signed out or signed in as student | User is redirected/rejected and cannot use admin functions | Critical |
| AUTH-06 | Open `/tutor/dashboard` as a student | User is redirected/rejected and cannot use tutor functions | Critical |
| AUTH-07 | Update name, phone, school, and grade in the profile, then refresh | Updated values persist | Medium |

### Tutor discovery and profiles

| ID | Scenario / steps | Expected result | Priority |
|---|---|---|---|
| TUT-01 | Open `/tutors` as a visitor | Seeded tutors load without login | Critical |
| TUT-02 | Open `/subject/toan` | Tutors for the subject page are displayed | High |
| TUT-03 | Open a tutor detail page from a card | Identity, subject, description, fees, location, and other available fields display | Critical |
| TUT-04 | Open `/tutors/999999` | A not-found/error state is shown; application does not crash | Medium |
| TUT-05 | As tutor, update title, subject, fee range, location, and description | Save succeeds and changes persist | High |
| TUT-06 | As tutor, upload a valid certificate image | Certificate is stored and appears in the tutor certificate list | Medium |
| TUT-07 | As admin, change the tutor verification state | State changes and persists after refresh | High |

### Booking and schedules

| ID | Scenario / steps | Expected result | Priority |
|---|---|---|---|
| BKG-01 | As student, submit all required booking fields for an existing tutor with an unused schedule | Booking is created in `pending` state | Critical |
| BKG-02 | Repeat BKG-01 with the same tutor, overlapping date range, common study day, and same time slot | Booking is rejected with a schedule-conflict message | Critical |
| BKG-03 | Book the same tutor/date range and time slot but with no common study day | Booking is accepted | High |
| BKG-04 | Book the same tutor/date range and study day but a different time slot | Booking is accepted | High |
| BKG-05 | Open the student schedule after a successful booking | Booking details match the submitted data | Critical |
| BKG-06 | Cancel the signed-in student’s pending booking | Status becomes `cancelled` and persists | High |
| BKG-07 | As admin, change a pending booking to `matched` | Status is updated in admin, student, and tutor views | Critical |
| BKG-08 | As tutor, search/filter the booking list by student, subject, and status | Only matching rows appear; detail modal shows full booking data | Medium |
| BKG-09 | Submit a booking with an invalid/nonexistent tutor ID through the API | Request returns 404 and no booking is created | High |

### Secondary features

| ID | Scenario / steps | Expected result | Priority |
|---|---|---|---|
| SEC-01 | As student, favorite a tutor, open `/favorites`, then unfavorite | Tutor is added, listed, then removed | Medium |
| SEC-02 | Create a review through a backend-connected review form and reopen tutor reviews | Review appears and tutor review data updates as implemented | Medium |
| SEC-03 | Submit a tutor/content report while authenticated; open Admin Reports | Report is stored and visible to admin | Medium |
| SEC-04 | Trigger/open notifications; mark one read, then mark all read | Read states and unread count update | Medium |
| SEC-05 | Open published blog list and a blog detail page | Published content loads for visitors | Low |
| SEC-06 | As authenticated user, create a blog post and open “my posts” flow | Post is stored and can be updated/deleted by its author | Low |
| SEC-07 | Open support chat as student and admin; exchange one message each | Messages appear in real time and remain after reopening conversation | Medium |
| SEC-08 | As admin, create/update/delete a subject | Subject list reflects each operation | Medium |

## 4. Negative and Reliability Checks

| ID | Scenario / steps | Expected result |
|---|---|---|
| NEG-01 | Call a protected API without a token | API returns 401 |
| NEG-02 | Call an admin API using a student token | API returns 403 |
| NEG-03 | Call an unknown API route | API returns 404 with “Route không tồn tại.” |
| NEG-04 | Stop or disconnect SMTP, then create a valid booking | Booking still succeeds; email failure is logged only |
| NEG-05 | Refresh the browser after a saved profile/status change | Database-backed change remains visible |
| NEG-06 | Enter a direct protected URL after clearing local storage tokens | Protected content is not displayed |

## 5. Known Demo-Only Cases (Do Not Present as Persisted Features)

| ID | Current behavior | Demo guidance |
|---|---|---|
| GAP-01 | Student Dashboard → “Tìm gia sư mới” waits briefly and shows success but does not call an API or save a request | Do not use this as proof of request persistence; use real booking from Tutor Detail instead |
| GAP-02 | Student Dashboard → “Đánh giá gia sư” is static | Use a backend-connected review flow or demonstrate review listing only |
| GAP-03 | Frontend payment code calls backend routes that are not mounted and falls back to client-side VNPay demo logic | Avoid live payment in the quick demo |
| GAP-04 | Frontend API service contains badge endpoints not mounted by the backend | Do not include badges in acceptance scope |
| GAP-05 | Google login needs external OAuth configuration | Use email/password unless OAuth has been configured and tested |

## 6. Demo Result Record

Copy this table for the presentation run:

| Test ID | Result (Pass/Fail/Blocked) | Evidence / note | Tester | Date |
|---|---|---|---|---|
| SM-01 |  |  |  |  |
| SM-02 |  |  |  |  |
| SM-03 |  |  |  |  |
| SM-04 |  |  |  |  |
| SM-05 |  |  |  |  |
| SM-06 |  |  |  |  |
| SM-07 |  |  |  |  |
| SM-08 |  |  |  |  |
