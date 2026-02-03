# College Companion

A full‑stack college management platform with role‑based dashboards, MFA, attendance intelligence, document vault, payments, realtime notifications, and AI‑assisted tools.

## Highlights

- Role‑based access for Admin, Faculty/Staff, and Students
- MFA via Email OTP (Redis TTL)
- Helmet security headers, rate limiting, validation, audit logging
- Attendance tracker with predictive risk flags
- Placement tracker with resume compatibility scoring
- FAQ chatbot and sentiment analysis
- CBCS elective selection with clash detection
- Document vault on S3 with admin verification
- Razorpay sandbox payments with PDF receipts
- Real‑time notifications via Socket.io

## Tech Stack

- Frontend: React + Vite, TypeScript, Tailwind CSS, Framer Motion
- Backend: Node.js + Express
- Database: PostgreSQL
- Cache: Redis
- Storage: AWS S3
- Payments: Razorpay (test mode)
- AI: Ollama (local) or OpenAI (optional)

## Architecture

Feature‑based structure across client and server.

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

## Quick Start (Docker)

1. Configure environment variables.
- `server/.env`
- `client/.env`

2. Start the stack.
```bash
docker compose up --build
```

3. Run migrations.
```bash
docker compose exec server npm run migrate
```

## Local Development (Non‑Docker)

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

## Environment Variables

Server required:
- `PORT`
- `JWT_SECRET`
- `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`, `DB_NAME`
- `REDIS_URL`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`
- `AWS_REGION`, `AWS_S3_BUCKET`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`
- `OLLAMA_URL`, `OLLAMA_MODEL` or `OPENAI_API_KEY`, `OPENAI_MODEL`

Server optional:
- `CLIENT_ORIGIN`

Client:
- `VITE_API_URL`

## Demo Data

Seed file:
```
server/src/seeds/demo_data.sql
```

Import demo data:
```bash
docker compose ps -q db
docker cp server/src/seeds/demo_data.sql <DB_CONTAINER_ID>:/tmp/demo_data.sql
docker compose exec db psql -U postgres -d college_companion -f /tmp/demo_data.sql
```

Git Bash tip:
```
MSYS_NO_PATHCONV=1
```

## Demo Accounts

Password: `Password@123`
- `admin@college.local`
- `faculty@college.local`
- `student1@college.local`
- `student2@college.local`

## Screenshots

Create a folder: `docs/screenshots/`

Recommended screenshots:
- `docs/screenshots/login.png`
- `docs/screenshots/dashboard-admin.png`
- `docs/screenshots/dashboard-student.png`
- `docs/screenshots/attendance.png`
- `docs/screenshots/internship.png`
- `docs/screenshots/documents.png`
- `docs/screenshots/payments.png`

Embed in README:
```
![Login](docs/screenshots/login.png)
```

## Troubleshooting

- `EAI_AGAIN` or `ENOTFOUND db`: ensure `DB_HOST=db` and rebuild the compose network.
- CORS errors: add your frontend origin to `CLIENT_ORIGIN`.
- Ollama model not found: run `ollama pull <model>`.

## License

MIT
