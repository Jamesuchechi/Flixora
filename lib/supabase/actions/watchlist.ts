'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { Database } from '@/types/supabase';

type WatchlistItem = Database['public']['Tables']['watchlist']['Row'];

/**
 * Fetch the user's entire watchlist.
 */
export async function getWatchlist(): Promise<WatchlistItem[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('watchlist')
    .select('*')
    .eq('user_id', user.id)
    .order('added_at', { ascending: false });

  if (error) {
    console.error('Error fetching watchlist:', error);
    return [];
  }

  return data || [];
}

/**
 * Toggle an item in the watchlist (Add if missing, Remove if present).
 */
export async function toggleWatchlist(tmdbId: number, mediaType: 'movie' | 'tv') {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  // Check if it exists
  const { data: existing } = await supabase
    .from('watchlist')
    .select('id')
    .eq('user_id', user.id)
    .eq('tmdb_id', tmdbId)
    .single();

  if (existing) {
    // Remove
    const { error } = await supabase
      .from('watchlist')
      .delete()
      .eq('id', existing.id);
    
    if (error) return { error: error.message };
  } else {
    // Add
    const { error } = await supabase
      .from('watchlist')
      .insert({
        user_id: user.id,
        tmdb_id: tmdbId,
        media_type: mediaType,
      });

    if (error) return { error: error.message };
  }

  revalidatePath('/profile');
  revalidatePath(`/movies/${tmdbId}`);
  revalidatePath(`/series/${tmdbId}`);
  return { success: true };
}

/**
 * Check if a specific title is in the user's watchlist.
 */
export async function isInWatchlist(tmdbId: number): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from('watchlist')
    .select('id')
    .eq('user_id', user.id)
    .eq('tmdb_id', tmdbId)
    .single();

  return !!data;
}
