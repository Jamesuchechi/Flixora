# Flixora — Technical Documentation

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [App Router & Routing](#app-router--routing)
3. [TMDB API Integration](#tmdb-api-integration)
4. [Supabase Setup](#supabase-setup)
5. [Authentication](#authentication)
6. [State Management](#state-management)
7. [Components Guide](#components-guide)
8. [Styling System](#styling-system)
9. [Data Fetching Patterns](#data-fetching-patterns)
10. [Performance](#performance)
11. [Deployment](#deployment)

---

## Architecture Overview

Flixora uses **Next.js 15 App Router** with a clear separation between server and client components. The general principle is: fetch on the server, render on the client only where interactivity is needed.

```
Browser → Next.js App Router → Server Components (data fetch)
                             ↘ Client Components (interactivity)
                             → API Routes (TMDB proxy, Supabase mutations)
                             → Supabase (auth, watchlist, progress)
                             → TMDB API (movie data)
```

### Rendering Strategy

| Page | Strategy | Reason |
|---|---|---|
| Home (`/`) | ISR (60s revalidate) | Trending changes hourly |
| Movie Detail (`/movies/[id]`) | SSG + revalidate | Stable metadata |
| Watch (`/watch/[id]`) | SSR | Needs auth check |
| Search (`/search`) | CSR | Real-time, user-driven |
| Profile (`/profile`) | SSR | User-specific data |

---

## App Router & Routing

Flixora uses the **App Router** introduced in Next.js 13 and matured in Next.js 15.

### Route Groups

```
app/
├── (auth)/        # Routes WITHOUT the main navbar (login, signup)
└── (main)/        # Routes WITH the main navbar (everything else)
```

Route groups use parentheses and do not affect the URL. They allow different layouts per section.

### Layouts

```tsx
// app/(main)/layout.tsx
export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  );
}
```

### Dynamic Routes

```
/movies/[id]       → Movie detail page
/series/[id]       → Series detail page
/watch/[id]        → Watch page (movie or episode)
```

The `[id]` is the TMDB content ID, e.g. `/movies/693134` for Dune Part Two.

---

## TMDB API Integration

All TMDB calls are proxied through Next.js API routes to keep the API key server-side only.

### API Client (`lib/tmdb.ts`)

```typescript
const TMDB_BASE = process.env.TMDB_BASE_URL;
const TMDB_KEY  = process.env.TMDB_API_KEY;
const IMG_BASE  = process.env.TMDB_IMAGE_BASE;

export const tmdb = {
  get: async <T>(endpoint: string, params?: Record<string, string>): Promise<T> => {
    const url = new URL(`${TMDB_BASE}${endpoint}`);
    url.searchParams.set('api_key', TMDB_KEY!);
    if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

    const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error(`TMDB error: ${res.status}`);
    return res.json();
  },

  image: (path: string, size: 'w300' | 'w500' | 'w780' | 'original' = 'w500') =>
    `${IMG_BASE}/${size}${path}`,
};
```

### Key Endpoints Used

| Endpoint | Used For |
|---|---|
| `/trending/all/day` | Hero banner, trending row |
| `/movie/popular` | Popular movies row |
| `/movie/top_rated` | Top rated row |
| `/movie/{id}` | Movie detail page |
| `/movie/{id}/credits` | Cast section |
| `/movie/{id}/videos` | Trailer embed |
| `/tv/popular` | Series browse |
| `/tv/{id}/season/{n}` | Episode list |
| `/search/multi` | Search overlay |
| `/genre/movie/list` | Genre filter tabs |

### Proxy API Route (`app/api/tmdb/[...route]/route.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: { route: string[] } }) {
  const endpoint = '/' + params.route.join('/');
  const search   = req.nextUrl.searchParams.toString();
  const url      = `${process.env.TMDB_BASE_URL}${endpoint}?api_key=${process.env.TMDB_API_KEY}&${search}`;

  const res  = await fetch(url, { next: { revalidate: 3600 } });
  const data = await res.json();

  return NextResponse.json(data);
}
```

---

## Supabase Setup

### Database Schema

Run these SQL migrations in your Supabase project:

```sql
-- Users profile (extends Supabase auth.users)
create table public.profiles (
  id          uuid references auth.users on delete cascade primary key,
  username    text unique,
  avatar_url  text,
  created_at  timestamptz default now()
);

-- Watchlist
create table public.watchlist (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references public.profiles(id) on delete cascade,
  tmdb_id     integer not null,
  media_type  text check (media_type in ('movie', 'tv')) not null,
  added_at    timestamptz default now(),
  unique(user_id, tmdb_id, media_type)
);

-- Watch progress
create table public.watch_progress (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references public.profiles(id) on delete cascade,
  tmdb_id     integer not null,
  media_type  text not null,
  season      integer,
  episode     integer,
  progress    numeric(5,2) default 0,  -- percentage 0-100
  updated_at  timestamptz default now(),
  unique(user_id, tmdb_id, media_type, season, episode)
);

-- Row Level Security
alter table public.watchlist enable row level security;
alter table public.watch_progress enable row level security;

create policy "Users manage own watchlist"
  on public.watchlist for all using (auth.uid() = user_id);

create policy "Users manage own progress"
  on public.watch_progress for all using (auth.uid() = user_id);
```

### Supabase Clients

```typescript
// lib/supabase/client.ts  (for Client Components)
import { createBrowserClient } from '@supabase/ssr';

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

// lib/supabase/server.ts  (for Server Components & API routes)
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const createClient = async () => {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: (c) => c.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } }
  );
};
```

---

## Authentication

Flixora uses **Supabase Auth** with email/password and optional OAuth (Google).

### Auth Flow

```
User visits protected page
  → Middleware checks session
    → No session → redirect to /login
    → Session valid → render page

Login/Signup
  → Supabase Auth creates session
  → Session stored in cookie (SSR-compatible)
  → Redirect to /
```

### Middleware (`middleware.ts`)

```typescript
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const PROTECTED = ['/profile', '/watch'];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => req.cookies.getAll(), setAll: (c) => c.forEach(({ name, value, options }) => res.cookies.set(name, value, options)) } }
  );

  const { data: { session } } = await supabase.auth.getSession();
  const isProtected = PROTECTED.some(p => req.nextUrl.pathname.startsWith(p));

  if (!session && isProtected) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return res;
}

export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'] };
```

---

## State Management

Global state is managed with **Zustand** — lightweight, no boilerplate.

```typescript
// store/useStore.ts
import { create } from 'zustand';

interface FlixoraStore {
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;

  activeGenre: string;
  setActiveGenre: (genre: string) => void;

  watchlist: number[];
  addToWatchlist: (id: number) => void;
  removeFromWatchlist: (id: number) => void;
}

export const useStore = create<FlixoraStore>((set) => ({
  searchOpen: false,
  setSearchOpen: (open) => set({ searchOpen: open }),

  activeGenre: 'All',
  setActiveGenre: (genre) => set({ activeGenre: genre }),

  watchlist: [],
  addToWatchlist: (id) => set((s) => ({ watchlist: [...s.watchlist, id] })),
  removeFromWatchlist: (id) => set((s) => ({ watchlist: s.watchlist.filter((w) => w !== id) })),
}));
```

Server state (TMDB data, user watchlist from DB) uses **React Query** or Next.js's built-in `fetch` caching.

---

## Components Guide

### MovieCard

The primary card used across all browsing rows.

```tsx
interface MovieCardProps {
  id: number;
  title: string;
  posterPath: string;
  rating: number;
  year: string;
  mediaType: 'movie' | 'tv';
  rank?: number;
}
```

### HeroBanner

Server component. Fetches the daily trending #1 item from TMDB and renders the full-bleed hero with aurora orbs, title, metadata, and CTA buttons.

### MovieRow

Client component. Accepts a pre-fetched array of movies or a TMDB endpoint string, renders a horizontally scrollable row with genre filtering.

### VideoPlayer

Client component wrapping **Plyr.js**. Accepts a video source URL or YouTube embed ID. Tracks progress every 10 seconds and syncs to Supabase `watch_progress`.

### SearchOverlay

Client component. Triggered via `Cmd+K` or the search button. Debounces input by 300ms and calls `/api/tmdb/search/multi`.

---

## Styling System

Flixora uses **Tailwind CSS v4** with a custom design token layer.

### Design Tokens (`globals.css`)

```css
:root {
  --flx-bg:        #06070d;
  --flx-surface-1: #0c0d18;
  --flx-surface-2: #11121f;
  --flx-text-1:    #eeeeff;
  --flx-text-2:    #9090b0;
  --flx-text-3:    #55557a;
  --flx-purple:    #8b5cf6;
  --flx-cyan:      #22d3ee;
  --flx-pink:      #f472b6;
  --flx-gold:      #fbbf24;
}
```

### Fonts

Both fonts are loaded via `next/font/google` for zero layout shift:

```typescript
import { Outfit } from 'next/font/google';
import localFont from 'next/font/local';

export const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });
```

Bebas Neue is loaded as a local font for performance.

---

## Data Fetching Patterns

### Server Component (recommended for static/ISR pages)

```tsx
// app/(main)/movies/page.tsx
export const revalidate = 3600;

export default async function MoviesPage() {
  const trending = await tmdb.get<TMDBResponse>('/trending/movie/day');
  return <MovieRow movies={trending.results} />;
}
```

### Client Component with SWR (for real-time / user-specific)

```tsx
'use client';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export function WatchlistRow() {
  const { data, isLoading } = useSWR('/api/watchlist', fetcher);
  if (isLoading) return <SkeletonRow />;
  return <MovieRow movies={data} />;
}
```

---

## Performance

### Image Optimization

All TMDB images go through `next/image`:

```tsx
<Image
  src={tmdb.image(movie.poster_path, 'w500')}
  alt={movie.title}
  width={300}
  height={450}
  placeholder="blur"
  blurDataURL="/placeholder-poster.png"
/>
```

### Key Optimizations

- **ISR** on browse pages — data cached at the edge, revalidated hourly
- **Streaming** with `<Suspense>` for non-critical rows below the fold
- **Lazy loading** for off-screen movie rows using Intersection Observer
- **Prefetching** on `MovieCard` hover via `router.prefetch()`
- **Route segment config** (`export const revalidate`) per page needs

---

## Deployment

Flixora is optimized for **Vercel** deployment.

### Steps

```bash
# 1. Push to GitHub

# 2. Import repo in Vercel dashboard

# 3. Set environment variables in Vercel project settings:
#    TMDB_API_KEY
#    TMDB_BASE_URL
#    TMDB_IMAGE_BASE
#    NEXT_PUBLIC_SUPABASE_URL
#    NEXT_PUBLIC_SUPABASE_ANON_KEY
#    SUPABASE_SERVICE_ROLE_KEY
#    NEXT_PUBLIC_APP_URL  (your vercel domain)

# 4. Deploy
```

### Supabase Auth Redirect

Add your Vercel deployment URL to Supabase Auth → URL Configuration → Redirect URLs:

```
https://your-app.vercel.app/**
```