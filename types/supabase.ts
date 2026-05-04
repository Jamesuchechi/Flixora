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
          created_at: string;
        };
        Insert: {
          id: string;
          username?: string | null;
          avatar_url?: string | null;
          cover_url?: string | null;
          bio?: string | null;
          created_at?: string;
        };
        Update: {
          username?: string | null;
          avatar_url?: string | null;
          cover_url?: string | null;
          bio?: string | null;
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
