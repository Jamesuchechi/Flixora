'use server';

import { createClient } from '@/lib/supabase/server';

/**
 * Gets a cached trailer key from Supabase.
 */
export async function getCachedTrailer(tmdbId: number, mediaType: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('trailer_cache')
    .select('trailer_key')
    .eq('tmdb_id', tmdbId)
    .eq('media_type', mediaType)
    .single();

  if (error || !data) return null;
  return data.trailer_key;
}

/**
 * Saves a trailer key to the Supabase cache.
 */
export async function cacheTrailer(tmdbId: number, mediaType: string, trailerKey: string) {
  const supabase = await createClient();
  await supabase
    .from('trailer_cache')
    .upsert({
      tmdb_id: tmdbId,
      media_type: mediaType,
      trailer_key: trailerKey,
      created_at: new Date().toISOString(),
    }, {
      onConflict: 'tmdb_id, media_type'
    });
}
