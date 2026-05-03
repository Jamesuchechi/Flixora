'use server';

import { parseVibeSearch } from '@/lib/ai/groq';
import { tmdb } from '@/lib/tmdb';

/**
 * Perform an AI-powered "Vibe Search"
 */
export async function getVibeResults(query: string) {
  try {
    const filters = await parseVibeSearch(query);
    if (!filters) return { results: [] };

    // Use TMDB discover with the AI-mapped filters
    const results = await tmdb.discover.movies({
      with_genres: filters.with_genres || '',
      without_genres: filters.without_genres || '',
      sort_by: filters.sort_by || 'popularity.desc',
      'vote_average.gte': String(filters.vote_average_gte || 0),
      with_keywords: filters.with_keywords || '',
    });

    return results;
  } catch (error) {
    console.error('Vibe Search Error:', error);
    return { results: [] };
  }
}
