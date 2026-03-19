# LMS Setup Guide

## Project Structure

```
LMS_Kodnest/
├── lms_schema.sql          ← Run this in MySQL first
├── lms-backend/            ← Node.js + Express API
└── lms-frontend/           ← Next.js 14 App
```

---

## Step 1 — Run the Database Schema

Connect to your Aiven MySQL and run:

```bash
mysql -h mysql-29c3ab9d-gitika-9691.b.aivencloud.com \
      -P 23306 -u avnadmin -p --ssl-mode=REQUIRED defaultdb < lms_schema.sql
```

Or paste `lms_schema.sql` directly into your Aiven query editor.

---

## Step 2 — Backend Setup

```bash
cd lms-backend
npm install
cp .env.example .env
# Edit .env — set DB_PASSWORD and JWT secrets
npm run dev
```

Backend runs at: http://localhost:4000

Test DB connection:
```bash
npm run db:test
```

Test health endpoint:
```bash
curl http://localhost:4000/api/health
```

### Environment Variables (lms-backend/.env)

| Variable | Description |
|---|---|
| DB_HOST | Aiven MySQL host |
| DB_PORT | 23306 |
| DB_NAME | defaultdb |
| DB_USER | avnadmin |
| DB_PASSWORD | Your Aiven password |
| DB_SSL_CA | Path to Aiven CA cert (optional) |
| JWT_ACCESS_SECRET | Random 32+ char string |
| JWT_REFRESH_SECRET | Random 32+ char string |
| PORT | 4000 |
| FRONTEND_URL | http://localhost:3000 |

---

## Step 3 — Frontend Setup

```bash
cd lms-frontend
npm install
cp .env.local.example .env.local
# .env.local already points to localhost:4000
npm run dev
```

Frontend runs at: http://localhost:3000

---

## Step 4 — Deploy

### Backend → Render

1. Push `lms-backend/` to a GitHub repo
2. Create a new Web Service on render.com
3. Set build command: `npm install && npm run build`
4. Set start command: `npm start`
5. Add all env vars from `.env.example` in Render dashboard

### Frontend → Vercel

1. Push `lms-frontend/` to a GitHub repo
2. Import project on vercel.com
3. Set `NEXT_PUBLIC_API_URL` to your Render backend URL:
   `https://your-lms-backend.onrender.com/api`
4. Deploy

---

## Data Flow

```
User clicks video
  → Frontend: GET /api/videos/:id  (with Bearer token)
  → Backend: verifies JWT → checks enrollment → checks prev video completed
  → Returns: video data + is_locked + prev/next IDs + progress
  → Frontend: renders YouTube iframe with start= timestamp

User clicks "Mark Complete"
  → Frontend: POST /api/progress/videos/:id  { is_completed: true }
  → Backend: upserts video_progress → returns updated progress
  → Frontend: updates store → shows "Next" button

Auto-refresh token
  → On 401 response → POST /api/auth/refresh (cookie sent automatically)
  → Backend: validates refresh token hash in DB → rotates token
  → Frontend: retries original request with new access token
```

---

## JS Auth Module — API Reference

### Required npm packages (already in package.json)
```
bcryptjs
jsonwebtoken
```

### Environment variable to add to `.env`
```
JWT_SECRET=supersecretkey123
```

---

### POST /api/auth/register

```
POST http://localhost:4000/api/auth/register
Content-Type: application/json

{
  "name": "Alice Johnson",
  "email": "alice@example.com",
  "password": "password123"
}
```

Success response `201`:
```json
{
  "success": true,
  "message": "Account created successfully.",
  "user": { "id": 1, "name": "Alice Johnson", "email": "alice@example.com" }
}
```

Error response `409` (duplicate email):
```json
{ "success": false, "message": "Email is already registered." }
```

---

### POST /api/auth/login

```
POST http://localhost:4000/api/auth/login
Content-Type: application/json

{
  "email": "alice@example.com",
  "password": "password123"
}
```

Success response `200`:
```json
{
  "success": true,
  "message": "Login successful.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { "id": 1, "name": "Alice Johnson", "email": "alice@example.com" }
}
```

Error response `401`:
```json
{ "success": false, "message": "Invalid email or password." }
```

---

### GET /api/auth/me  (protected)

```
GET http://localhost:4000/api/auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Success response `200`:
```json
{
  "success": true,
  "user": {
    "id": 1,
    "name": "Alice Johnson",
    "email": "alice@example.com",
    "created_at": "2026-03-17T10:00:00.000Z"
  }
}
```

Error response `401` (missing/expired token):
```json
{ "success": false, "message": "Access denied. No token provided." }
```
