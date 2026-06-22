# TutorConnect API

REST API used by EduMatch frontend. Built with Express, Sequelize, MySQL/MariaDB, and JWT authentication.

## How API Works

Request flow:

```text
React page
  -> src/shared/api/api.service.js sends HTTP request
  -> server.js selects route
  -> middleware checks input, token, and role
  -> controller runs business logic
  -> Sequelize model reads/writes MySQL
  -> controller returns JSON response
```

Main folders:

- `features/`: feature-owned routes, controllers, and models
- `features/auth/`: login, register, logout, auth sessions
- `features/users/`: user profile endpoints and model
- `features/tutors/`: tutor listing, detail, profile endpoints, model
- `features/bookings/`: student/admin booking endpoints and model
- `features/reviews/`: review endpoints and model
- `shared/middleware/`: authentication, authorization, validation
- `models/`: association barrel for Sequelize relationships
- `config/`: database connection and migrations

## Run

From project root, easiest option with Podman:

```bash
podman compose up --build
```

If `podman compose` is unavailable, install `podman-compose`, then run:

```bash
podman-compose up --build
```

`compose.yaml` works with Podman Compose. No Docker-specific changes required.

Stop services:

```bash
podman compose down
```

Services:

- Frontend: `http://localhost:5173`
- API: `http://localhost:5000`
- phpMyAdmin: `http://localhost:8080`

Without Docker:

```bash
cd tutorBE
cp .env.example .env
npm install
npm run dev
```

Create MySQL database named `tutorconnect` first. Update `.env` with local database credentials.

## Authentication

Register or login returns JWT:

```json
{
  "message": "Đăng nhập thành công!",
  "token": "eyJ...",
  "user": {}
}
```

Protected endpoints require header:

```http
Authorization: Bearer eyJ...
```

Frontend handles this automatically in `EduMatchFrontend/src/shared/api/api.service.js`.

## Endpoints

Base URL: `http://localhost:5000/api`

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/auth/register` | Public | Create student or tutor account |
| POST | `/auth/login` | Public | Login and receive token |
| POST | `/auth/logout` | User | Revoke current token |
| GET | `/users/profile` | User | Read current profile |
| PUT | `/users/profile` | User | Update current profile |
| POST | `/users/avatar` | User | Upload profile/tutor avatar |
| GET | `/tutors` | Public | List/filter tutors |
| GET | `/tutors/:id` | Public | Read tutor details |
| POST | `/tutors` | Tutor/admin | Create tutor profile |
| PUT | `/tutors/:id` | Owner/admin | Update tutor profile |
| POST | `/bookings` | Student | Create booking request |
| GET | `/bookings/my-requests` | User | List own bookings |
| GET | `/bookings/:id` | User | Read own booking |
| PUT | `/bookings/:id/cancel` | User | Cancel own booking |
| POST | `/reviews` | Student | Review completed booking |
| GET | `/reviews/tutor/:tutorId` | Public | List tutor reviews |
| GET | `/admin/bookings/pending` | Admin | List pending bookings |
| GET | `/admin/bookings/all` | Admin | List/filter all bookings |
| PUT | `/admin/bookings/:id/assign` | Admin | Assign tutor |
| PUT | `/admin/bookings/:id/cancel` | Admin | Cancel booking |
| PUT | `/admin/bookings/:id/status` | Admin | Update booking status |

Tutor filters: `subject`, `grade_level`, `search`, `page`, `limit`.

Admin booking filter: `status`.

## Try API With curl

Health check:

```bash
curl http://localhost:5000/
```

Register student:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{
    "full_name": "Test Student",
    "email": "student@example.com",
    "password": "secret123",
    "role": "student"
  }'
```

Login:

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"student@example.com","password":"secret123"}'
```

Use returned token:

```bash
curl http://localhost:5000/api/users/profile \
  -H 'Authorization: Bearer YOUR_TOKEN'
```

Create booking:

```bash
curl -X POST http://localhost:5000/api/bookings \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -d '{
    "subject": "Math",
    "grade_level": "10",
    "schedule_days": "Monday and Wednesday",
    "schedule_time": "18:00",
    "learning_method": "online"
  }'
```

## Add New Endpoint

Example: `GET /api/example`.

1. Add controller function:

```js
// features/example/example.controller.js
exports.getExample = async (req, res) => {
  return res.json({ message: 'Example works' });
};
```

2. Add route:

```js
// features/example/example.routes.js
const express = require('express');
const controller = require('./example.controller');

const router = express.Router();
router.get('/', controller.getExample);

module.exports = router;
```

3. Mount route in `server.js`:

```js
app.use('/api/example', require('./features/example/example.routes'));
```

4. Add frontend function in `EduMatchFrontend/src/shared/api/api.service.js`:

```js
export const exampleAPI = {
  get: () => request('/example'),
};
```

## Status Codes

- `200`: request succeeded
- `201`: resource created
- `400`: invalid input
- `401`: missing/invalid login token
- `403`: logged in but role/action forbidden
- `404`: resource or route missing
- `409`: action conflicts with current state
- `500`: server/database error
