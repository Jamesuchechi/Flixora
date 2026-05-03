import { createClient } from '../server';

export interface FreeFilm {
  id: string;
  tmdb_id: number;
  media_type: 'movie' | 'tv';
  youtube_id: string;
  title: string;
  poster_path?: string;
  source?: string;
  region?: string;
}

/**
 * Fetches all free films from Supabase.
 */
export async function getFreeFilms() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('free_films')
    .select('*')
    .order('added_at', { ascending: false });

  if (error) {
    console.error('Error fetching free films:', error);
    return [];
  }

  return data as FreeFilm[];
}

/**
 * Checks if a specific title is free.
 */
export async function isFreeFilm(tmdbId: number, mediaType: 'movie' | 'tv') {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('free_films')
    .select('youtube_id')
    .eq('tmdb_id', tmdbId)
    .eq('media_type', mediaType)
    .single();

  if (error || !data) return null;
  return data.youtube_id;
}
