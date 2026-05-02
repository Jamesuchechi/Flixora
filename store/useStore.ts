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
  isInWatchlist: (id: number) => boolean;

  // Watch progress (local cache)
  progressMap: Record<string, WatchProgress>;
  setProgress: (data: WatchProgress) => void;
  getProgress: (tmdbId: number, mediaType: 'movie' | 'tv') => WatchProgress | undefined;
}

export const useStore = create<FlixoraStore>()(
  persist(
    (set, get) => ({
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
      isInWatchlist: (id) => get().watchlist.includes(id),

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
    }),
    { name: 'flixora-store' }
  )
);
