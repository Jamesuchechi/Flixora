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
