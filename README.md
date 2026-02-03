# College Companion

A feature-rich, role-based college management portal with dashboards for students, faculty/staff, and administrators. It includes secure MFA authentication, attendance tracking, placement support, AI-assisted tools, document vault, fee payments, and real-time notifications.

## Features

- Role-based access control for Admin, Faculty/Staff, and Students.
- MFA with email OTP (Redis-backed TTL).
- Security headers (Helmet), rate limiting, input validation, and audit logging.
- Attendance tracker with predictive risk flags.
- Placement tracker with resume compatibility scoring (OpenAI).
- FAQ chatbot and sentiment analysis for feedback.
- CBCS elective selection with timetable clash detection.
- Document vault via S3 with admin verification.
- Fee payments using Razorpay (sandbox) plus PDF receipts.
- Real-time notifications via Socket.io.

## Tech Stack

- Frontend: React + Vite, TypeScript, Tailwind CSS, Framer Motion
- Backend: Node.js + Express
- Database: PostgreSQL
- Cache/OTP: Redis
- Files: AWS S3
- Payments: Razorpay (test mode)
- AI: OpenAI Responses API

## Project Structure (Feature-based)

```
client/
  src/
    features/
    shared/
server/
  src/
    features/
    shared/
    config/
    db/
```

## Local Development (Docker)

1. Set environment variables:
   - `server/.env` for backend (Postgres, Redis, SMTP, S3, Razorpay, OpenAI).
   - `client/.env` for frontend (`VITE_API_URL`).

2. Start the stack:
   ```bash
   docker compose up --build
   ```

3. Apply migrations:
   ```bash
   docker compose exec server npm run migrate
   ```

## Local Development (Without Docker)

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

## Environment Variables (Backend)

Required:
- `PORT`
- `JWT_SECRET`
- `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`, `DB_NAME`
- `REDIS_URL`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`
- `AWS_REGION`, `AWS_S3_BUCKET`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`
- `OPENAI_API_KEY`, `OPENAI_MODEL`

Optional:
- `CLIENT_ORIGIN`

## Demo Data (for screenshots)

Seed file:
```
server/src/seeds/demo_data.sql
```

Import the base schema and demo seed:
```bash
# Import base schema (db dump)
docker compose exec db psql -U postgres -d college_companion -f /tmp/college_database

# Copy and import demo seed data
docker cp server/src/seeds/demo_data.sql <DB_CONTAINER_ID>:/tmp/demo_data.sql
docker compose exec db psql -U postgres -d college_companion -f /tmp/demo_data.sql
```

If you are using Git Bash on Windows, prefix commands with:
```
MSYS_NO_PATHCONV=1
```

## Dummy Accounts

Password for demo users: `Password@123`
- `admin@college.local`
- `faculty@college.local`
- `student1@college.local`
- `student2@college.local`

## Screenshots

Add screenshots here:
- `docs/screenshots/` (optional)

## Troubleshooting

- `EAI_AGAIN db`: Ensure Docker DNS is ready and `DB_HOST=db`.
- `jwt malformed`: Clear localStorage and log in again.
- S3 CORS errors: Add bucket CORS allowing `http://localhost:5173`.

## License

MIT
