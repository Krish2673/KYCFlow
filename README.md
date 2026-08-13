# KYCFlow

Multi-tenant KYC (Know Your Customer) management platform with application lifecycle tracking, document verification, and risk assessment.

## Project Structure

```
KYCFlow/
├── backend/     Express + Prisma + PostgreSQL API
└── frontend/    React + Vite + Tailwind CSS web app
```

## Prerequisites

- Node.js 18+
- PostgreSQL database
- Supabase project (for document storage)

## Backend Setup

```bash
cd backend
npm install
```

Create `backend/.env` (copy from `.env.example`):

```env
DATABASE_URL=postgresql://user:password@localhost:5432/kycflow
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
REDIS_URL=redis://localhost:6379
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
RESEND_API_KEY=re_your_key
FRONTEND_URL=http://localhost:5173
```

For local development with Docker:

```bash
docker compose up -d postgres redis
# Then set DATABASE_URL=postgresql://postgres:postgres@localhost:5432/kycflow
# And REDIS_URL=redis://localhost:6379
```

Run migrations and start the API:

```bash
npx prisma migrate deploy
npm run dev
```

API runs at **http://localhost:5000**

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at **http://localhost:5173** and proxies API requests to the backend.

## Features

### Tenant Admin
- Dashboard with application metrics
- Create and manage KYC applications
- Upload identity documents (PAN, Aadhaar, Passport, etc.)
- Submit applications for review
- Assign reviewers
- Manage users and tenants

### Reviewer
- Personal inbox of assigned applications
- View and verify uploaded documents
- Advance applications through the workflow
- View risk assessment scores and recommendations

### Application Workflow

```
Draft → Submitted → Document Verification → Risk Assessment → Manual Review → Approved / Rejected
```

## Tech Stack

| Layer    | Technologies                                      |
|----------|---------------------------------------------------|
| Backend  | Express 5, TypeScript, Prisma, PostgreSQL, JWT    |
| Frontend | React 19, Vite, Tailwind CSS, TanStack Query      |
| Storage  | Supabase Storage                                  |

## Initial Setup (First Run)

Since user creation is via API, bootstrap your first tenant admin:

1. Start the backend
2. Create a tenant via API or directly in the database
3. Create a user with `POST /api/v1/users` (role: `TENANT_ADMIN`, with the tenant ID)
4. Log in at http://localhost:5173/login

## Scripts

| Command              | Location  | Description          |
|----------------------|-----------|----------------------|
| `npm run dev`        | backend   | Start API server     |
| `npm run dev`        | frontend  | Start dev server     |
| `npm run build`      | frontend  | Production build     |
| `npx prisma studio`  | backend   | Database GUI         |
