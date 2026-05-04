export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string | null;
          avatar_url: string | null;
          cover_url: string | null;
          bio: string | null;
          pinned_media_id: number | null;
          pinned_media_type: 'movie' | 'tv' | null;
          favorite_genres: number[];
          privacy_watchlist: 'public' | 'friends' | 'private';
          privacy_activity: 'public' | 'friends' | 'private';
          privacy_lists: 'public' | 'friends' | 'private';
          created_at: string;
        };
        Insert: {
          id: string;
          username?: string | null;
          avatar_url?: string | null;
          cover_url?: string | null;
          bio?: string | null;
          pinned_media_id?: number | null;
          pinned_media_type?: 'movie' | 'tv' | null;
          favorite_genres?: number[];
          privacy_watchlist?: 'public' | 'friends' | 'private';
          privacy_activity?: 'public' | 'friends' | 'private';
          privacy_lists?: 'public' | 'friends' | 'private';
          created_at?: string;
        };
        Update: {
          username?: string | null;
          avatar_url?: string | null;
          cover_url?: string | null;
          bio?: string | null;
          pinned_media_id?: number | null;
          pinned_media_type?: 'movie' | 'tv' | null;
          favorite_genres?: number[];
          privacy_watchlist?: 'public' | 'friends' | 'private';
          privacy_activity?: 'public' | 'friends' | 'private';
          privacy_lists?: 'public' | 'friends' | 'private';
        };
      };
      friendships: {
        Row: {
          id: string;
          requester_id: string;
          addressee_id: string;
          status: 'pending' | 'accepted' | 'blocked';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          requester_id: string;
          addressee_id: string;
          status?: 'pending' | 'accepted' | 'blocked';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          status?: 'pending' | 'accepted' | 'blocked';
          updated_at?: string;
        };
      };
      activity_events: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          payload: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          payload?: Json;
          created_at?: string;
        };
        Update: never;
      };
      activity_likes: {
        Row: {
          activity_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          activity_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: never;
      };
      activity_comments: {
        Row: {
          id: string;
          activity_id: string;
          user_id: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          activity_id: string;
          user_id: string;
          content: string;
          created_at?: string;
        };
        Update: {
          content?: string;
        };
      };
      watch_parties: {
        Row: {
          id: string;
          host_id: string;
          tmdb_id: number;
          media_type: 'movie' | 'tv';
          status: string;
          playback_timestamp: number;
          is_locked: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          host_id: string;
          tmdb_id: number;
          media_type: 'movie' | 'tv';
          status?: string;
          playback_timestamp?: number;
          is_locked?: boolean;
          created_at?: string;
        };
        Update: {
          status?: string;
          playback_timestamp?: number;
          is_locked?: boolean;
        };
      };
      party_participants: {
        Row: {
          party_id: string;
          user_id: string;
          joined_at: string;
        };
        Insert: {
          party_id: string;
          user_id: string;
          joined_at?: string;
        };
        Update: never;
      };
      party_messages: {
        Row: {
          id: string;
          party_id: string;
          user_id: string | null;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          party_id: string;
          user_id?: string | null;
          content: string;
          created_at?: string;
        };
        Update: never;
      };
      reactions: {
        Row: {
          id: string;
          tmdb_id: number;
          user_id: string;
          emoji: string;
          timestamp_seconds: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          tmdb_id: number;
          user_id: string;
          emoji: string;
          timestamp_seconds: number;
          created_at?: string;
        };
        Update: never;
      };
      custom_lists: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          is_public: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          is_public?: boolean;
          created_at?: string;
        };
        Update: {
          name?: string;
          description?: string | null;
          is_public?: boolean;
        };
      };
      list_items: {
        Row: {
          list_id: string;
          tmdb_id: number;
          media_type: 'movie' | 'tv';
          added_at: string;
          position: number;
        };
        Insert: {
          list_id: string;
          tmdb_id: number;
          media_type: 'movie' | 'tv';
          added_at?: string;
          position?: number;
        };
        Update: {
          position?: number;
        };
      };
      list_collaborators: {
        Row: {
          list_id: string;
          user_id: string;
          role: string;
        };
        Insert: {
          list_id: string;
          user_id: string;
          role?: string;
        };
        Update: {
          role?: string;
        };
      };
      watchlist: {
        Row: {
          id: string;
          user_id: string;
          tmdb_id: number;
          media_type: 'movie' | 'tv';
          added_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          tmdb_id: number;
          media_type: 'movie' | 'tv';
          added_at?: string;
        };
        Update: never;
      };
      watch_progress: {
        Row: {
          id: string;
          user_id: string;
          tmdb_id: number;
          media_type: 'movie' | 'tv';
          season: number | null;
          episode: number | null;
          progress: number;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          tmdb_id: number;
          media_type: 'movie' | 'tv';
          season?: number | null;
          episode?: number | null;
          progress?: number;
          updated_at?: string;
        };
        Update: {
          progress?: number;
          season?: number | null;
          episode?: number | null;
          updated_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: 'release' | 'watchlist' | 'system' | 'social';
          title: string;
          content: string;
          is_read: boolean;
          created_at: string;
          link: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: 'release' | 'watchlist' | 'system' | 'social';
          title: string;
          content: string;
          is_read?: boolean;
          created_at?: string;
          link?: string | null;
        };
        Update: {
          is_read?: boolean;
        };
      };
      ai_metadata: {
        Row: {
          tmdb_id: number;
          expectations: string;
          pitch: string;
          vibes: string[];
          generated_at: string;
        };
        Insert: {
          tmdb_id: number;
          expectations: string;
          pitch: string;
          vibes: string[];
          generated_at?: string;
        };
        Update: {
          expectations?: string;
          pitch?: string;
          vibes?: string[];
          generated_at?: string;
        };
      };
      user_preferences: {
        Row: {
          user_id: string;
          autoplay: boolean;
          notifications: boolean;
          quality: string;
          compact_mode: boolean;
          accent_color: string;
          sound_effects: boolean;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          autoplay?: boolean;
          notifications?: boolean;
          quality?: string;
          compact_mode?: boolean;
          accent_color?: string;
          sound_effects?: boolean;
          updated_at?: string;
        };
        Update: {
          autoplay?: boolean;
          notifications?: boolean;
          quality?: string;
          compact_mode?: boolean;
          accent_color?: string;
          sound_effects?: boolean;
          updated_at?: string;
        };
      };
      skip_events: {
        Row: {
          id: string;
          tmdb_id: number;
          type: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          tmdb_id: number;
          type: string;
          created_at?: string;
        };
        Update: never;
      };
      trailer_cache: {
        Row: {
          tmdb_id: number;
          media_type: string;
          trailer_key: string;
          created_at: string;
        };
        Insert: {
          tmdb_id: number;
          media_type: string;
          trailer_key: string;
          created_at?: string;
        };
        Update: {
          trailer_key?: string;
        };
      };
      free_films: {
        Row: {
          id: string;
          tmdb_id: number;
          title: string;
          youtube_id: string;
          quality: string | null;
          language: string | null;
          genre_id: string | null;
          media_type: 'movie' | 'tv';
          poster_path: string | null;
          added_at: string;
        };
        Insert: {
          id?: string;
          tmdb_id: number;
          title: string;
          youtube_id: string;
          quality?: string | null;
          language?: string | null;
          genre_id?: string | null;
          media_type: 'movie' | 'tv';
          poster_path?: string | null;
          added_at?: string;
        };
        Update: {
          title?: string;
          youtube_id?: string;
          quality?: string | null;
          language?: string | null;
          genre_id?: string | null;
          poster_path?: string | null;
        };
      };
    };
  };
}

export type Profile        = Database['public']['Tables']['profiles']['Row'];
export type WatchlistItem  = Database['public']['Tables']['watchlist']['Row'];
export type WatchProgress  = Database['public']['Tables']['watch_progress']['Row'];
export type Notification   = Database['public']['Tables']['notifications']['Row'];
export type AIMetadata     = Database['public']['Tables']['ai_metadata']['Row'];
export type UserPreference = Database['public']['Tables']['user_preferences']['Row'];
export type TrailerCache   = Database['public']['Tables']['trailer_cache']['Row'];
export type FreeFilm       = Database['public']['Tables']['free_films']['Row'];
export type Friendship     = Database['public']['Tables']['friendships']['Row'];
export type ActivityEvent  = Database['public']['Tables']['activity_events']['Row'];
export type WatchParty     = Database['public']['Tables']['watch_parties']['Row'];
export type PartyParticipant = Database['public']['Tables']['party_participants']['Row'];
export type PartyMessage   = Database['public']['Tables']['party_messages']['Row'];
export type Reaction       = Database['public']['Tables']['reactions']['Row'];
export type CustomList     = Database['public']['Tables']['custom_lists']['Row'];
export type ListItem       = Database['public']['Tables']['list_items']['Row'];
export type ListCollaborator = Database['public']['Tables']['list_collaborators']['Row'];
