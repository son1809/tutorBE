# EduMatch API

Base URL: `http://localhost:5000/api`

Run full API smoke test:

```bash
chmod +x scripts/test-api.sh
./scripts/test-api.sh
```

Create or reset an admin account:

```bash
podman compose exec backend npm run create-admin -- admin@example.com 123456 "EduMatch Admin"
```

Protected endpoints require:

```http
Authorization: Bearer <token>
Content-Type: application/json
```

## Auth APIs

### Register user

`POST /auth/register`

```json
{
  "full_name": "Nguyen Van A",
  "email": "user@example.com",
  "password": "123456",
  "phone": "0901234567",
  "role": "student"
}
```

`role` accepts `student` or `tutor`. Public registration cannot create admin.

### Login

`POST /auth/login`

```json
{
  "email": "user@example.com",
  "password": "123456"
}
```

Response token contains user ID and role. Server also creates an auth session.

### Logout

`POST /auth/logout`

Revokes current auth session. Revoked token cannot access protected endpoints.

### Get profile

`GET /users/profile`

### Update profile

`PUT /users/profile`

```json
{
  "phone": "0987654321",
  "address": "Ho Chi Minh City",
  "children": [
    {
      "name": "Nguyen Van B",
      "grade": "Lop 6"
    }
  ]
}
```

## User Booking APIs

### Create booking request

`POST /bookings`

```json
{
  "subject": "Toan",
  "grade_level": "Lop 10",
  "schedule_days": "Toi thu 3, thu 5",
  "schedule_time": "19:00 - 21:00",
  "learning_method": "offline",
  "learning_address": "Quan 1, Ho Chi Minh City",
  "note": "On thi hoc ky"
}
```

`learning_method` accepts `offline` or `online`. Offline requests require `learning_address`.

### Get current user's requests

`GET /bookings/my-requests`

### Get current user's booking detail

`GET /bookings/:id`

Users can only view their own booking requests.

## Admin Booking APIs

All endpoints require an account with role `admin`.

### Get pending requests

`GET /admin/bookings/pending`

### Assign tutor and confirm schedule

`PUT /admin/bookings/:id/assign`

Assign an external tutor:

```json
{
  "tutor_name": "Tran Van B",
  "tutor_phone": "0912345678",
  "confirmed_schedule": "Thu 3, thu 5 - 19:00 den 21:00"
}
```

Assign an existing tutor:

```json
{
  "tutor_id": 2,
  "confirmed_schedule": "Thu 3, thu 5 - 19:00 den 21:00"
}
```

### Cancel booking

`PUT /admin/bookings/:id/cancel`

```json
{
  "reason": "Khong tim duoc gia su phu hop"
}
```

### Get booking history

`GET /admin/bookings/all`

Optional status filter:

`GET /admin/bookings/all?status=completed`

Valid statuses: `pending`, `matched`, `in_progress`, `completed`, `cancelled`.
