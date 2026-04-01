# FULLWEB Client Portal

A premium full-stack client onboarding and project management portal for the **Fullweb** agency. Built with Next.js 14, TypeScript, Tailwind CSS, Prisma, and NextAuth.js.

---

## Features

- **Premium dark UI** — Glassmorphism, Framer Motion animations, black/white luxury design
- **Admin portal** — Full CRUD for clients, projects, invoices, milestones, updates, deliverables, tutorials
- **Client portal** — Personalized dashboard with project overview, invoices, timeline, agreement, deliverables, tutorials
- **Role-based auth** — NextAuth.js v4 with JWT sessions, `ADMIN` and `CLIENT` roles
- **Database** — PostgreSQL (Neon-ready) via Prisma ORM with 12+ models
- **Vercel-ready** — Optimized for Vercel deployment

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS + shadcn/ui |
| Animation | Framer Motion |
| Icons | Lucide |
| Database | PostgreSQL (Neon Postgres) |
| ORM | Prisma 7 |
| Auth | NextAuth.js v4 + bcryptjs |
| Deployment | Vercel |

---

## Project Structure

```
├── app/
│   ├── (auth)/login/          # Animated login page
│   ├── admin/                 # Admin dashboard + CRUD pages
│   │   ├── clients/           # Client management
│   │   ├── projects/          # Project management
│   │   ├── invoices/          # Invoice management
│   │   ├── tutorials/         # Tutorial articles
│   │   └── settings/          # Agency settings
│   ├── portal/                # Client-facing portal
│   │   ├── project/           # Project details
│   │   ├── invoices/          # Client invoices
│   │   ├── agreement/         # Agreement viewer
│   │   ├── welcome/           # Welcome document
│   │   ├── timeline/          # Milestones timeline
│   │   ├── updates/           # Project updates feed
│   │   ├── deliverables/      # Final deliverables
│   │   └── tutorials/         # Help center
│   ├── api/                   # REST API routes
│   └── page.tsx               # Public landing page
├── components/
│   ├── ui/                    # shadcn-style UI primitives
│   └── shared/                # Reusable layout components
├── lib/
│   ├── auth.ts                # NextAuth config
│   ├── db.ts                  # Prisma client singleton
│   └── utils.ts               # Utility functions
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Demo data seed script
├── types/index.ts             # TypeScript types
├── middleware.ts              # Route protection
└── .env.example               # Environment variable template
```

---

## Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/danza0/fullweb-client-portal.git
cd fullweb-client-portal
npm install
```

### 2. Set Up Neon Postgres

1. Create a free account at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the **connection string** from the Neon dashboard

### 3. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Neon Postgres connection string
DATABASE_URL="postgresql://USER:PASSWORD@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require"

# Generate a strong secret: openssl rand -base64 32
NEXTAUTH_SECRET="your-strong-random-secret-here"

# Your app URL (localhost for dev, your domain for production)
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Run Database Migrations

```bash
npx prisma migrate dev --name init
```

### 5. Seed Demo Data

```bash
npm run db:seed
```

This creates:
- Admin account + sample client account
- Full project with milestones, invoices, tasks, updates, deliverables
- 5 tutorial articles and activity logs

### 6. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## Demo Credentials

> ⚠️ **IMPORTANT**: Change these credentials immediately in production!

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@fullweb.com` | `ChangeMe123!` |
| **Client** | `client@example.com` | `ClientPass123!` |

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string (Neon format) |
| `NEXTAUTH_SECRET` | ✅ | Random string for JWT signing (min 32 chars) |
| `NEXTAUTH_URL` | ✅ | Full URL of your app (e.g. `https://yourapp.vercel.app`) |

---

## Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → Import your repo
3. Add environment variables:
   - `DATABASE_URL` — your Neon connection string
   - `NEXTAUTH_SECRET` — strong random secret (`openssl rand -base64 32`)
   - `NEXTAUTH_URL` — your Vercel deployment URL (e.g. `https://yourapp.vercel.app`)
4. Click **Deploy**
5. After deploy, seed the production database:
   ```bash
   DATABASE_URL="your-production-url" npm run db:seed
   ```

---

## Available Routes

### Public
- `/` — Landing page
- `/login` — Login page

### Admin (requires ADMIN role)
- `/admin` — Dashboard with stats and activity
- `/admin/clients` — Client management (CRUD)
- `/admin/clients/[id]` — Client detail with all sub-entities
- `/admin/projects` — Project management
- `/admin/invoices` — Invoice management
- `/admin/tutorials` — Tutorial articles
- `/admin/settings` — Agency settings

### Client Portal (requires authentication)
- `/portal` — Dashboard overview
- `/portal/project` — Project details and milestones
- `/portal/invoices` — Invoices and payment status
- `/portal/agreement` — Agreement documents
- `/portal/welcome` — Welcome document
- `/portal/timeline` — Project timeline
- `/portal/updates` — Project update feed
- `/portal/deliverables` — Final deliverables
- `/portal/tutorials` — Help center

---

## Database Schema

12 Prisma models: `User`, `Client`, `Project`, `Invoice`, `Agreement`, `WelcomeDocument`, `OnboardingTask`, `Milestone`, `ProjectUpdate`, `Deliverable`, `TutorialArticle`, `ActivityLog`

Run `npx prisma studio` to browse the database visually.

---

## File Upload Architecture

Currently stores **file metadata** (fileName, fileUrl, fileType) in the database with placeholder URLs in seed data. Ready to connect to:
- **Vercel Blob** — `@vercel/blob`
- **UploadThing** — `uploadthing`
- **AWS S3** — `@aws-sdk/client-s3`
- **Supabase Storage** — `@supabase/supabase-js`

---

## Security Notes

- Passwords are hashed with bcrypt (12 salt rounds)
- JWT sessions — no session data stored in DB
- All API routes verify authentication and role
- Client portal only shows data for the authenticated client's userId
- Admin portal is restricted to ADMIN role only
- **Change default seeded credentials before going live**

