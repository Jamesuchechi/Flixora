export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string | null;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          username?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          username?: string | null;
          avatar_url?: string | null;
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
    };
  };
}

export type Profile       = Database['public']['Tables']['profiles']['Row'];
export type WatchlistItem = Database['public']['Tables']['watchlist']['Row'];
export type WatchProgress = Database['public']['Tables']['watch_progress']['Row'];
