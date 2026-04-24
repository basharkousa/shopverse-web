# ShopVerse Deployment Guide

This project is deployed with:
- **Backend:** Render Web Service
- **Database:** Render PostgreSQL
- **Frontend:** Netlify

---

## 1. Render PostgreSQL Setup

1. Create a new PostgreSQL instance on Render.
2. Copy the **External Database URL** or **Internal Database URL**.
3. Save it for the backend environment variables as `DATABASE_URL`.

> For most Render setups, you should also set:
- `DB_SSL=true`

---

## 2. Render Backend Setup

1. Push the project to GitHub.
2. In Render, create a new **Web Service**.
3. Connect your GitHub repository.
4. Configure:
    - **Root Directory:** `backend`
    - **Build Command:** `npm install`
    - **Start Command:** `npm start`

### Backend Environment Variables

Add these in Render:

```env
NODE_ENV=production
PORT=10000
DATABASE_URL=your_render_postgres_url
DB_SSL=true
JWT_SECRET=your_long_random_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=https://your-netlify-site.netlify.app
FRONTEND_URL=https://your-netlify-site.netlify.app
CORS_ORIGINS=https://your-netlify-site.netlify.app