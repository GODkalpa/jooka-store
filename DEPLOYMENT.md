# JOOKA E-commerce Platform — Production Deployment Guide

This guide covers the production deployment for the JOOKA e-commerce architecture:
1. **Medusa v2 Backend** (`backend/apps/backend`) — E-commerce engine, product catalog, orders, PostgreSQL DB, Medusa Admin Dashboard.
2. **Next.js 14 Storefront** (Root) — High-performance React Storefront, OTP registration flow, COD checkout, Nepal shipping zones.
3. **Resend** — Transactional emails & 6-digit OTP authentication.
4. **Cloudinary** — High-res media storage and responsive CDN transforms.

---

## 1. Architecture Overview

```
                      +-----------------------------+
                      |   Next.js 14 Storefront     |
                      |   (Vercel / Node.js 18+)    |
                      +--------------+--------------+
                                     |
              +----------------------+----------------------+
              |                      |                      |
              v                      v                      v
    +------------------+    +------------------+   +------------------+
    | Medusa v2 API    |    |  Resend API      |   | Cloudinary CDN   |
    | (Port 9000)      |    |  (OTP / Emails)  |   | (Product Media)  |
    +--------+---------+    +------------------+   +------------------+
             |
             v
    +------------------+
    | PostgreSQL 16+   |
    | (Supabase/Neon)  |
    +------------------+
```

---

## 2. Environment Configuration

### Frontend Storefront Environment Variables (`.env.production` / Vercel):

```env
# Medusa Backend Connection
NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://api.yourdomain.com
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_your_medusa_publishable_key

# Email & OTP Authentication (Resend)
RESEND_API_KEY=re_your_resend_api_key
FROM_EMAIL=JOOKA Store <noreply@yourdomain.com>

# Cloudinary Media Storage
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Storefront URL & Metadata
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXT_PUBLIC_STORE_NAME="JOOKA Store Nepal"
NEXT_PUBLIC_DEFAULT_CURRENCY=NPR
```

### Medusa Backend Environment Variables (`backend/apps/backend/.env`):

```env
# Server
PORT=9000
NODE_ENV=production
MEDUSA_BACKEND_URL=https://api.yourdomain.com

# PostgreSQL Database (Supabase, Neon, Railway, or RDS)
DATABASE_URL=postgresql://postgres:password@db-host:5432/medusa_prod?sslmode=require

# CORS Configuration (Must include your storefront domain)
STORE_CORS=https://yourdomain.com,http://localhost:3000
ADMIN_CORS=https://api.yourdomain.com,https://yourdomain.com,http://localhost:3000,http://localhost:9000
AUTH_CORS=https://yourdomain.com,http://localhost:3000,https://api.yourdomain.com

# Secrets
JWT_SECRET=super_strong_jwt_secret_min_32_chars_long
COOKIE_SECRET=super_strong_cookie_secret_min_32_chars_long
```

---

## 3. Database Setup & Seeding

1. In `backend/apps/backend`:
   ```bash
   cd backend/apps/backend
   npm install
   ```

2. Run database migrations:
   ```bash
   npx medusa db:migrate
   ```

3. Seed initial products, Nepal sales channels, and shipping options:
   ```bash
   npx ts-node src/scripts/seed-jooka.ts
   ```

4. Create the initial Medusa Admin user:
   ```bash
   npx medusa user --email admin@jookawear.com --password your_secure_password
   ```

---

## 4. Deploying Medusa Backend

Deploy Medusa v2 to Railway, Render, Fly.io, or AWS ECS:
- **Build Command:** `npm run build`
- **Start Command:** `npm start` (starts Medusa HTTP server on port 9000)
- **Health Check Endpoint:** `GET /health`

---

## 5. Deploying Next.js Storefront

Deploy the storefront to Vercel, Netlify, or Node.js Docker:
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Install Command:** `npm install`

---

## 6. Pre-Launch Verification Checklist

- [x] Backend TypeScript compilation (`npx tsc --noEmit` in `backend/apps/backend` -> exit code 0)
- [x] Frontend TypeScript compilation (`npx tsc --noEmit` -> exit code 0)
- [x] Cash on Delivery checkout with Nepal zones (`inside_valley`, `outside_valley`)
- [x] Server-side order price tampering prevention (`OrderService`)
- [x] OTP authentication with rate limiting & Resend email delivery
- [x] Medusa SSO bridge for Admin Dashboard access