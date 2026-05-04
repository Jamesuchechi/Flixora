# Flixora Database Schema Extensions

## Phase 9 — YouTube Integration

### Free Films Library
Table for cataloging legitimately free films on YouTube.

```sql
create table public.free_films (
  id          uuid default gen_random_uuid() primary key,
  tmdb_id     integer not null,
  media_type  text check (media_type in ('movie', 'tv')) not null,
  youtube_id  text not null,
  source      text, -- e.g. 'Paramount Vault', 'Public Domain'
  verified_at timestamptz default now(),
  region      text default 'ALL',
  unique(tmdb_id, media_type)
);

-- RLS
alter table public.free_films enable row level security;

create policy "Free films are viewable by everyone"
  on public.free_films for select using (true);

-- Indexes
create index idx_free_films_tmdb_id on public.free_films(tmdb_id);

### YouTube Quota Tracking
Table for tracking daily YouTube API usage.

```sql
create table public.youtube_quota (
  id          uuid default gen_random_uuid() primary key,
  units_used  integer default 0,
  date        date unique default current_date
);

-- RLS
alter table public.youtube_quota enable row level security;

create policy "Admins can manage quota"
  on public.youtube_quota for all using (auth.jwt() ->> 'role' = 'admin');

create policy "Quota is viewable by everyone"
  on public.youtube_quota for select using (true);

-- RPC for incrementing quota
create or replace function increment_youtube_quota(p_date date, p_units integer)
returns void as $$
begin
  insert into public.youtube_quota (date, units_used)
  values (p_date, p_units)
  on conflict (date)
  do update set units_used = youtube_quota.units_used + p_units;
end;
$$ language plpgsql;
```
```

### Trailer Cache
Optimization to store trailer keys and reduce TMDB API calls.

```sql
create table public.trailer_cache (
  id          uuid default gen_random_uuid() primary key,
  tmdb_id     integer not null,
  media_type  text not null,
  videos      jsonb not null,
  updated_at  timestamptz default now(),
  unique(tmdb_id, media_type)
);

-- RLS
alter table public.trailer_cache enable row level security;

create policy "Trailer cache is viewable by everyone"
  on public.trailer_cache for select using (true);
```

### Phase 11 — Social Layer

```sql
-- 11.1 User Profiles (Public) Extensions
alter table public.profiles 
add column if not exists pinned_media_id integer,
add column if not exists pinned_media_type text check (pinned_media_type in ('movie', 'tv')),
add column if not exists favorite_genres integer[] default '{}',
add column if not exists privacy_watchlist text default 'public', -- 'public', 'friends', 'private'
add column if not exists privacy_activity text default 'public',
add column if not exists privacy_lists text default 'public';

-- 11.2 Friends & Following System
do $$ begin
    create type friendship_status as enum ('pending', 'accepted', 'blocked');
exception
    when duplicate_object then null;
end $$;

create table if not exists public.friendships (
  id uuid default gen_random_uuid() primary key,
  requester_id uuid references auth.users not null,
  addressee_id uuid references auth.users not null,
  status friendship_status default 'pending',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(requester_id, addressee_id),
  check (requester_id <> addressee_id)
);

alter table public.friendships enable row level security;

do $$ begin
    create policy "Users can view their own friendships"
      on public.friendships for select
      using (auth.uid() = requester_id or auth.uid() = addressee_id);
exception when duplicate_object then null; end $$;

do $$ begin
    create policy "Users can send friend requests"
      on public.friendships for insert
      with check (auth.uid() = requester_id);
exception when duplicate_object then null; end $$;

-- 11.3 Activity Feed
create table if not exists public.activity_events (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  type text not null, -- 'watched', 'rated', 'added_to_list', etc.
  payload jsonb not null default '{}',
  created_at timestamptz default now()
);

alter table public.activity_events enable row level security;

do $$ begin
    create policy "Activity feed is viewable by friends/public"
      on public.activity_events for select
      using (true);
exception when duplicate_object then null; end $$;

create table if not exists public.activity_likes (
  activity_id uuid references public.activity_events on delete cascade not null,
  user_id uuid references auth.users not null,
  created_at timestamptz default now(),
  primary key (activity_id, user_id)
);

create table if not exists public.activity_comments (
  id uuid default gen_random_uuid() primary key,
  activity_id uuid references public.activity_events on delete cascade not null,
  user_id uuid references auth.users not null,
  content text not null,
  created_at timestamptz default now()
);

-- 11.4 Watch Parties
create table if not exists public.watch_parties (
  id uuid default gen_random_uuid() primary key,
  host_id uuid references auth.users not null,
  tmdb_id integer not null,
  media_type text check (media_type in ('movie', 'tv')) not null,
  status text default 'lobby', -- 'lobby', 'playing', 'ended'
  playback_timestamp float default 0,
  created_at timestamptz default now()
);

create table if not exists public.party_participants (
  party_id uuid references public.watch_parties on delete cascade not null,
  user_id uuid references auth.users not null,
  joined_at timestamptz default now(),
  primary key (party_id, user_id)
);

create table if not exists public.party_messages (
  id uuid default gen_random_uuid() primary key,
  party_id uuid references public.watch_parties on delete cascade not null,
  user_id uuid references auth.users, -- null for system messages
  content text not null,
  created_at timestamptz default now()
);

-- 11.5 Reactions
create table if not exists public.reactions (
  id uuid default gen_random_uuid() primary key,
  tmdb_id integer not null,
  user_id uuid references auth.users not null,
  emoji text not null,
  timestamp_seconds integer not null,
  created_at timestamptz default now()
);

-- 11.6 Shared Watchlists
create table if not exists public.custom_lists (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  description text,
  is_public boolean default true,
  created_at timestamptz default now()
);

create table if not exists public.list_items (
  list_id uuid references public.custom_lists on delete cascade not null,
  tmdb_id integer not null,
  media_type text check (media_type in ('movie', 'tv')) not null,
  added_at timestamptz default now(),
  position integer default 0,
  primary key (list_id, tmdb_id, media_type)
);

create table if not exists public.list_collaborators (
  list_id uuid references public.custom_lists on delete cascade not null,
  user_id uuid references auth.users not null,
  role text default 'viewer', -- 'owner', 'editor', 'viewer'
  primary key (list_id, user_id)
);
```
