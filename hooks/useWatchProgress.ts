'use client';

import { useCallback } from 'react';
import { updateWatchProgress } from '@/lib/supabase/actions/progress';

/**
 * Hook to manage watch progress from the client (e.g., in the VideoPlayer).
 */
export function useWatchProgress() {
  /**
   * Save the current time/percentage to the database.
   * @param tmdbId The ID of the movie or show
   * @param mediaType 'movie' or 'tv'
   * @param progress Percentage watched (0-100)
   * @param season Optional season number
   * @param episode Optional episode number
   */
  const saveProgress = useCallback(async (
    tmdbId: number,
    mediaType: 'movie' | 'tv',
    progress: number,
    season?: number,
    episode?: number
  ) => {
    try {
      await updateWatchProgress(tmdbId, mediaType, progress, season, episode);
    } catch (error) {
      console.error('Failed to save watch progress:', error);
    }
  }, []);

  return { saveProgress };
}
