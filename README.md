# ShopVerse — Web (PERN)

## Tech Stack
- Backend: Node.js + Express + PostgreSQL
- Frontend: React (Vite) + Redux Toolkit

## Prerequisites
- Node.js (LTS)
- PostgreSQL

## Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# edit .env with your DB password
npm run db:schema
npm run dev
```

Health Checks

http://localhost:5000/health

http://localhost:5000/health/db

## Frontend Setup (coming)