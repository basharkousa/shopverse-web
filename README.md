# ShopVerse — Web (PERN)

## Tech Stack
- Backend: Node.js + Express + PostgreSQL
- Frontend: React (Vite) + Redux Toolkit + React Router + Axios
- Styling: Plain CSS (global styling system)

---

## Prerequisites
- Node.js (LTS) + npm
- PostgreSQL (pgAdmin optional)

Verify Node installation:
```bash
node -v
npm -v
```

---

## Project Structure
```
shopvers/
  backend/
  frontend/
  .github/            # CI workflows (optional)
  README.md
  .gitignore
```

---

## Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# edit .env with your DB password + DB settings
npm run db:schema
npm run dev
```

### Health Checks
- http://localhost:5000/health
- http://localhost:5000/health/db

### Backend Scripts
```bash
npm run dev        # dev server (nodemon)
npm run start      # normal start
npm run db:schema  # apply schema.sql
npm run lint       # eslint checks (if configured)
npm run format     # prettier formatting (if configured)
```

---

## Frontend Setup
```bash
cd ../frontend
npm install
cp .env.example .env
# edit .env to point to backend
npm run dev
```

### Frontend Env
In `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000
```

Open:
- http://localhost:5173

### Frontend Scripts
```bash
npm run dev
npm run build
npm run preview
npm run lint       # eslint checks (if configured)
npm run format     # prettier formatting (if configured)
```

---

## Database (Current Schema)
Tables:
- users
- categories
- products
- orders
- order_items

Relations:
- User 1..* Orders
- Category 1..* Products
- Order 1..* OrderItems
- Product 1..* OrderItems

---

## Common Issues

### CORS / frontend can’t call backend
Make sure backend `.env` includes:
```env
CLIENT_URL=http://localhost:5173
```
Then restart backend.

Frontend `.env` must be:
```env
VITE_API_URL=http://localhost:5000
```
Then restart frontend.

### Open the frontend on your phone (same Wi-Fi)
Vite binds to localhost by default (PC only). Run:
```bash
npm run dev -- --host
```
Then open the `Network:` URL that Vite prints (example: `http://192.168.x.x:5173`).

Important: On phone, `localhost` means the phone itself.
So update `frontend/.env` on your PC to:
```env
VITE_API_URL=http://YOUR_PC_IP:5000
```
Restart frontend, and ensure Windows Firewall allows Node.js on Private network.

---

## Git Branch Strategy (Recommended)
- main → stable
- dev → integration
- feature/<name> → working branches

Example:
```bash
git checkout dev
git pull
git checkout -b feature/sprint1-frontend
```
