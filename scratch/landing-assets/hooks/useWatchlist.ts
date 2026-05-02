'use client';

import { useCallback, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useStore } from '@/store/useStore';
import { useAuth } from './useAuth';

export function useWatchlist() {
  const { user } = useAuth();
  const isInWatchlist       = useStore((s) => s.isInWatchlist);
  const addToWatchlist      = useStore((s) => s.addToWatchlist);
  const removeFromWatchlist = useStore((s) => s.removeFromWatchlist);

  // Sync from Supabase on login
  useEffect(() => {
    if (!user) return;

    const supabase = createClient();
    supabase
      .from('watchlist')
      .select('tmdb_id')
      .eq('user_id', user.id)
      .then(({ data }) => {
        if (data) data.forEach((row) => addToWatchlist(row.tmdb_id));
      });
  }, [user, addToWatchlist]);

  const toggle = useCallback(
    async (tmdbId: number, mediaType: 'movie' | 'tv' = 'movie') => {
      const saved = isInWatchlist(tmdbId);

      // Optimistic update
      if (saved) {
        removeFromWatchlist(tmdbId);
      } else {
        addToWatchlist(tmdbId);
      }

      // Persist to Supabase if authed
      if (user) {
        const supabase = createClient();
        if (saved) {
          await supabase
            .from('watchlist')
            .delete()
            .match({ user_id: user.id, tmdb_id: tmdbId, media_type: mediaType });
        } else {
          await supabase
            .from('watchlist')
            .upsert({ user_id: user.id, tmdb_id: tmdbId, media_type: mediaType });
        }
      }
    },
    [user, isInWatchlist, addToWatchlist, removeFromWatchlist]
  );

  return { isInWatchlist, toggle };
}
