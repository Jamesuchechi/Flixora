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
| 10    | Launch                    | ✅ Completed   |

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
- [x] Build `ContinueWatching` row (thumbnail, progress bar, episode badge) — static for now
- [x] Build `FeaturedCard` (wide card for series, hover play overlay)
- [x] Build `GenreTabs` (interactive filter tabs, client component)
- [x] Build `TopBar` (live stats strip below hero)
- [x] Assemble home page `app/(main)/page.tsx` with all rows
- [x] Add ISR revalidation (`export const revalidate = 3600`)
- [x] Add `<Suspense>` wrappers with skeleton fallbacks for each row

### Browse Pages

- [x] Build `/movies` page with paginated grid
- [x] Build `/series` page with paginated grid
- [x] Add genre filter sidebar / tabs to browse pages
- [x] Add sort options (trending, top rated, newest, A–Z)
- [x] Implement infinite scroll or pagination controls

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
- [x] Write `middleware.ts` to protect `/watch` and `/profile` routes
- [x] Auto-create profile row on new user sign-up (Supabase trigger or API route)

### Auth UI

- [x] Build `/login` page (email + password form, Google OAuth button)
- [x] Build `/signup` page (email, password, username)
- [x] Build `AuthForm` reusable component
- [x] Add loading and error states to auth forms
- [x] Handle OAuth callback in `app/auth/callback/route.ts`
- [x] Update `Navbar` to show user avatar / name when logged in
- [x] Add logout button to profile dropdown

---

## Phase 5 — Watchlist & Progress Tracking

> Goal: users can save titles and resume watching.

### Watchlist

- [x] Implement watchlist logic via Server Actions (add, remove, check)
- [x] Wire `Add to Watchlist` button on MovieCard and detail pages
- [x] Replaced API routes with direct Server Actions for better performance
- [x] Build `/profile` page with watchlist grid
- [x] Add optimistic UI updates for watchlist toggles (instant feedback)

### Watch Progress

- [x] Build `useWatchProgress` hook (get, set progress in Supabase)
- [x] Track progress in VideoPlayer periodically
- [x] Populate `ContinueWatching` row from real Supabase data
- [x] Show resume position on movie/episode detail pages
- [x] Mark episodes as "watched" when progress > 90%

### Zustand Store

- [x] Set up `store/useStore.ts` with Zustand
- [x] Hydrate local watchlist from Supabase on login
- [x] Sync watchlist actions between store and Supabase

---

## Phase 6 — Watch Page & Video Player

> Goal: users can watch content with a polished player.

- [x] Build `/watch/[id]` page layout (full-screen player, back button, metadata sidebar)
- [x] Integrate **Plyr.js** as the video player (`VideoPlayer` component)
- [x] Support YouTube embed (for trailers and demo)
- [x] Support HLS streams (for actual video via `hls.js` + Plyr)
- [x] Implement keyboard shortcuts (space = play/pause, arrow keys = seek, F = fullscreen)
- [x] Auto-advance to next episode for series
- [x] Show "Next Episode" card 20 seconds before end
- [x] Save and restore playback position from Supabase
- [x] Handle auth gate (redirect to login if not authenticated)

---

## Phase 7 — Search

> Goal: fast, real-time search across movies and series.

- [x] Build `SearchOverlay` component (modal, full-screen on mobile)
- [x] Implement `Cmd+K` / `Ctrl+K` keyboard shortcut to open search
- [x] Add search trigger to Navbar
- [x] Build `useSearch` hook with 300ms debounce
- [x] Call TMDB `/search/multi` endpoint as user types
- [x] Display results grouped by type (Movies, Series)
- [x] Show poster thumbnails, rating, year in results
- [x] Highlight matching text in results
- [x] Handle empty state and no-results state
- [x] Build `/search?q=` page for shareable search URLs
- [x] Add recent searches stored in localStorage

---

## Phase 8 — Polish & Performance

> Goal: production-quality UX and Core Web Vitals in the green.

### Animations

- [x] Add page transition animations (fade/slide between routes)
- [x] Animate hero aurora orbs (subtle float keyframes)
- [x] Add scroll-triggered fade-in for rows below the fold
- [x] Smooth hover transitions on all interactive elements
- [x] Animate watchlist button (heart fill/unfill)

### Performance

- [x] Audit and fix LCP (hero image must load fast — use `priority` on HeroBanner image)
- [x] Implement `<Suspense>` streaming for all data-heavy sections
- [x] Lazy load `VideoPlayer` and `SearchOverlay` (dynamic imports)
- [x] Add `blur` placeholder to all `next/image` components
- [x] Enable Vercel Edge caching for TMDB proxy routes
- [x] Audit bundle size with `@next/bundle-analyzer`
- [x] Implement `router.prefetch()` on MovieCard hover

### Accessibility

- [x] Full keyboard navigation (tab order, focus rings)
- [x] ARIA labels on icon-only buttons (search, close, play)
- [x] `alt` text on all images
- [x] Respect `prefers-reduced-motion` for animations

### Mobile Responsiveness

- [x] Responsive Navbar (hamburger menu on mobile)
- [x] Single-column card grid on small screens
- [x] Full-screen search overlay on mobile
- [x] Touch-friendly swipe for horizontal rows
- [x] Bottom navigation bar on mobile

### SEO

- [x] Dynamic `generateMetadata` on movie/series detail pages (title, description, OG image)
- [x] Sitemap generation (`app/sitemap.ts`)
- [x] `robots.txt`
- [x] Structured data (JSON-LD) for movie pages

---

## Phase 9 — YouTube Integration

### Free Films + Trailer Library + Smart Embedding

> Goal: Give Flixora real, playable video content using YouTube as the video backend.
> TMDB already returns YouTube keys — this extends that into a full playback system.

---

### 9.1 Trailer System (No Quota Risk)

- [x] Audit existing TMDB video key integration in Phase 3 — ensure trailer keys are cached
- [x] Build `TrailerPlayer` component using YouTube iframe API (replaces placeholder modal)
- [x] Auto-select best trailer: Official > Trailer > Teaser > Clip priority order
- [x] Add multiple trailer support — "Teaser", "Official Trailer", "Final Trailer" tabs
- [x] Implement trailer autoplay on movie detail page hero (muted, on scroll-into-view)
- [x] Add trailer thumbnail preview on MovieCard hover (200ms delay before play)
- [x] Build `TrailerGallery` component — grid of all videos for a title
- [x] Store trailer keys in Supabase cache table to reduce TMDB API calls
- [x] Handle region-locked trailers gracefully (fallback to next available)

### 9.2 Free Full Films Library

- [x] Research and catalog legitimately free films on YouTube
  - [x] Studio-uploaded classics (Warner Archive, Sony Pictures, Paramount Vault)
  - [x] Public domain films (pre-1928, >30,000 titles)
  - [x] A24 free uploads, Mubi free screenings, Criterion Channel previews
  - [x] Documentary channels (DW, Al Jazeera, Vice, National Geographic)
- [x] Create `free_films` Supabase table: `{ tmdb_id, youtube_id, source, verified_at, region }`
- [x] Build admin curation tool for adding/verifying free film links
- [x] Build `FreeFilmsRow` component for home page — "Watch Free Now" section
- [x] Add "Free" badge variant to MovieCard when a free YouTube source exists
- [x] Build `/free` browse page — filterable by genre, decade, runtime
- [x] Implement link health checker (weekly cron) — detect removed/private videos
- [x] Auto-fallback: if YouTube link dies, remove badge and hide from free section

### 9.3 YouTube Player Integration

- [x] Install and configure `react-youtube` or YouTube iframe API directly
- [x] Build `YouTubePlayer` component with Flixora UI overlay (controls, branding)
- [x] Implement custom controls over YouTube embed (play/pause, seek, volume, fullscreen)
- [x] Sync YouTube player progress with Supabase `watch_progress` table every 10s
- [x] Handle YouTube API quota gracefully — fallback messaging if limit hit
- [x] Add `?t=` timestamp support — deep link to specific timecodes
- [x] Picture-in-Picture support for YouTube player (Phase 15 full implementation)
- [x] Build unified `<VideoPlayer>` that switches between Plyr (HLS) and YouTube sources

### 9.4 YouTube Data API (Selective Use)

- [x] Set up YouTube Data API v3 project in Google Cloud Console
- [x] Store API key in env — `YOUTUBE_API_KEY`
- [x] Implement quota-aware client with daily usage tracking stored in Supabase
- [x] Use API only for: channel verification, video availability check, duration fetch
- [x] Never use API for search (costs 100 units — use TMDB instead)
- [x] Build quota dashboard in admin panel showing daily usage vs 10K limit
- [x] Implement Redis/Upstash cache for all YouTube API responses (24hr TTL)
- [x] Alert system: notify admin when quota reaches 80% usage

### 9.5 Content Compliance & Safety

- [x] ToS compliance audit — document what is and isn't permitted
- [x] Only embed videos the rights holder has made publicly available
- [x] Add DMCA takedown flow — remove films within 24hr of valid notice
- [x] Legal page: explain YouTube embedding policy and fair use basis
- [x] Region detection — hide content not available in user's country
- [x] Add content reporting button on all YouTube-sourced films

---

## Phase 10 — AI Features

### Mood Recommendations · Scene Q&A · Smart Skip · Conversational Discovery

> Goal: Make Flixora feel like it has a brilliant film-obsessed friend inside it.
> Use Groq API (via Anthropic) as the AI backbone.

---

### 10.0 "What Should I Watch?" — Conversational AI

- [x] Design conversational flow: mood → context → constraints → recommendation
- [x] Build `WatchAdvisor` component — floating chat bubble on home page
- [x] Connect to Groq API via `/api/ai/advisor` route
- [x] System prompt engineering: train Groq on Flixora's catalog context
- [x] Multi-turn conversation support — remember previous messages in session
- [x] Groq returns structured JSON: `{ tmdb_id, title, reason, mood_match, trailer_key }`
- [x] Render recommendation as a rich card with poster, reasoning, and direct play button
- [x] Add "Not quite" button — Groq refines based on rejection feedback
- [x] Session persistence — save advisor conversations to Supabase per user
- [x] Build conversation history UI — "Past recommendations" in profile
- [x] Rate limiting: 10 AI queries/day on Free plan, unlimited on Pro
- [x] Streaming responses — use Groq's streaming API for real-time text output

## Phase 10 — Intelligence & Stealth Engine

### 10.1 SmartGuard Ad Shield (Stealth Player)
- [x] Build `SmartGuard` overlay component for non-YouTube players
- [x] Implement `Invisible Shield` logic to catch pop-up triggers during playback
- [x] Implement `Pause-State Reveal` to allow legitimate provider ads for compliance
- [x] Add `sandbox` attribute optimizations to `VideoPlayer` iframes
- [x] Implement "Smart Redirect Recovery" — auto-reloads if a malicious redirect breaks the session

### 10.2 AI YouTube Matcher (Universal Engine)
- [x] Build server action to search YouTube for "Full Movie" candidates for any TMDB ID
- [x] Implement "Confidence Scoring": Length > 60m, Official Channel check, Title match
- [x] Cache successful matches in `trailer_cache` with a `is_full_movie` flag
- [x] Auto-fallback: If YouTube match confidence < 80%, use standard provider with SmartGuard

### 10.3 Scene Q&A — "What Just Happened?"
- [x] Build `SceneAssistant` component — slide-out panel during playback
- [x] Triggered by keyboard shortcut (`?`) or button in player controls
- [x] Context injection: pass current movie/series + timestamp + episode to Groq
- [x] Pre-built question templates: "Who is this character?", "What did I miss?", "Explain this scene"
- [x] Free-form question input with send button
- [x] Groq answers with: character context, plot recap, thematic meaning
- [x] Spoiler mode toggle — "Don't tell me what happens next"
- [x] Cache common Q&A pairs per title to reduce API costs

### 10.4 AI Advisor & Content Enrichment
- [x] Set up `lib/ai/groq.ts` client with rate-limiting and retry logic
- [x] Content Advisor: "Why should I watch this?" (Personalized pitch based on user history)
- [x] Generate mood tags automatically: "melancholic", "feel-good", "mind-bending"
- [x] "Vibe search" — type a feeling, AI maps it to a genre+mood combination
- [x] Store AI-generated metadata in `ai_metadata` Supabase table

### 10.5 Smart Skip Detection

- [x] Research open-source intro/credits detection (AniSkip API for anime, custom for others)
- [x] Integrate AniSkip API for anime series — returns exact timestamps for intros/outros
- [x] For non-anime: use YouTube chapter markers (where available) as skip boundaries
- [x] Build `SkipPrompt` component — appears at detected skip point ("Skip Intro?")
- [x] User can dismiss, skip, or set preference ("Always skip intros for this show")
- [x] Store skip preferences in `user_preferences` Supabase table
- [x] Build skip learning system — if 80%+ of users skip a segment, auto-suggest for all

### 10.6 AI-Generated Descriptions & Mood Tags

- [x] For titles with short/missing TMDB descriptions, use Groq to generate enriched synopsis
- [x] Generate mood tags automatically: "melancholic", "edge-of-your-seat", "feel-good", "mind-bending"
- [x] Store AI-generated metadata in `ai_metadata` Supabase table — never overwrite TMDB data
- [x] Build mood tag filter on browse pages (alongside genre)
- [x] "Vibe search" — type a feeling, AI maps it to a genre+mood combination and queries TMDB

### 10.7 AI Trailer Analysis

- [x] On trailer watch: Groq analyzes title, genre, cast from TMDB and generates 3-line "what to expect"
- [x] Show alongside trailer: "If you liked X, you'll love this because..."
- [x] Tone indicator: Action level, emotional depth, pace (fast/slow), darkness (light/dark)
- [x] Pre-generate for top 1000 titles and cache — don't run live

---

## Phase 11 — Social Layer

### Watch Parties · Friends · Activity Feed · Shared Lists

> Goal: Make watching Flixora a shared experience — drive viral growth through social features.

---

### 11.1 User Profiles (Public)

- [x] Public profile page: `/u/[username]`
- [x] Profile shows: avatar, bio, favorite genres, recently watched (if public), lists
- [x] Privacy settings: public / friends only / private per section
- [x] Profile customization: banner image, accent color, pinned film
- [x] Username uniqueness enforcement (already in DB schema — enforce in UI)
- [x] Avatar upload with Supabase Storage — crop tool, size limit 2MB
- [x] Profile badges: "Early Member", "Cinephile" (500+ films), "Binge Watcher" (10+ eps/day)

### 11.2 Friends & Following System

- [x] `friendships` Supabase table: `{ requester_id, addressee_id, status, created_at }`
- [x] Send friend request — notification to recipient
- [x] Accept / decline / block flow
- [x] "Follow" mode (asymmetric) for public profiles
- [x] Friends list page with search
- [x] "People you may know" — based on shared watchlist overlap (>3 titles in common)
- [x] Friend count shown on profile
- [x] Block list management in settings

### 11.3 Activity Feed

- [x] `activity_events` Supabase table: `{ user_id, type, payload, created_at }`
- [x] Event types: `watched`, `rated`, `added_to_list`, `created_list`, `joined_watch_party`
- [x] Real-time feed using Supabase Realtime subscriptions
- [x] Feed filtering: All / Friends / Following
- [x] "X just finished [Film] · ★ 8/10" cards with poster thumbnail
- [x] Like reaction on activity items (heart)
- [x] Comment on activity items (up to 280 chars)
- [x] Spoiler-safe mode: blur ratings until you've watched the title yourself
- [x] Notification bell: new activity from friends triggers notification

- [x] **Watch Parties (Real-time Social)**:
    - [x] `watch_parties` Supabase table
    - [x] `party_participants` Supabase table
    - [x] `party_messages` Supabase table
- [x] **Real-time Synced Playback**:
    - [x] Host controls: Play/Pause/Seek events broadcast
    - [x] Auto-sync: Late joiners automatically seek
    - [x] Buffer handling: "Waiting for others..." overlay
- [x] **Social Chat Sidebar**:
    - [x] Real-time messaging with `framer-motion`
    - [x] System messages: "User X joined", "Host paused"
    - [x] Emoji reactions & quick-replies
- [x] **Lobby & Invites**:
    - [x] "Start Watch Party" button on detail pages
    - [x] Unique shareable link: `/party/[id]`
    - [x] Invite modal: Search friends and send notifications
- [x] **Party UI**:
    - [x] Minimized "Participant Strip"
    - [x] One-click "Sync with Host" button
    - [x] "End Party" vs "Leave Party" logic

### 11.5 Virtual Cinema Rooms (Phase 12 Preview)
- [x] Emoji reaction overlay on player: tap emoji → floats up over video for all members
- [x] Host controls panel: kick member, transfer host, lock party (invite-only)
- [x] Party size limits: Free = 3 members, Pro = 10, Family = 20
- [x] End party screen: group rating prompt, share what you watched

### 11.5 Reaction Timeline

- [x] During playback, user can tap emoji reactions (😂 😱 😭 🔥 💀)
- [x] Reactions stored with timestamp: `{ tmdb_id, user_id, emoji, timestamp_seconds }`
- [x] After watching: see a reaction heatmap on the scrubber timeline
- [x] "Most reacted moments" section on movie detail page
- [x] Aggregate reactions from all users — crowd-sourced emotional map
- [x] Toggle: "Show friends' reactions" / "Show all reactions" / "Hide reactions"

- [x] **Shared Watchlists & Lists**:
    - [x] Collaborative lists: invite friends to co-edit a list
    - [x] List roles: Owner, Editor, Viewer (foundation ready)
    - [x] Real-time list updates via Supabase Realtime
    - [x] List voting: members can upvote/downvote titles in a shared list
    - [x] "Watch order" feature: drag-and-drop to plan viewing sequence
    - [x] Share list publicly — generate a `/list/[slug]` (ID used) public URL
    - [x] List discovery: browse community lists ("Best Horror of the 2010s", "A24 Ranked")
    - [x] Fork a list: copy someone's list as a starting point

---

## Phase 12 — Personalization Engine

### Taste Profile · % Match · Director Following · Viewing DNA

> Goal: Make every user feel like Flixora was built specifically for them.

---

### 12.1 Taste Profile — Onboarding

- [ ] Post-signup onboarding flow: rate 10 curated films (visual card swipe UI)
- [ ] 5-star rating system with half-stars — stored in `ratings` Supabase table
- [ ] Skip option for films not seen — "Haven't watched this"
- [ ] Genre preference selection: pick top 5 genres
- [ ] Era preference: which decades do you love?
- [ ] Language preference: subtitles, dubbed, or original language preference
- [ ] Taste profile stored as JSON vector in `user_preferences` table
- [ ] Re-take taste quiz anytime from profile settings
- [ ] Profile completeness indicator — more data = better recommendations

### 12.2 % Match Score

- [ ] Algorithm: weight genre match (40%) + rating correlation (30%) + director/actor overlap (20%) + era preference (10%)
- [ ] Display on every MovieCard for logged-in users: "94% Match"
- [ ] Color coding: green (>85%), yellow (70–85%), neutral (<70%)
- [ ] "Why this match?" tooltip — explains top 3 reasons for the score
- [ ] % Match shown prominently on movie detail page hero
- [ ] Filter browse pages by match score: "Show only 80%+ matches"
- [ ] Improve match accuracy as user rates more films (Bayesian update)

### 12.3 Director & Actor Following

- [ ] Follow any director, actor, or writer from their filmography page
- [ ] `/people/[id]` page: full filmography, bio from TMDB, "Follow" button
- [ ] `followed_people` Supabase table: `{ user_id, tmdb_person_id, type, followed_at }`
- [ ] Notification when a followed person has new content added to Flixora
- [ ] "From Directors You Follow" row on home page
- [ ] "Starring Actors You Follow" row on home page
- [ ] Following count shown on person page
- [ ] Unfollow with single click

### 12.4 Viewing DNA Dashboard

- [ ] `/profile/dna` page — visual statistics experience
- [ ] Total hours watched (with fun comparisons: "That's X flights to Tokyo")
- [ ] Genre breakdown: animated donut chart
- [ ] Decades heatmap: how much from each era
- [ ] Top 5 directors watched (by total runtime)
- [ ] Top 5 actors appeared in (by title count)
- [ ] Viewing streak calendar (GitHub contribution graph style)
- [ ] Average rating given vs global average (are you a harsh or generous rater?)
- [ ] Country of origin map — world map colored by films from each country
- [ ] Most-watched day of week / time of day
- [ ] "Your cinema twin" — find the user whose taste is most similar to yours
- [ ] Shareable DNA card — generate a beautiful image to post on social media
- [ ] Annual "Flixora Wrapped" — year-end summary (inspired by Spotify Wrapped)

### 12.5 Smart Home Page Personalization

- [ ] Replace static "Popular Movies" row with "Picked for You" — personalized ranking
- [ ] "Because you watched X" rows — dynamic, based on recent viewing
- [ ] "New from Directors You Follow" row — auto-populated
- [ ] "Finish watching" row — titles >10% but <90% watched
- [ ] "Your unstarted watchlist" — oldest saved items you haven't watched
- [ ] Home page layout adapts to viewing habits: night owl? show darker films late at night

---

## Phase 13 — Discovery Features

### Rabbit Hole · One Degree From · Decade Browser · Double Feature

> Goal: Make finding something to watch feel like an adventure, not a chore.

---

### 13.1 The Rabbit Hole

- [ ] On any movie/series detail page: "Start a Rabbit Hole" button
- [ ] Algorithm builds a chain of 5 connected films
  - Connection types: same director → same actor → same genre → same era → same country
  - Each link shown with the specific connection ("Both photographed by Roger Deakins")
- [ ] Visual chain UI: horizontal connected cards with animated link lines between them
- [ ] User can regenerate any link in the chain
- [ ] "Go deeper" — extend the chain to 10 films
- [ ] Save a rabbit hole as a watchlist
- [ ] Share a rabbit hole: `/rabbit-hole/[id]` public URL
- [ ] Curated staff rabbit holes: "The Coen Brothers rabbit hole", "Neon-drenched cinema"

### 13.2 One Degree From

- [ ] Connection graph: start from a film, see everything connected to it
- [ ] Connection layers: cast, crew, cinematographer, composer, writer, producer
- [ ] Visual force-directed graph (D3.js) — interactive, zoomable
- [ ] Filter by connection type
- [ ] Highlight path between two films: "How are these two films connected?"
- [ ] "Six degrees" mode — find connection chain between any two films
- [ ] Export connection graph as shareable image

### 13.3 Decade Browser

- [ ] `/browse/[decade]` — e.g. `/browse/1970s`
- [ ] Era-accurate UI aesthetic per decade (film grain for 70s, VHS for 80s, etc.)
- [ ] Curated context: what was happening in cinema that decade
- [ ] Top films of the decade (by Flixora user rating)
- [ ] Hidden gems: high-rated but low-vote-count films from that era
- [ ] Decade comparison slider: put two decades side by side

### 13.4 Country Cinema Explorer

- [ ] `/browse/country/[code]` — e.g. `/browse/country/kr` (South Korea)
- [ ] Interactive world map — click a country to explore its cinema
- [ ] Cultural context: brief description of the country's film tradition
- [ ] Notable directors and movements per country
- [ ] "Cinema passport" — track how many countries' films you've watched (gamification)
- [ ] Awards filter: Palme d'Or, Academy Award for International Film, etc.

### 13.5 Double Feature Suggester

- [ ] "Double Feature" button on every movie detail page
- [ ] Algorithm picks a perfect pairing — thematic, tonal, or contrasting
- [ ] Shows why they pair: "Both explore grief through magical realism"
- [ ] Create a double feature night: adds both to a temporary "Tonight's Films" list
- [ ] Community double features: upvote the best pairings
- [ ] "Triple bill" mode — extend to 3 films for a full cinema night

### 13.6 Advanced Search & Filters

- [ ] Filter by: decade, country, language, runtime, mood, award winner, streaming source
- [ ] Sort by: match score, release date, runtime, rating, popularity, alphabetical
- [ ] Boolean search: "Sci-Fi AND (Ridley Scott OR Denis Villeneuve)"
- [ ] "Exclude" filter: hide films with certain tags (e.g. exclude horror)
- [ ] Save a filter set as a named "Channel" — your personal genre station
- [ ] Similar-to filter: "Find films similar to [title]"

---

## Phase 14 — Cinephile Tools

### Film Diary · Collections · Stats · Comparison · Community Lists

> Goal: Give serious film lovers the tools they've always wanted — built right into Flixora.

---

### 14.1 Personal Film Diary

- [ ] `/diary` page — chronological log of everything watched
- [ ] Each entry: film poster, date watched, personal rating, notes (up to 500 chars)
- [ ] Rewatches supported — each viewing is a separate diary entry
- [ ] Diary is private by default — optionally make public
- [ ] Filter diary by year, genre, rating, rewatches
- [ ] Export diary as CSV or Letterboxd-compatible format
- [ ] Import from Letterboxd — parse CSV and bulk-import ratings/diary entries
- [ ] Calendar view — see what you watched on any given day
- [ ] "This day in your cinema history" — home page widget showing what you watched 1/2/3 years ago

### 14.2 5-Star Rating System

- [ ] Half-star support (0.5 increments, 0–5 scale)
- [ ] Rating stored in `ratings` Supabase table: `{ user_id, tmdb_id, rating, created_at }`
- [ ] Rating UI: tap-to-rate stars on movie detail page and after watching
- [ ] Aggregate Flixora community rating shown alongside TMDB rating
- [ ] "Your rating vs Community" comparison shown on detail page
- [ ] Rating history — see how your taste evolved over time
- [ ] Distribution chart — see breakdown of all your ratings (how many 5-stars given, etc.)

### 14.3 Lists & Collections

- [ ] Create unlimited custom lists (Free: 3 lists, Pro: unlimited)
- [ ] List types: Ranked, Unranked, Watchlist, Diary-linked
- [ ] Cover image: auto-generated from first 4 films (quad poster) or custom
- [ ] Rich list description with markdown support
- [ ] Publish list publicly — `/lists/[username]/[slug]`
- [ ] List discovery page: `/browse/lists` — sort by likes, new, trending
- [ ] Featured community lists curated by Flixora editorial team
- [ ] "Clone this list" — fork any public list to your account
- [ ] List completion tracker: "You've seen 14/20 films on this list"

### 14.4 Film Comparison Mode

- [ ] Side-by-side comparison of any two films
- [ ] Compare: rating, runtime, budget, revenue, cast overlap, crew overlap, genre
- [ ] "Which should I watch first?" — AI gives a recommendation with reasoning
- [ ] "Battle" mode — community votes on which film is better
- [ ] Historical battles archive — see all-time results ("The Godfather vs Goodfellas: 67% voted Godfather")

### 14.5 Watch Statistics Dashboard

- [ ] `/profile/stats` — full statistics hub
- [ ] Total films / series / episodes watched (lifetime)
- [ ] Total hours watched (with fun equivalents)
- [ ] Longest single-session watch record
- [ ] Most-watched genre, director, actor, country, decade, language
- [ ] Rating distribution (bar chart)
- [ ] Viewing by time of day heatmap
- [ ] Completion rate: % of started films finished
- [ ] Series completion: how many series fully finished vs abandoned
- [ ] Monthly/yearly trends: chart of viewing volume over time
- [ ] Achievements/badges unlocked (see 14.6)

### 14.6 Achievements & Gamification

- [ ] Achievement system stored in `achievements` Supabase table
- [ ] Achievement tiers: Bronze, Silver, Gold, Platinum
- [ ] Sample achievements:
  - [ ] "First Watch" — watch your first film on Flixora
  - [ ] "Century" — watch 100 films
  - [ ] "Director's Cut" — watch 10 films by the same director
  - [ ] "Globe Trotter" — watch films from 20 different countries
  - [ ] "Night Owl" — start watching after midnight 10 times
  - [ ] "Series Finisher" — complete an entire TV series
  - [ ] "Speed Runner" — watch 3 films in one day
  - [ ] "Critic" — rate 50+ films
  - [ ] "Time Traveler" — watch films from 5 different decades
  - [ ] "Flixora Original" — watch 5 Flixora-curated films
- [ ] Achievement notification toast when unlocked
- [ ] Achievement showcase on public profile (choose which to display)

---

## Phase 15 — Technical Excellence

### PiP · Chromecast · Offline · Accessibility · Performance · Native Apps

> Goal: Make Flixora the most technically polished streaming experience ever built.

---

### 15.1 Picture-in-Picture

- [ ] Native browser PiP API integration in VideoPlayer
- [ ] Custom PiP controls: play/pause, close, return-to-tab
- [ ] PiP persists when switching between Flixora pages
- [ ] Mini info overlay in PiP window: title, episode info
- [ ] PiP mode automatically activates when switching browser tabs (opt-in setting)
- [ ] PiP position memory — remembers last position on screen

### 15.2 Chromecast & AirPlay

- [ ] Google Cast SDK integration — cast to Chromecast and Android TV
- [ ] AirPlay support via native browser API (iOS/macOS Safari)
- [ ] Cast control UI in player: cast button in controls bar
- [ ] While casting: phone becomes remote control (play/pause, volume, seek)
- [ ] Cast session persistence — casting continues if you close the browser tab
- [ ] Queue management while casting

### 15.3 Progressive Web App (PWA)

- [ ] Full PWA manifest: name, icons, theme color, display mode
- [ ] Service worker: cache app shell and static assets
- [ ] Offline browse mode: view cached movie details without internet
- [ ] Download for offline (Pro feature): queue episodes for offline playback
- [ ] Download manager UI: progress, storage usage, delete downloads
- [ ] Downloaded content encryption: prevent file extraction
- [ ] Download expiry: 30-day license on downloaded content
- [ ] iOS "Add to Home Screen" prompt at right moment
- [ ] Android install prompt with native install dialog

### 15.4 Accessibility (WCAG 2.1 AA)

- [ ] Full keyboard navigation for all interactive elements
- [ ] Focus management: focus trap in modals, restore focus on close
- [ ] ARIA labels on all icon buttons, dynamic regions
- [ ] Skip-to-main-content link at top of every page
- [ ] High contrast mode toggle (stored in preferences)
- [ ] Font size scaling: S / M / L / XL options
- [ ] Reduced motion mode: disable all animations
- [ ] Screen reader testing: VoiceOver (macOS/iOS) + NVDA (Windows)
- [ ] Subtitles/captions: load from TMDB subtitle sources
- [ ] Subtitle customization: font size, color, background, position
- [ ] Audio description track support where available
- [ ] Color blind modes: Deuteranopia, Protanopia, Tritanopia filters

### 15.5 Performance & Infrastructure

- [ ] Move to Vercel Edge Functions for all API routes — sub-50ms response
- [ ] Implement Redis (Upstash) caching layer for TMDB + YouTube responses
- [ ] Database query optimization: add indexes on all foreign keys and filter columns
- [ ] Image CDN: all TMDB images served through Vercel's image optimization
- [ ] Core Web Vitals targets: LCP < 1.2s, FID < 50ms, CLS < 0.05
- [ ] Lighthouse score targets: Performance 95+, Accessibility 100, Best Practices 100
- [ ] Bundle analysis: keep JS bundle under 200KB first load
- [ ] Streaming SSR: use React Suspense for all data-dependent sections
- [ ] Error boundary on every major section — graceful degradation
- [ ] Sentry integration: error tracking, performance monitoring, session replay
- [ ] Uptime monitoring: Betterstack or Checkly — alert on any downtime
- [ ] Load testing: simulate 10K concurrent users before launch
- [ ] Database connection pooling via Supabase PgBouncer

### 15.6 Admin Dashboard

- [ ] `/admin` — protected by admin role in Supabase
- [ ] User management: view, search, ban, restore accounts
- [ ] Content management: add/remove free YouTube film links
- [ ] Analytics overview: DAU, MAU, watch time, most popular titles
- [ ] API quota monitoring: TMDB + YouTube usage vs limits
- [ ] Moderation queue: reported content, flagged comments
- [ ] Feature flags: enable/disable features per user segment
- [ ] A/B test management: run experiments on UI variations
- [ ] Revenue dashboard (when payments are integrated)

---

## Bonus Phase — Monetization & Growth

### When Flixora is ready to scale commercially

- [ ] Stripe integration — subscription billing (Free/Pro/Family)
- [ ] Annual plan discount (20% off)
- [ ] Gift subscriptions: buy Pro for a friend
- [ ] Referral program: give 1 month free, get 1 month free
- [ ] Student discount verification (via SheerID)
- [ ] Corporate/team plans for film schools and cinemas
- [ ] Affiliate program for film critics and YouTubers
- [ ] API access tier: let developers build on Flixora's data
- [ ] Merchandise store: Flixora-branded cinema gear

---

## Engineering Principles (Apply to All Phases)

- **No feature ships without tests** — unit + integration + E2E
- **No feature ships without mobile view** — test on real devices
- **No feature ships without accessibility audit** — axe-core on every new component
- **Database migrations are versioned** — never edit existing migrations
- **All AI calls are rate-limited, logged, and cost-tracked**
- **All user data is deletable** — GDPR right to erasure on every table
- **Feature flags for everything** — ability to roll back any feature instantly
- **Documentation updated before PR is merged**

---

## Phase 16 — Testing & QA

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

## Phase 17 — Launch

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
- [x] Integrate OMDb API for IMDb/Rotten Tomatoes ratings
- [ ] Integrate Watchmode API for streaming availability
- [ ] Add cast and crew sections to movie pages
- [ ] Parental controls / content filtering
- [ ] Recommendation engine (based on watch history)
- [ ] Admin dashboard for content management
- [ ] Native mobile app (React Native / Expo)
- [ ] Multi-language / i18n support
