# LMS — Learning Management System

A production-ready, cloud-native Learning Management System built with modern web technologies. Features role-based access control, secure invite-based onboarding, sequential video curriculum delivery, and a polished admin dashboard.

![Next.js](https://img.shields.io/badge/Next.js-16-000?logo=nextdotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?logo=tailwindcss)
![Supabase](https://img.shields.io/badge/Supabase-Auth_&_DB-3ECF8E?logo=supabase)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma)

---

## Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Setting Up Supabase](#setting-up-supabase)
- [Setting Up Resend (Email)](#setting-up-resend-email)
- [Environment Variables](#environment-variables)
- [Local Development Setup](#local-development-setup)
- [Database Schema](#database-schema)
- [Authentication Flow](#authentication-flow)
- [Features](#features)
- [DevOps & Deployment](#devops--deployment)

---

## Project Overview

This LMS enables organizations to:

- **Admin**: Create courses with sequenced YouTube video curricula, invite students via email, and manage enrollments.
- **Students**: Access enrolled courses, watch videos in a locked sequential order, and track their progress.
- **Security**: All routes are protected by Supabase Auth with cookie-based SSR sessions. Role-based middleware ensures students can't access admin pages and vice versa.

---

## Tech Stack

| Layer          | Technology                                      |
| -------------- | ----------------------------------------------- |
| Framework      | Next.js 16 (App Router)                         |
| Language       | TypeScript 5                                    |
| Styling        | Tailwind CSS 4 + shadcn/ui                      |
| Database       | Supabase PostgreSQL                             |
| ORM            | Prisma (with connection pooling)                |
| Authentication | Supabase Auth SSR (`@supabase/ssr`)             |
| Email          | Resend + React Email                            |
| Validation     | Zod                                             |
| Forms          | React Hook Form + Zod resolvers                 |
| Icons          | Lucide React                                    |
| Notifications  | Sonner (toast)                                  |

---

## Architecture

```
src/
├── app/
│   ├── (auth)/              # Login + Set Password pages
│   │   ├── login/
│   │   └── set-password/
│   ├── (admin)/admin/       # Admin dashboard (courses, videos, students)
│   │   ├── courses/[courseId]/
│   │   ├── videos/
│   │   └── students/
│   ├── (dashboard)/dashboard/  # Student dashboard
│   │   └── courses/[courseId]/
│   ├── auth/callback/       # Supabase auth callback route
│   └── layout.tsx           # Root layout with Toaster
├── actions/                 # Server Actions (auth, courses, videos, students, progress)
├── components/
│   ├── ui/                  # shadcn/ui components
│   └── features/            # Domain components (VideoPlayer, CourseCard, LogoutButton)
├── emails/                  # React Email templates
├── lib/
│   ├── prisma.ts            # PrismaClient singleton
│   ├── supabase/
│   │   ├── server.ts        # Server-side Supabase client (+ admin client)
│   │   └── client.ts        # Browser Supabase client
│   ├── validations.ts       # Zod schemas
│   ├── youtube.ts           # YouTube URL parser & embed URL builder
│   └── utils.ts             # cn() utility
└── proxy.ts                 # Auth guard + role-based routing
```

---

## Prerequisites

- **Node.js** >= 18.17 (LTS recommended)
- **npm** >= 9
- A **Supabase** account (free tier works)
- A **Resend** account (free tier works — 100 emails/day)

---

## Setting Up Supabase

### Step 1 — Create a Supabase Project

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard) and sign in (or create an account)
2. Click **"New Project"** (top left)
3. Choose your **Organization** (or create one)
4. Fill in:
   - **Name**: `lms` (or anything you like)
   - **Database Password**: choose a strong password — **save this, you'll need it for the connection strings**
   - **Region**: pick the closest to your users
5. Click **"Create new project"** and wait ~2 minutes for provisioning

### Step 2 — Get Your API Keys

1. In your project dashboard, click **"Settings"** (gear icon, bottom of the left sidebar)
2. Click **"API"** under the **Configuration** section
3. Copy these three values into your `.env` file:

| Dashboard Label            | `.env` Variable                |
| -------------------------- | ------------------------------ |
| **Project URL**            | `NEXT_PUBLIC_SUPABASE_URL`     |
| **anon / public** key      | `NEXT_PUBLIC_SUPABASE_ANON_KEY`|
| **service_role / secret** key | `SUPABASE_SERVICE_ROLE_KEY`  |

> ⚠️ The **service_role** key bypasses Row Level Security. Never expose it to the browser — it's only used server-side.

### Step 3 — Enable Email Auth Provider

1. In the left sidebar, click **"Authentication"**
2. Click **"Providers"** tab
3. Make sure **Email** is enabled (it is by default)
4. Under Email settings, **disable** "Confirm email" for local development (optional — the seed script auto-confirms users)

### Step 4 — Configure Auth Redirect URLs

1. Go to **Authentication** → **URL Configuration**
2. Set **Site URL** to: `http://localhost:3000`
3. Under **Redirect URLs**, add:
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000/**` (wildcard for convenience in development)

> For production, replace `localhost:3000` with your actual domain.

### Step 5 — Get Database Connection Strings

1. Go to **Settings** → **Database**
2. Scroll down to **Connection string** section
3. Select the **URI** tab
4. You'll see two connection modes:

**Transaction Pooler (port 6543)** — use for `DATABASE_URL`:
```
postgresql://postgres.[your-project-ref]:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Session Pooler / Direct (port 5432)** — use for `DIRECT_URL`:
```
postgresql://postgres.[your-project-ref]:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:5432/postgres
```

> Replace `[YOUR-PASSWORD]` with the database password you set in Step 1.

---

## Setting Up Resend (Email)

### Step 1 — Create a Resend Account

1. Go to [https://resend.com/signup](https://resend.com/signup) and create an account
2. Verify your email address

### Step 2 — Create an API Key

1. In the Resend dashboard, click **"API Keys"** in the left sidebar
2. Click **"Create API Key"**
3. Give it a name like `lms-dev`
4. Set permission to **"Full access"** (or "Sending access" if you prefer)
5. Click **"Add"** and **copy the key immediately** — it starts with `re_` and is only shown once
6. Paste it as `RESEND_API_KEY` in your `.env`

### Step 3 — Set Up a Sending Domain (Optional for Dev)

**For local development**, you can use Resend's built-in test address:
```
RESEND_FROM_EMAIL=onboarding@resend.dev
```
This works immediately with no domain setup, but emails can only be sent **to your own Resend account email**.

**For production**, verify your own domain:
1. Click **"Domains"** in the left sidebar
2. Click **"Add Domain"**
3. Enter your domain (e.g. `yourdomain.com`)
4. Resend will show DNS records (MX, TXT) to add at your domain registrar
5. Add the records, click **"Verify"**, and wait for propagation (usually a few minutes)
6. Once verified, update your `.env`:
   ```
   RESEND_FROM_EMAIL=noreply@yourdomain.com
   ```

---

## Environment Variables

Create a `.env` file at the project root (see `.env.example`):

```bash
# ─── Supabase ───────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key   # Server-only, never exposed to client

# ─── Database (Prisma) ──────────────────────────────
# Transaction pooler (port 6543) for application queries
DATABASE_URL="postgresql://postgres.[ref]:[pass]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"
# Direct connection (port 5432) for Prisma Migrate
DIRECT_URL="postgresql://postgres.[ref]:[pass]@aws-0-[region].pooler.supabase.com:5432/postgres"

# ─── Resend (Email) ─────────────────────────────────
RESEND_API_KEY=re_your_api_key
RESEND_FROM_EMAIL=onboarding@yourdomain.com

# ─── App ─────────────────────────────────────────────
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

| Variable                        | Exposed to Client | Where to Find It                                 |
| ------------------------------- | ----------------- | ------------------------------------------------ |
| `NEXT_PUBLIC_SUPABASE_URL`      | ✅                | Supabase → Settings → API → Project URL          |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅                | Supabase → Settings → API → anon public          |
| `SUPABASE_SERVICE_ROLE_KEY`     | ❌                | Supabase → Settings → API → service_role secret  |
| `DATABASE_URL`                  | ❌                | Supabase → Settings → Database → Connection string (port 6543) |
| `DIRECT_URL`                    | ❌                | Supabase → Settings → Database → Connection string (port 5432) |
| `RESEND_API_KEY`                | ❌                | Resend → API Keys → your key                     |
| `RESEND_FROM_EMAIL`             | ❌                | Your verified domain or `onboarding@resend.dev`  |
| `NEXT_PUBLIC_APP_URL`           | ✅                | `http://localhost:3000` for dev                  |

---

## Local Development Setup

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd LMS
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Fill in all values from your Supabase dashboard and Resend account
```

### 3. Run Database Migrations

```bash
npx prisma migrate dev --name init
```

This creates all tables in your Supabase PostgreSQL database.

### 4. Generate Prisma Client

```bash
npx prisma generate
```

### 5. Seed the Database

The project includes an automated seed script that creates admin users, test students, sample courses with videos, enrollments, and progress data.

```bash
# Install tsx (if not already installed)
npm install -D tsx

# Run the seed script
npm run db:seed
```

This creates the following test accounts (all using password `Test@1234!`):

| Email                    | Role    |
| ------------------------ | ------- |
| `admin@lms.local`        | ADMIN   |
| `testadmin@lms.local`    | ADMIN   |
| `student1@lms.local`     | STUDENT |
| `student2@lms.local`     | STUDENT |
| `student3@lms.local`     | STUDENT |

It also seeds:
- **3 courses** (2 active, 1 inactive) with YouTube videos
- **Enrollments** for all students in the 2 active courses
- **Progress** — student1 has completed the first video of the first course

> **Note**: The seed script is idempotent — you can safely run it multiple times. It skips records that already exist. Make sure your `.env` file has valid `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `DATABASE_URL` before running.

You can also run `npx prisma db seed` which uses the `prisma.seed` config in `package.json`.

To customize the seed data, edit `prisma/seed.ts` directly.

### 6. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Database Schema

| Model          | Key Fields                                              | Constraints             |
| -------------- | ------------------------------------------------------- | ----------------------- |
| **User**       | id, email, role (STUDENT/ADMIN), requiresPasswordChange | Unique: email           |
| **Course**     | id, title, description, isActive                        | Index: isActive         |
| **Video**      | id, title, youtubeUrl, sequence, courseId                | Unique: courseId+seq    |
| **Enrollment** | id, userId, courseId                                     | Unique: userId+courseId |
| **UserProgress**| id, userId, videoId, isCompleted, completedAt           | Unique: userId+videoId  |

---

## Authentication Flow

1. **Admin invites student** → Supabase Admin API generates invite link → Resend sends styled email
2. **Student clicks link** → `/auth/callback` exchanges code for session → redirects to `/set-password`
3. **Student sets password** → Supabase Auth updated + Prisma `requiresPasswordChange` set to `false`
4. **Subsequent logins** → `/login` page → middleware routes to `/dashboard` or `/admin` based on role

### Middleware Rules

| Condition                        | Action                          |
| -------------------------------- | ------------------------------- |
| Unauthenticated + protected page | → Redirect to `/login`          |
| Authenticated + `/login`         | → Redirect to dashboard/admin   |
| `requiresPasswordChange: true`   | → Lock to `/set-password`       |
| STUDENT accessing `/admin/*`     | → Redirect to `/dashboard`      |

---

## Features

### Admin Dashboard (`/admin`)
- **Courses**: Create, view, and manage courses with activation toggles
- **Videos**: Add YouTube videos with sequence numbers to any course
- **Students**: Invite via email, view status, manage enrollments
- **Course Detail**: View curriculum, enroll/unenroll students

### Student Dashboard (`/dashboard`)
- **My Courses**: View all enrolled courses with progress bars
- **Course View**: Sequential video player with curriculum sidebar
- **Progress Tracking**: "Mark as Complete" unlocks the next video
- **Sequential Locking**: Videos are locked until prior sequence is completed

### Security
- **Zod validation** on all Server Actions and API inputs
- **YouTube iframe sandboxing**: `allow-scripts allow-same-origin allow-presentation`
- **Privacy-first embeds**: `youtube-nocookie.com/embed/`
- **Cookie-based SSR sessions** via `@supabase/ssr`
- **Service role key** is server-only, never exposed to the client

---

## DevOps & Deployment

### Vercel Deployment

1. **Connect Repository** — Link your GitHub/GitLab repo to [Vercel](https://vercel.com)
2. **Set Environment Variables** — Add all variables from `.env.example` in the Vercel dashboard
3. **Build Settings** — Framework preset: Next.js (auto-detected)
4. **Deploy** — Push to `main` branch to trigger automatic deployment

### Database Scaling

- **Connection Pooling**: Already configured via `DATABASE_URL` with `?pgbouncer=true` (port 6543)
- **Direct URL**: `DIRECT_URL` (port 5432) is used only for `prisma migrate`, never for application queries
- **Supabase Pro**: For production, upgrade to Supabase Pro for higher connection limits, daily backups, and SLA
- **Read Replicas**: Supabase supports read replicas for heavy read workloads

### Production Checklist

- [ ] Set `NEXT_PUBLIC_APP_URL` to your production domain
- [ ] Verify Resend sending domain in production
- [ ] Run `npx prisma migrate deploy` in your CI/CD pipeline
- [ ] Enable Supabase Auth email rate limiting
- [ ] Configure Supabase Auth redirect URLs for production domain
- [ ] Enable RLS policies if exposing Supabase directly (this app uses Prisma server-side)
- [ ] Set up monitoring (Vercel Analytics, Sentry, etc.)

### CI/CD Pipeline (Example)

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npx prisma generate
      - run: npx prisma migrate deploy
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          DIRECT_URL: ${{ secrets.DIRECT_URL }}
      - run: npm run build
```

---

## License

MIT

