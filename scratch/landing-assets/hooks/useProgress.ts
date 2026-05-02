'use client';

import { useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useStore } from '@/store/useStore';
import { useAuth } from './useAuth';

interface ProgressData {
  tmdbId:    number;
  mediaType: 'movie' | 'tv';
  progress:  number;
  season?:   number;
  episode?:  number;
}

export function useProgress() {
  const { user }      = useAuth();
  const setProgress   = useStore((s) => s.setProgress);
  const getProgress   = useStore((s) => s.getProgress);

  const save = useCallback(
    async (data: ProgressData) => {
      // Always update local cache
      setProgress({ ...data, updatedAt: new Date().toISOString() });

      // Persist to Supabase if authed
      if (user) {
        const supabase = createClient();
        await supabase.from('watch_progress').upsert({
          user_id:    user.id,
          tmdb_id:    data.tmdbId,
          media_type: data.mediaType,
          season:     data.season   ?? null,
          episode:    data.episode  ?? null,
          progress:   data.progress,
          updated_at: new Date().toISOString(),
        });
      }
    },
    [user, setProgress]
  );

  const get = useCallback(
    (tmdbId: number, mediaType: 'movie' | 'tv') => getProgress(tmdbId, mediaType),
    [getProgress]
  );

  return { save, get };
}
