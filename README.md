# 🎬 Flixora

> A modern, cinematic movie streaming web application built with Next.js 15.

![Flixora Banner](https://placeholder.com/banner)

---

## What is Flixora?

Flixora is a full-stack movie and series streaming platform inspired by the best of modern streaming UIs. It features an aurora/cosmic dark aesthetic, real-time movie data from the TMDB API, user authentication, watchlists, and a smooth cinematic browsing experience.

Built from scratch with **Next.js 15**, **TypeScript**, **Tailwind CSS**, and **Supabase** — designed to be fast, scalable, and visually stunning.

---

## Features

- 🌌 **Aurora UI** — immersive dark theme with cinematic design
- 🔍 **Search** — real-time movie & series search powered by TMDB
- 🎥 **Browse** — trending, top rated, by genre, new releases
- 📺 **Series & Movies** — full metadata, cast, trailers, ratings
- ▶️ **Watch Page** — embedded video player with controls
- 💾 **Watchlist** — save and manage titles per user
- 🔐 **Auth** — sign up / login via Supabase (email + OAuth)
- 📊 **Continue Watching** — resume playback with progress tracking
- 📱 **Responsive** — works on mobile, tablet, and desktop

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Movie Data | TMDB API v3 |
| Video Player | Plyr.js |
| State | Zustand |
| Fonts | Bebas Neue + Outfit (Google Fonts) |
| Deployment | Vercel |

---

## Project Structure

```
flixora/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── signup/
│   ├── (main)/
│   │   ├── page.tsx              # Home
│   │   ├── movies/
│   │   │   ├── page.tsx          # Browse movies
│   │   │   └── [id]/page.tsx     # Movie detail
│   │   ├── series/
│   │   │   ├── page.tsx          # Browse series
│   │   │   └── [id]/page.tsx     # Series detail
│   │   ├── watch/
│   │   │   └── [id]/page.tsx     # Watch page
│   │   ├── search/
│   │   │   └── page.tsx          # Search results
│   │   └── profile/
│   │       └── page.tsx          # User profile & watchlist
│   ├── api/
│   │   ├── tmdb/
│   │   │   └── [...route]/route.ts
│   │   └── watchlist/
│   │       └── route.ts
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                       # Reusable primitives
│   │   ├── Button.tsx
│   │   ├── Badge.tsx
│   │   └── Skeleton.tsx
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   ├── home/
│   │   ├── HeroBanner.tsx
│   │   ├── MovieRow.tsx
│   │   ├── ContinueWatching.tsx
│   │   └── GenreTabs.tsx
│   ├── movie/
│   │   ├── MovieCard.tsx
│   │   ├── MovieDetail.tsx
│   │   └── CastCard.tsx
│   ├── player/
│   │   └── VideoPlayer.tsx
│   └── search/
│       └── SearchOverlay.tsx
├── lib/
│   ├── tmdb.ts                   # TMDB API client
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   └── utils.ts
├── hooks/
│   ├── useWatchlist.ts
│   ├── useSearch.ts
│   └── useProgress.ts
├── store/
│   └── useStore.ts               # Zustand global state
├── types/
│   └── tmdb.ts                   # TMDB type definitions
├── public/
│   └── assets/
├── .env.local.example
├── next.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm or pnpm
- A [TMDB API key](https://www.themoviedb.org/settings/api)
- A [Supabase](https://supabase.com) project

### Installation

```bash
# 1. Clone the repo
git clone https://github.com/yourusername/flixora.git
cd flixora

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.local.example .env.local
# Fill in your keys (see Environment Variables below)

# 4. Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see Flixora running.

---

## Environment Variables

Create a `.env.local` file at the root:

```env
# TMDB
TMDB_API_KEY=your_tmdb_api_key
TMDB_BASE_URL=https://api.themoviedb.org/3
TMDB_IMAGE_BASE=https://image.tmdb.org/t/p

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Scripts

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run start     # Start production server
npm run lint      # Run ESLint
npm run type-check  # Run TypeScript checks
```

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit your changes: `git commit -m 'feat: add your feature'`
4. Push to the branch: `git push origin feat/your-feature`
5. Open a pull request

---

## License

MIT License — see [LICENSE](./LICENSE) for details.

---

<p align="center">Built with ❤️ by the Flixora team</p>