'use server';

import { createClient } from '@/lib/supabase/server';

export async function getProgress(tmdbId: number, mediaType: 'movie' | 'tv') {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('watch_progress')
    .select('*')
    .eq('user_id', user.id)
    .eq('tmdb_id', tmdbId)
    .eq('media_type', mediaType)
    .single();

  return data;
}

export async function getAllProgress() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from('watch_progress')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })
    .limit(20);

  return data ?? [];
}

export async function upsertProgress(
  tmdbId: number,
  mediaType: 'movie' | 'tv',
  progress: number,
  season?: number,
  episode?: number
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await (supabase as any)
    .from('watch_progress')
    .upsert(
      {
        user_id:    user.id,
        tmdb_id:    tmdbId,
        media_type: mediaType,
        progress,
        season:     season ?? null,
        episode:    episode ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,tmdb_id,media_type,season,episode' }
    );

  if (error) return { error: error.message };
  return { success: true };
}
