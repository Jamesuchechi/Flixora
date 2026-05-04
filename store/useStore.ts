import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WatchProgress {
  tmdbId: number;
  mediaType: 'movie' | 'tv';
  progress: number;
  season?: number;
  episode?: number;
  updatedAt: string;
}

export interface UserPreferences {
  autoplay: boolean;
  notifications: boolean;
  quality: string;
  compactMode: boolean;
  accentColor: string;
  soundEffects: boolean;
}

interface AIInsights {
  expectations: string;
  pitch: string;
  vibes: string[];
  tmdb_id?: number;
  generated_at?: string;
}

interface FlixoraStore {
  // Search overlay
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;

  // Genre filter (home page tabs)
  activeGenre: string;
  setActiveGenre: (genre: string) => void;

  // Local watchlist (synced with Supabase when authed)
  watchlist: number[];
  addToWatchlist: (id: number) => void;
  removeFromWatchlist: (id: number) => void;
  syncWatchlist: (ids: number[]) => void;
  isInWatchlist: (id: number) => boolean;

  // AI Insights Cache
  aiCache: Record<number, AIInsights>;
  setAiCache: (tmdbId: number, insights: AIInsights) => void;

  // Watch progress (local cache)
  progressMap: Record<string, WatchProgress>;
  setProgress: (data: WatchProgress) => void;
  getProgress: (tmdbId: number, mediaType: 'movie' | 'tv') => WatchProgress | undefined;

  // User Preferences
  preferences: UserPreferences;
  setPreference: <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => void;
  setAllPreferences: (prefs: Partial<UserPreferences>) => void;

  // Notifications
  unreadNotifications: number;
  setUnreadNotifications: (count: number) => void;
}

export const useStore = create<FlixoraStore>()(
  persist(
    (set, get) => ({
      // Preferences
      preferences: {
        autoplay: true,
        notifications: true,
        quality: '4k',
        compactMode: false,
        accentColor: '#8b5cf6',
        soundEffects: false,
      },
      setPreference: (key, value) =>
        set((s) => ({
          preferences: { ...s.preferences, [key]: value },
        })),
      setAllPreferences: (prefs) =>
        set((s) => ({
          preferences: { ...s.preferences, ...prefs },
        })),

      // Search
      searchOpen: false,
      setSearchOpen: (open) => set({ searchOpen: open }),

      // Genre
      activeGenre: 'All',
      setActiveGenre: (genre) => set({ activeGenre: genre }),

      // Watchlist
      watchlist: [],
      addToWatchlist: (id) =>
        set((s) => ({ watchlist: s.watchlist.includes(id) ? s.watchlist : [...s.watchlist, id] })),
      removeFromWatchlist: (id) =>
        set((s) => ({ watchlist: s.watchlist.filter((w) => w !== id) })),
      syncWatchlist: (ids) => set({ watchlist: ids }),
      isInWatchlist: (id) => get().watchlist.includes(id),

      // AI Cache
      aiCache: {},
      setAiCache: (tmdbId, insights) =>
        set((s) => ({
          aiCache: { ...s.aiCache, [tmdbId]: insights },
        })),

      // Progress
      progressMap: {},
      setProgress: (data) =>
        set((s) => ({
          progressMap: {
            ...s.progressMap,
            [`${data.mediaType}-${data.tmdbId}`]: data,
          },
        })),
      getProgress: (tmdbId, mediaType) =>
        get().progressMap[`${mediaType}-${tmdbId}`],

      // Notifications
      unreadNotifications: 0,
      setUnreadNotifications: (count) => set({ unreadNotifications: count }),
    }),
    { name: 'flixora-store' }
  )
);
