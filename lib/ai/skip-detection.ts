import { tmdb } from '@/lib/tmdb';
import type { TMDBExternalIds } from '@/types/tmdb';

/**
 * Skip Detection Logic
 * Currently supports AniSkip for Anime and YouTube Chapters for some titles.
 */

export interface SkipSegment {
  type: 'op' | 'ed' | 'recap' | 'mixed-recap' | 'mixed-op' | 'mixed-ed';
  startTime: number;
  endTime: number;
}

/**
 * Extracts chapters from YouTube video description.
 * This is now a safe stub on the client to prevent 400 errors.
 */
async function getYoutubeChapters(): Promise<SkipSegment[]>{
  
  return [];
}

export async function getSkipSegments(tmdbId: number, mediaType: 'movie' | 'tv', season?: number, episode?: number, youtubeId?: string): Promise<SkipSegment[]> {
  if (mediaType === 'movie') {
    if (youtubeId) return await getYoutubeChapters();
    return [];
  }
  
  if (!episode) return [];

  try {
    // 1. Get External IDs from TMDB to find the MyAnimeList (MAL) ID via our secure proxy
    const externalIds = await tmdb.tv.externalIds(tmdbId, { silent: true }).catch(() => null);
    const malId = (externalIds as TMDBExternalIds | null)?.mal_id;

    if (!malId) return [];

    // 2. Fetch real skip times from AniSkip API
    // Endpoint: https://api.ani-skip.com/v1/skip-times/:malId/:episodeNumber
    const aniSkipUrl = `https://api.ani-skip.com/v1/skip-times/${malId}/${episode}?types[]=op&types[]=ed`;
    const aniSkipRes = await fetch(aniSkipUrl);
    
    if (!aniSkipRes.ok) return [];

    const aniSkipData = await aniSkipRes.json();

    if (!aniSkipData.found || !aniSkipData.results) return [];

    interface AniSkipResult {
      skipType: string;
      interval: {
        startTime: number;
        endTime: number;
      };
    }

    // 3. Map AniSkip results to our SkipSegment interface
    return aniSkipData.results.map((res: AniSkipResult) => ({
      type: res.skipType === 'op' ? 'op' : 'ed',
      startTime: res.interval.startTime,
      endTime: res.interval.endTime
    }));

  } catch (error) {
    console.error('AniSkip Integration Error:', error);
    return [];
  }
}
