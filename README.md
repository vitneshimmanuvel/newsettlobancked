# Settlo Backend

Backend API for Settlo website lead forms.

## Setup

```bash
npm install
npx prisma generate
npx prisma db push
npm run dev
```

## Environment Variables (Set in Vercel)

- `DATABASE_URL` - Neon PostgreSQL connection string
- `EMAIL_USER` - Gmail address
- `EMAIL_PASS` - Gmail App Password
- `EMAIL_TO` - Recipient email

## API Endpoints

- `GET /api/health` - Health check
- `POST /api/leads` - Submit lead
- `GET /api/leads` - List all leads
