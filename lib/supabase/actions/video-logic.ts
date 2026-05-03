'use server';

import { getCachedTrailer, cacheTrailer } from './trailers';
import { getBestTrailer } from '@/lib/video';

const TMDB_BASE_URL = process.env.TMDB_BASE_URL ?? 'https://api.themoviedb.org/3';
const TMDB_API_KEY = process.env.TMDB_API_KEY ?? '';

/**
 * Robustly fetches a trailer key, prioritizing the Supabase cache.
 * If not cached, fetches from TMDB and updates the cache.
 */
export async function getTrailerWithCache(id: number, mediaType: 'movie' | 'tv') {
  try {
    // 1. Check Supabase Cache first
    const cachedKey = await getCachedTrailer(id, mediaType);
    if (cachedKey) {
      return cachedKey;
    }

    // 2. Fallback to TMDB API
    const url = `${TMDB_BASE_URL}/${mediaType}/${id}/videos?api_key=${TMDB_API_KEY}`;
    const res = await fetch(url, { next: { revalidate: 86400 } });
    
    if (!res.ok) return null;
    
    const data = await res.json();
    const best = getBestTrailer(data.results || []);

    if (best) {
      // 3. Update cache for next time (Fire and forget)
      cacheTrailer(id, mediaType, best.key).catch(console.error);
      return best.key;
    }

    return null;
  } catch (error) {
    console.error('Error in getTrailerWithCache:', error);
    return null;
  }
}
