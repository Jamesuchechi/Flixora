'use server';

import { createClient } from '@/lib/supabase/server';

/**
 * Update user playback preferences (e.g., auto-skip intros)
 */
export async function updatePlaybackPreference(key: string, value: string | number | boolean | null) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Unauthorized' };

  const { error } = await supabase
    .from('user_preferences')
    .upsert({
      user_id: user.id,
      [key]: value,
      updated_at: new Date().toISOString()
    });

  return { error };
}

/**
 * Get user preferences
 */
export async function getUserPreferences() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', user.id)
    .single();

  return data;
}

/**
 * Log a "Skip" event for the learning system
 */
export async function logSkipEvent(tmdbId: number, segmentType: string) {
  const supabase = await createClient();
  
  // Increment skip count for this title/segment
  // In a real production app, this might be a complex aggregation, 
  // but for now we'll track raw events.
  await supabase.from('skip_events').insert({
    tmdb_id: tmdbId,
    type: segmentType,
    created_at: new Date().toISOString()
  });
}
