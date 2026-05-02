-- ─────────────────────────────────────────────────────────────────────────────
-- Flixora — Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Profiles (extends auth.users)
create table if not exists public.profiles (
  id          uuid references auth.users on delete cascade primary key,
  username    text unique,
  avatar_url  text,
  created_at  timestamptz default now() not null
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, username, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. Watchlist
create table if not exists public.watchlist (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references public.profiles(id) on delete cascade not null,
  tmdb_id     integer not null,
  media_type  text check (media_type in ('movie', 'tv')) not null,
  added_at    timestamptz default now() not null,
  unique(user_id, tmdb_id, media_type)
);

-- 3. Watch progress
create table if not exists public.watch_progress (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references public.profiles(id) on delete cascade not null,
  tmdb_id     integer not null,
  media_type  text not null,
  season      integer,
  episode     integer,
  progress    numeric(5,2) default 0 not null,  -- 0–100 percent
  updated_at  timestamptz default now() not null,
  unique(user_id, tmdb_id, media_type, season, episode)
);

-- ─── Row Level Security ───────────────────────────────────────────────────────
alter table public.profiles       enable row level security;
alter table public.watchlist      enable row level security;
alter table public.watch_progress enable row level security;

-- Profiles: users can read all, only update their own
create policy "Profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

-- Watchlist: fully private per user
create policy "Users manage own watchlist"
  on public.watchlist for all using (auth.uid() = user_id);

-- Watch progress: fully private per user
create policy "Users manage own watch progress"
  on public.watch_progress for all using (auth.uid() = user_id);

-- ─── Indexes ─────────────────────────────────────────────────────────────────
create index if not exists watchlist_user_id_idx      on public.watchlist(user_id);
create index if not exists watchlist_tmdb_id_idx      on public.watchlist(tmdb_id);
create index if not exists watch_progress_user_id_idx on public.watch_progress(user_id);
create index if not exists watch_progress_tmdb_id_idx on public.watch_progress(tmdb_id);
