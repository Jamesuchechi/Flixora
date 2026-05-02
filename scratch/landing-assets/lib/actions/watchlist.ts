'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function getWatchlist() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from('watchlist')
    .select('*')
    .eq('user_id', user.id)
    .order('added_at', { ascending: false });

  return data ?? [];
}

export async function addToWatchlist(tmdbId: number, mediaType: 'movie' | 'tv') {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await (supabase as any)
    .from('watchlist')
    .upsert({ user_id: user.id, tmdb_id: tmdbId, media_type: mediaType });

  if (error) return { error: error.message };
  revalidatePath('/profile');
  return { success: true };
}

export async function removeFromWatchlist(tmdbId: number, mediaType: 'movie' | 'tv') {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await (supabase as any)
    .from('watchlist')
    .delete()
    .eq('user_id', user.id)
    .eq('tmdb_id', tmdbId)
    .eq('media_type', mediaType);

  if (error) return { error: error.message };
  revalidatePath('/profile');
  return { success: true };
}
