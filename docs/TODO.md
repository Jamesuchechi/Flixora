# Flixora — Build Phases & TODO

> Structured roadmap for building Flixora from zero to production.

---

## Overview

| Phase | Name                      | Status         |
| ----- | ------------------------- | -------------- |
| 1     | Foundation & Setup        | 🔲 Not started |
| 2     | TMDB Integration & Browse | 🔲 Not started |
| 3     | Movie & Series Detail     | 🔲 Not started |
| 4     | Auth & User Accounts      | 🔲 Not started |
| 5     | Watchlist & Progress      | 🔲 Not started |
| 6     | Watch Page & Player       | 🔲 Not started |
| 7     | Search                    | 🔲 Not started |
| 8     | Polish & Performance      | 🔲 Not started |
| 9     | Testing & QA              | 🔲 Not started |
| 10    | Launch                    | 🔲 Not started |

---

## Phase 1 — Foundation & Setup

> Goal: working Next.js 15 project with design system in place.

### Project Init

- [x] Scaffold Next.js 15 app with TypeScript (`npx create-next-app@latest`)
- [x] Set up App Router structure with `(auth)` and `(main)` route groups
- [x] Configure `tsconfig.json` path aliases (`@/components`, `@/lib`, etc.)
- [x] Install and configure Tailwind CSS v4
- [x] Set up ESLint + Prettier with project conventions
- [x] Create `.env.local.example` with all required keys documented
- [x] Initialise Git repo and push to GitHub

### Design System

- [x] Define CSS custom properties (colors, spacing, radius) in `globals.css`
- [x] Load Outfit via `next/font/google`, Bebas Neue as local font
- [x] Create base Tailwind config with Flixora color tokens
- [x] Build `Button` component (variants: primary, secondary, ghost, icon)
- [x] Build `Badge` / `Pill` component with color variants
- [x] Build `Skeleton` component for loading states
- [x] Build `Spinner` component

### Layout

- [x] Build `Navbar` component (logo, links, search trigger, notification bell, avatar)
- [x] Build `Footer` (minimal bottom nav strip)
- [x] Wire `(main)/layout.tsx` with Navbar + Footer
- [x] Wire `(auth)/layout.tsx` (clean, no nav)
- [x] Add `next/image` domains config for `image.tmdb.org`

---

## Phase 2 — TMDB Integration & Home Browse

> Goal: real movie data populating the home page.

### TMDB Client

- [x] Create `lib/tmdb.ts` API client with typed `get()` helper
- [x] Add `tmdb.image()` helper for poster/backdrop URLs
- [x] Define TypeScript types in `types/tmdb.ts` (Movie, TVShow, Credits, Video, etc.)
- [x] Create proxy API route `app/api/tmdb/[...route]/route.ts`
- [x] Test all key TMDB endpoints return correct data

### Home Page

- [x] Build `HeroBanner` server component (fetch trending #1, aurora orbs, CTA buttons)
- [x] Build `MovieCard` component (poster, title, rating, rank, hover overlay)
- [x] Build `MovieRow` component (horizontal scroll, section header, "View all" link)
- [ ] Build `ContinueWatching` row (thumbnail, progress bar, episode badge) — static for now
- [x] Build `FeaturedCard` (wide card for series, hover play overlay)
- [x] Build `GenreTabs` (interactive filter tabs, client component)
- [x] Build `TopBar` (live stats strip below hero)
- [x] Assemble home page `app/(main)/page.tsx` with all rows
- [x] Add ISR revalidation (`export const revalidate = 3600`)
- [x] Add `<Suspense>` wrappers with skeleton fallbacks for each row

### Browse Pages

- [x] Build `/movies` page with paginated grid
- [x] Build `/series` page with paginated grid
- [ ] Add genre filter sidebar / tabs to browse pages
- [x] Add sort options (trending, top rated, newest, A–Z)
- [ ] Implement infinite scroll or pagination controls

---

## Phase 3 — Movie & Series Detail Pages

> Goal: full detail pages with metadata, trailer, and cast.

### Movie Detail (`/movies/[id]`)

- [x] Fetch movie data + credits + videos in parallel (server component)
- [x] Build hero section (backdrop image, title, meta, genres, overview)
- [x] Build `TrailerButton` (opens YouTube embed in modal)
- [x] Build `CastRow` (horizontal scrollable cast cards with headshot)
- [x] Build info sidebar (director, language, budget, revenue, status)
- [x] Add "More Like This" row (TMDB similar/recommendations endpoint)
- [x] Add `Add to Watchlist` button (disabled until auth phase)
- [x] Generate static params for top 100 movies (`generateStaticParams`)

### Series Detail (`/series/[id]`)

- [x] Fetch series data + credits + season list
- [x] Build season selector (dropdown or tabs)
- [x] Build episode list for selected season (thumbnail, title, runtime, synopsis)
- [x] Show series-level cast and overview
- [x] Generate static params for top 50 series

### Shared

- [x] Build `TrailerModal` component (YouTube embed, keyboard close, backdrop click)
- [x] Build `MediaHero` reusable hero (shared between movie and series detail)

---

## Phase 4 — Auth & User Accounts

> Goal: users can sign up, log in, and have a persistent session.

### Supabase Setup

- [x] Create Supabase project
- [x] Run database migrations (profiles, watchlist, watch_progress tables)
- [x] Enable Row Level Security on all user tables
- [x] Configure Supabase Auth (email + Google OAuth)
- [x] Add Supabase URL to allowed redirect URLs

### Next.js Integration

- [x] Install `@supabase/ssr` and `@supabase/supabase-js`
- [x] Create `lib/supabase/client.ts` (browser client)
- [x] Create `lib/supabase/server.ts` (server client with cookies)
- [ ] Write `middleware.ts` to protect `/watch` and `/profile` routes
- [ ] Auto-create profile row on new user sign-up (Supabase trigger or API route)

### Auth UI

- [x] Build `/login` page (email + password form, Google OAuth button)
- [ ] Build `/signup` page (email, password, username)
- [ ] Build `AuthForm` reusable component
- [ ] Add loading and error states to auth forms
- [ ] Handle OAuth callback in `app/auth/callback/route.ts`
- [x] Update `Navbar` to show user avatar / name when logged in
- [ ] Add logout button to profile dropdown

---

## Phase 5 — Watchlist & Progress Tracking

> Goal: users can save titles and resume watching.

### Watchlist

- [ ] Build `useWatchlist` hook (add, remove, check, fetch from Supabase)
- [x] Wire `Add to Watchlist` button on MovieCard and detail pages
- [ ] Build API route `POST/DELETE /api/watchlist`
- [x] Build `/profile` page with watchlist grid
- [x] Add optimistic UI updates for watchlist toggles (instant feedback)

### Watch Progress

- [ ] Build `useProgress` hook (get, set progress in Supabase)
- [ ] Track progress in VideoPlayer every 10 seconds
- [ ] Populate `ContinueWatching` row from real Supabase data
- [ ] Show resume position on movie/episode detail pages
- [ ] Mark episodes as "watched" when progress > 90%

### Zustand Store

- [x] Set up `store/useStore.ts` with Zustand
- [x] Hydrate local watchlist from Supabase on login
- [x] Sync watchlist actions between store and Supabase

---

## Phase 6 — Watch Page & Video Player

> Goal: users can watch content with a polished player.

- [x] Build `/watch/[id]` page layout (full-screen player, back button, metadata sidebar)
- [ ] Integrate **Plyr.js** as the video player (`VideoPlayer` component)
- [ ] Support YouTube embed (for trailers and demo)
- [ ] Support HLS streams (for actual video via `hls.js` + Plyr)
- [ ] Implement keyboard shortcuts (space = play/pause, arrow keys = seek, F = fullscreen)
- [ ] Auto-advance to next episode for series
- [ ] Show "Next Episode" card 20 seconds before end
- [ ] Save and restore playback position from Supabase
- [ ] Handle auth gate (redirect to login if not authenticated)

---

## Phase 7 — Search

> Goal: fast, real-time search across movies and series.

- [x] Build `SearchOverlay` component (modal, full-screen on mobile)
- [x] Implement `Cmd+K` / `Ctrl+K` keyboard shortcut to open search
- [x] Add search trigger to Navbar
- [x] Build `useSearch` hook with 300ms debounce
- [x] Call TMDB `/search/multi` endpoint as user types
- [ ] Display results grouped by type (Movies, Series, People)
- [x] Show poster thumbnails, rating, year in results
- [ ] Highlight matching text in results
- [x] Handle empty state and no-results state
- [x] Build `/search?q=` page for shareable search URLs
- [x] Add recent searches stored in localStorage

---

## Phase 8 — Polish & Performance

> Goal: production-quality UX and Core Web Vitals in the green.

### Animations

- [ ] Add page transition animations (fade/slide between routes)
- [x] Animate hero aurora orbs (subtle float keyframes)
- [ ] Add scroll-triggered fade-in for rows below the fold
- [x] Smooth hover transitions on all interactive elements
- [x] Animate watchlist button (heart fill/unfill)

### Performance

- [x] Audit and fix LCP (hero image must load fast — use `priority` on HeroBanner image)
- [x] Implement `<Suspense>` streaming for all data-heavy sections
- [ ] Lazy load `VideoPlayer` and `SearchOverlay` (dynamic imports)
- [ ] Add `blur` placeholder to all `next/image` components
- [ ] Enable Vercel Edge caching for TMDB proxy routes
- [ ] Audit bundle size with `@next/bundle-analyzer`
- [ ] Implement `router.prefetch()` on MovieCard hover

### Accessibility

- [ ] Full keyboard navigation (tab order, focus rings)
- [ ] ARIA labels on icon-only buttons (search, close, play)
- [ ] `alt` text on all images
- [ ] Respect `prefers-reduced-motion` for animations

### Mobile Responsiveness

- [ ] Responsive Navbar (hamburger menu on mobile)
- [ ] Single-column card grid on small screens
- [ ] Full-screen search overlay on mobile
- [ ] Touch-friendly swipe for horizontal rows
- [ ] Bottom navigation bar on mobile

### SEO

- [ ] Dynamic `generateMetadata` on movie/series detail pages (title, description, OG image)
- [ ] Sitemap generation (`app/sitemap.ts`)
- [ ] `robots.txt`
- [ ] Structured data (JSON-LD) for movie pages

---

## Phase 9 — Testing & QA

> Goal: confidence before launch.

- [ ] Set up **Vitest** for unit tests
- [ ] Set up **Playwright** for E2E tests
- [ ] Write unit tests for `lib/tmdb.ts` helpers
- [ ] Write unit tests for `useWatchlist` and `useProgress` hooks
- [ ] Write E2E test: browse home → open movie detail → add to watchlist
- [ ] Write E2E test: sign up → log in → log out flow
- [ ] Write E2E test: search → click result → land on detail page
- [ ] Cross-browser test (Chrome, Firefox, Safari)
- [ ] Mobile device test (iPhone, Android)
- [ ] Lighthouse audit — target 90+ on all metrics
- [ ] Fix any a11y issues flagged by axe-core

---

## Phase 10 — Launch

> Goal: live on the internet.

- [ ] Final `.env` audit — no secrets in client-side code
- [ ] Set all production environment variables in Vercel
- [ ] Set Supabase auth redirect URLs to production domain
- [ ] Run `npm run build` locally — zero errors, zero type errors
- [ ] Deploy to Vercel
- [ ] Smoke test production (home, search, detail, auth, watchlist, player)
- [ ] Set up Vercel Analytics
- [ ] Set up Sentry for error tracking
- [ ] Write launch post / share on socials 🚀

---

## Backlog (Post-Launch Ideas)

- [ ] User ratings and reviews
- [ ] Social features (share lists with friends)
- [ ] Email notifications for new episodes
- [ ] Download for offline (PWA)
- [ ] Multiple profiles per account
- [ ] Parental controls / content filtering
- [ ] Recommendation engine (based on watch history)
- [ ] Admin dashboard for content management
- [ ] Native mobile app (React Native / Expo)
- [ ] Multi-language / i18n support
