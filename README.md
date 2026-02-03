# College Companion

<p align="center">
  <img src="docs/screenshots/logo.png" width="120" alt="College Companion Logo" />
</p>

<p align="center">
  A full-stack college management platform with MFA, attendance intelligence, a secure document vault,
  payments, realtime notifications, and AI-assisted tools.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB" alt="Frontend" />
  <img src="https://img.shields.io/badge/Backend-Node%20%2B%20Express-3C873A" alt="Backend" />
  <img src="https://img.shields.io/badge/Database-PostgreSQL-336791" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Cache-Redis-DC382D" alt="Redis" />
  <img src="https://img.shields.io/badge/AI-Ollama-111111" alt="Ollama" />
  <img src="https://img.shields.io/badge/License-MIT-yellow" alt="License" />
</p>

---

## Overview

College Companion helps admins, faculty/staff, and students manage academics, operations, and career readiness in one place. It combines secure authentication, role-based dashboards, audit logging, payments, document verification, attendance analytics, and AI features like resume compatibility scoring.

---

## Key Features

### Security & Reliability
- Email OTP MFA with Redis TTL
- Helmet security headers
- Rate-limited auth endpoints
- Input validation and sanitization
- System-wide audit logging

### Academic Operations
- Timetable management
- Attendance tracker + predictive risk flagging
- CBCS elective selection with clash detection
- Reminders and announcements

### Placement & Career
- Internship tracker with status updates
- Resume compatibility scoring (PDF + JD)

### Documents & Payments
- Secure document vault (S3) with admin verification
- Razorpay sandbox fee payments
- PDF receipt generation

### Realtime & AI
- Socket.io realtime notifications
- Ollama-based AI scoring and insights

---

## Screenshots

Create a folder and drop your images here:
```
docs/screenshots/
```

Suggested filenames:
```
docs/screenshots/login.png
docs/screenshots/dashboard-admin.png
docs/screenshots/dashboard-student.png
docs/screenshots/attendance.png
docs/screenshots/internship.png
docs/screenshots/documents.png
docs/screenshots/payments.png
docs/screenshots/ai-resume-score.png
```

Embed in README:
```md
![Login](docs/screenshots/login.png)
```

---

## Tech Stack

**Frontend**
- React + Vite, TypeScript, Tailwind CSS, Framer Motion

**Backend**
- Node.js + Express

**Data & Infra**
- PostgreSQL, Redis

**Integrations**
- AWS S3, Razorpay (test mode), Socket.io

**AI**
- Ollama (local) or OpenAI (optional)

---

## Project Structure

Feature-based layout across client and server:
```
client/
  src/
    features/
      auth/
        pages/
        components/
      home/
        pages/
      dashboard/
        pages/
        components/
      timetable/
        pages/
      attendance/
        pages/
      reminders/
        pages/
      internship/
        pages/
        components/
      profile/
        pages/
    shared/
      api.ts
      components/
        Navbar.tsx
  public/
server/
  src/
    features/
      auth/
        controller.js
        routes.js
        validations.js
      attendance/
        routes.js
        service.js
      timetable/
        routes.js
      internships/
        routes.js
      reminders/
        routes.js
      documents/
        routes.js
      payments/
        routes.js
      ai/
        routes.js
      audit/
        routes.js
    shared/
      middleware/
      services/
    config/
      env.js
    db/
      index.js
    seeds/
      demo_data.sql
      full_demo_data.sql
  apply-migration.js
docker-compose.yml
```

---

## Features by Role

**Admin**
- User management and role control
- Department and division management
- Audit log visibility for critical actions
- Document verification and approval
- System-wide reminders and announcements

**Faculty/Staff**
- Timetable management
- Attendance marking and analytics
- Department/division reminders
- Internship/application status reviews

**Student**
- Personal timetable view
- Attendance overview + risk flags
- Internship tracker and resume scoring
- Document upload + verification status
- Fee payments + receipts

---

## API Endpoints (High Level)

**Auth**
- `POST /api/auth/login` - request login OTP
- `POST /api/auth/verify-otp` - verify OTP, return JWT
- `POST /api/auth/request-registration` - request registration OTP
- `POST /api/auth/verify-registration` - verify registration OTP
- `POST /api/auth/resend-otp` - resend login OTP

**Profile**
- `GET /api/profile` - fetch profile
- `PUT /api/profile` - update profile

**Attendance**
- `GET /api/attendance/departments`
- `GET /api/attendance/sessions`
- `GET /api/attendance/session-roster/:sessionId`
- `POST /api/attendance/mark`
- `GET /api/attendance/my-summary`
- `GET /api/attendance/predict-risk`

**Timetable**
- `GET /api/timetable`
- `POST /api/timetable`
- `PUT /api/timetable/:id`
- `DELETE /api/timetable/:id`

**Internships**
- `GET /api/internships`
- `POST /api/internships`
- `PUT /api/internships/:id`

**Documents**
- `POST /api/documents/presign`
- `GET /api/documents/my`

**Payments**
- `POST /api/payments/create-order`
- `POST /api/payments/verify`

**AI**
- `POST /api/ai/resume-score`
- `POST /api/ai/resume-score-pdf`

---

## Architecture

```
┌───────────────────────────────┐
│           Client              │
│  React + Vite + Tailwind CSS  │
└───────────────┬───────────────┘
                │  REST + Socket.io
┌───────────────▼───────────────┐
│          Node API             │
│   Express + Feature Modules   │
├───────────────┬───────────────┤
│  PostgreSQL   │     Redis     │
│   (Data)      │    (OTP)      │
└───────────────┴───────────────┘
                │
      ┌─────────▼─────────┐
      │    AWS S3         │
      │  Document Vault   │
      └───────────────────┘

AI (Local)
┌───────────────────────────────┐
│            Ollama             │
│  Resume Compatibility Scoring │
└───────────────────────────────┘
```

---

## Quick Start (Docker)

1. Configure environment variables.
- `server/.env`
- `client/.env`

2. Build and run.
```bash
docker compose up --build
```

3. Run migrations.
```bash
docker compose exec server npm run migrate
```

4. Load demo data (recommended for screenshots).
```bash
docker compose ps -q db
docker cp server/src/seeds/full_demo_data.sql <DB_CONTAINER_ID>:/tmp/full_demo_data.sql
docker compose exec db psql -U postgres -d college_companion -f /tmp/full_demo_data.sql
```

Git Bash tip:
```
MSYS_NO_PATHCONV=1
```

---

## Local Development (Non-Docker)

Backend:
```bash
cd server
npm install
npm run dev
```

Frontend:
```bash
cd client
npm install
npm run dev
```

---

## Environment Variables

**Server (required)**
- `PORT`
- `JWT_SECRET`
- `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`, `DB_NAME`
- `REDIS_URL`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`
- `AWS_REGION`, `AWS_S3_BUCKET`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`
- `OLLAMA_URL`, `OLLAMA_MODEL` or `OPENAI_API_KEY`, `OPENAI_MODEL`

**Server (optional)**
- `CLIENT_ORIGIN` (comma-separated list of allowed frontend origins)

**Client**
- `VITE_API_URL`

---

## Demo Data

Seed files:
```
server/src/seeds/demo_data.sql
server/src/seeds/full_demo_data.sql
```

Import demo data:
```bash
docker compose ps -q db
docker cp server/src/seeds/full_demo_data.sql <DB_CONTAINER_ID>:/tmp/full_demo_data.sql
docker compose exec db psql -U postgres -d college_companion -f /tmp/full_demo_data.sql
```

**Demo Accounts**  
Password: `Password@123`
- `admin@college.local`
- `faculty@college.local`
- `student1@college.local`
- `student2@college.local`

---

## Common Tasks

**Run migrations**
```bash
docker compose exec server npm run migrate
```

**Seed demo data**
```bash
docker compose ps -q db
docker cp server/src/seeds/full_demo_data.sql <DB_CONTAINER_ID>:/tmp/full_demo_data.sql
docker compose exec db psql -U postgres -d college_companion -f /tmp/full_demo_data.sql
```

---

## Troubleshooting

- `EAI_AGAIN` or `ENOTFOUND db`: ensure `DB_HOST=db` and rebuild the compose network.
- CORS errors: add your frontend origin to `CLIENT_ORIGIN`.
- Ollama model not found: run `ollama pull <model>`.

---

## License

MIT
