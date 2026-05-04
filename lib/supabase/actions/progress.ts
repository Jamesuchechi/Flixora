'use server';

import { createClient } from '@/lib/supabase/server';
import { Database } from '@/types/supabase';

type WatchProgress = Database['public']['Tables']['watch_progress']['Row'];

/**
 * Save or update the user's progress on a movie or episode.
 */
export async function updateWatchProgress(
  tmdbId: number, 
  mediaType: 'movie' | 'tv', 
  progress: number,
  season?: number | null,
  episode?: number | null
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  // If progress is > 90%, consider it finished
  const finalProgress = progress > 90 ? 100 : progress;

  const { error } = await supabase
    .from('watch_progress')
    .upsert({
      user_id: user.id,
      tmdb_id: tmdbId,
      media_type: mediaType,
      progress: finalProgress,
      season: season ?? null,
      episode: episode ?? null,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id, tmdb_id, media_type, season, episode'
    });

  if (error) {
    console.error('Error updating progress:', error);
    return { error: error.message };
  }

  return { success: true };
}

/**
 * Fetch progress for a specific title.
 */
export async function getWatchProgress(tmdbId: number): Promise<WatchProgress | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('watch_progress')
    .select('*')
    .eq('user_id', user.id)
    .eq('tmdb_id', tmdbId)
    .single();

  if (error) return null;
  return data;
}

/**
 * Fetch all recent watch progress for the 'Continue Watching' row.
 */
export async function getAllWatchProgress(): Promise<WatchProgress[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('watch_progress')
    .select('*')
    .eq('user_id', user.id)
    .lt('progress', 100) // Only show unfinished titles
    .order('updated_at', { ascending: false })
    .limit(10);

  if (error) return [];
  return data || [];
}

/**
 * Fetch all watch progress records for Wrapped stats (includes finished titles).
 */
export async function getWrappedData(): Promise<WatchProgress[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('watch_progress')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  if (error) return [];
  return data || [];
}
