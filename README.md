# FULLWEB Client Portal

A premium full-stack client portal built with Next.js 14, TypeScript, Tailwind CSS, Prisma, and NextAuth.js.

## Features

- **Premium dark UI** — Glassmorphism, Framer Motion animations, black/white design
- **Admin portal** — Manage clients, projects, invoices, tutorials
- **Client portal** — Project overview, invoices, timeline, deliverables, tutorials
- **Auth** — NextAuth.js with credentials (email/password) and role-based access
- **Database** — PostgreSQL via Prisma ORM

## Tech Stack

- Next.js 14 (App Router)
- TypeScript (strict)
- Tailwind CSS
- shadcn/ui components
- Framer Motion
- Prisma ORM
- NextAuth.js v4
- bcryptjs

## Quick Start

### 1. Clone & Install

```bash
git clone <repo>
cd fullweb-client-portal
npm install
```

### 2. Environment Variables

```bash
cp .env.example .env
```

Update `.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require"
NEXTAUTH_SECRET="your-strong-secret"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Database Setup

```bash
npx prisma migrate dev --name init
npm run db:seed
```

### 4. Run Development Server

```bash
npm run dev
```

## Seeded Credentials

| Role   | Email              | Password       |
|--------|--------------------|----------------|
| Admin  | admin@fullweb.com  | ChangeMe123!   |
| Client | client@example.com | ClientPass123! |

## Deploy to Vercel

1. Push to GitHub
2. Import on [vercel.com](https://vercel.com)
3. Add env vars: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
4. Deploy & seed production DB
