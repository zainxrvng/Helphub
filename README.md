# HelpHub AI

A peer-to-peer community support platform built for the SMIT Grand Coding Night Hackathon. Community members can ask for help, offer help, and get matched based on skills — powered by AI-driven insights and a trust score system.

## Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **AI:** Vercel AI SDK + Google Gemini 1.5 Flash
- **Runtime:** React 19

## Features

- **Authentication** — Real login/signup against Supabase with fallback demo users
- **Help Requests** — Create, browse, and filter community requests by category, urgency, and location
- **AI Assistant** — Keyword-based AI auto-detects category, urgency, and suggests tags while writing a request
- **Trust Score System** — Users earn trust points by helping others; displayed on leaderboard
- **Badges** — Awarded for contributions (Design Ally, Code Rescuer, Top Mentor, etc.)
- **Leaderboard** — Rankings by trust score with badge showcase
- **Notifications** — Real-time feed for request matches, status updates, and reputation changes
- **Messaging** — Direct messages between helpers and requesters
- **AI Center** — Platform intelligence: trend pulse, urgency watch, mentor pool, recommendations
- **Admin Panel** — Password-protected dashboard with user/request management and Gemini-powered AI chat

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/zainxrvng/Helphub.git
cd Helphub
npm install
```

### 2. Set up environment variables

Create a `.env.local` file in the root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key
```

### 3. Set up Supabase

Run the SQL in `supabase-schema.sql` in your Supabase SQL Editor. This creates all tables, disables RLS for demo, and seeds sample data.

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Demo Login

If Supabase is not configured, these demo accounts work out of the box:

| Name | Email | Password | Role |
|------|-------|----------|------|
| Ayesha Khan | ayesha@helphub.ai | demo123 | Both |
| Hassan Ali | hassan@helphub.ai | demo123 | Can Help |
| Sara Noor | sara@helphub.ai | demo123 | Both |

## Admin Panel

Navigate to `/admin` and use password: `admin123`

Features:
- Overview stats (users, requests, solved rate)
- Category breakdown charts
- User management with trust score boosts
- Request status management
- AI chat powered by Gemini — ask about trends, who needs badges, urgent requests, etc.

## Project Structure

```
├── app/
│   ├── (auth)/auth/        # Login & signup
│   ├── admin/              # Admin panel
│   ├── ai-center/          # Platform AI insights
│   ├── api/ai-chat/        # Gemini streaming API route
│   ├── create-request/     # New help request form
│   ├── dashboard/          # User dashboard
│   ├── explore/            # Browse & filter requests
│   ├── leaderboard/        # Trust score rankings
│   ├── messages/           # Direct messaging
│   ├── notifications/      # Notification feed
│   ├── profile/            # User profile & edit
│   └── request/[id]/       # Request detail view
├── components/
│   └── Navbar.tsx
├── lib/
│   ├── ai.ts               # Keyword-based AI logic
│   ├── store.ts            # Supabase data layer + fallbacks
│   └── supabase.ts         # Supabase client
└── styles/
    └── globals.css
```

## Scripts

```bash
npm run dev      # Start dev server with Turbopack
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```
