-- Phase 11: Social Layer Migration
-- This script is idempotent (can be run multiple times safely)

-- 11.1 Profiles Privacy & Customization
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS pinned_media_id INTEGER,
ADD COLUMN IF NOT EXISTS pinned_media_type TEXT CHECK (pinned_media_type IN ('movie', 'tv')),
ADD COLUMN IF NOT EXISTS favorite_genres INTEGER[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS privacy_watchlist TEXT DEFAULT 'public',
ADD COLUMN IF NOT EXISTS privacy_activity TEXT DEFAULT 'public',
ADD COLUMN IF NOT EXISTS privacy_lists TEXT DEFAULT 'public';

-- 11.2 Friends System
DO $$ BEGIN
    CREATE TYPE friendship_status AS ENUM ('pending', 'accepted', 'blocked');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.friendships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID REFERENCES auth.users NOT NULL,
  addressee_id UUID REFERENCES auth.users NOT NULL,
  status friendship_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(requester_id, addressee_id),
  CHECK (requester_id <> addressee_id)
);

ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

-- Policies (using DO blocks to prevent "already exists" errors)
DO $$ BEGIN
    CREATE POLICY "Users can view their own friendships" ON public.friendships FOR SELECT USING (auth.uid() = requester_id OR auth.uid() = addressee_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Users can send friend requests" ON public.friendships FOR INSERT WITH CHECK (auth.uid() = requester_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 11.3 Activity Feed
CREATE TABLE IF NOT EXISTS public.activity_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.activity_events ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Activity feed is viewable by friends/public" ON public.activity_events FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE IF NOT EXISTS public.activity_likes (
  activity_id UUID REFERENCES public.activity_events ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (activity_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.activity_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  activity_id UUID REFERENCES public.activity_events ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 11.4 Watch Parties
CREATE TABLE IF NOT EXISTS public.watch_parties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  host_id UUID REFERENCES auth.users NOT NULL,
  tmdb_id INTEGER NOT NULL,
  media_type TEXT CHECK (media_type IN ('movie', 'tv')) NOT NULL,
  status TEXT DEFAULT 'lobby',
  playback_timestamp FLOAT DEFAULT 0,
  is_locked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.party_participants (
  party_id UUID REFERENCES public.watch_parties ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (party_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.party_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  party_id UUID REFERENCES public.watch_parties ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 11.5 Reactions
CREATE TABLE IF NOT EXISTS public.reactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tmdb_id INTEGER NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  emoji TEXT NOT NULL,
  timestamp_seconds INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 11.6 Shared Watchlists
CREATE TABLE IF NOT EXISTS public.custom_lists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.list_items (
  list_id UUID REFERENCES public.custom_lists ON DELETE CASCADE NOT NULL,
  tmdb_id INTEGER NOT NULL,
  media_type TEXT CHECK (media_type IN ('movie', 'tv')) NOT NULL,
  added_at TIMESTAMPTZ DEFAULT now(),
  position INTEGER DEFAULT 0,
  PRIMARY KEY (list_id, tmdb_id, media_type)
);

CREATE TABLE IF NOT EXISTS public.list_collaborators (
  list_id UUID REFERENCES public.custom_lists ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  role TEXT DEFAULT 'viewer',
  PRIMARY KEY (list_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.list_item_votes (
  list_id UUID REFERENCES public.custom_lists ON DELETE CASCADE NOT NULL,
  tmdb_id INTEGER NOT NULL,
  media_type TEXT NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  vote INTEGER CHECK (vote IN (1, -1)),
  PRIMARY KEY (list_id, tmdb_id, media_type, user_id)
);

-- RLS Policies for Lists
ALTER TABLE public.custom_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.list_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.list_item_votes ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Public lists are viewable by everyone" ON public.custom_lists FOR SELECT 
    USING (is_public OR auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.list_collaborators WHERE list_id = id AND user_id = auth.uid()));
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Owners can manage their lists" ON public.custom_lists FOR ALL 
    USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Items are viewable if list is viewable" ON public.list_items FOR SELECT 
    USING (EXISTS (SELECT 1 FROM public.custom_lists WHERE id = list_id AND (is_public OR auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.list_collaborators WHERE list_id = id AND user_id = auth.uid()))));
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Owners and editors can manage items" ON public.list_items FOR ALL 
    USING (EXISTS (SELECT 1 FROM public.custom_lists WHERE id = list_id AND (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.list_collaborators WHERE list_id = id AND user_id = auth.uid() AND role = 'editor'))));
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Votes are viewable by list members" ON public.list_item_votes FOR SELECT 
    USING (EXISTS (SELECT 1 FROM public.custom_lists WHERE id = list_id AND (is_public OR auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.list_collaborators WHERE list_id = id AND user_id = auth.uid()))));
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Users can manage their own votes" ON public.list_item_votes FOR ALL 
    USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;
