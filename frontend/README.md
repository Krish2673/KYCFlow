# KYCFlow Frontend

React + TypeScript + Vite frontend for the KYCFlow KYC management platform.

## Features

- **Authentication** — Password login, email OTP, automatic token refresh, server-side logout
- **Tenant Admin** — Dashboard, application CRUD, document upload, reviewer assignment, user/tenant management
- **Reviewer** — Inbox, document verification, workflow transitions, risk assessment view
- **Workflow** — Full KYC pipeline: Draft → Submitted → Document Verification → Risk Assessment → Manual Review → Approved/Rejected

## Quick Start

```bash
# From repo root — start Postgres & Redis
docker compose up -d postgres redis

# Backend (port 5000)
cd backend
npm install
npx prisma migrate deploy
npx prisma db seed   # optional demo data
npm run dev

# Frontend (port 5173) — separate terminal
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

### Demo credentials (after seed)

| Role         | Email                  | Password     |
|--------------|------------------------|--------------|
| Tenant Admin | admin@zerodha.com      | password123  |
| Reviewer     | reviewer@zerodha.com   | password123  |

## Environment

Create `frontend/.env` (optional):

```env
VITE_API_URL=
```

Leave empty in development — Vite proxies `/api`, `/me`, and `/health` to the backend.

For production, set `VITE_API_URL` to your backend URL (e.g. `https://api.example.com`).

## Scripts

| Command        | Description              |
|----------------|--------------------------|
| `npm run dev`  | Start dev server         |
| `npm run build`| Production build         |
| `npm run preview` | Preview production build |
| `npm run lint` | Run Oxlint               |

## Project Structure

```
src/
├── api/           # API client & endpoints
├── components/    # UI, layout, feature components
├── contexts/      # Auth context
├── hooks/         # Custom hooks
├── pages/         # Route pages
├── lib/           # Constants & utilities
└── types/         # TypeScript types
```
