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
 * Extracts chapters from YouTube video description
 */
async function getYoutubeChapters(videoId: string): Promise<SkipSegment[]> {
  try {
    const tmdbKey = process.env.TMDB_API_KEY; // Reusing key for simplicity or use YT key
    const res = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${process.env.YOUTUBE_API_KEY || tmdbKey}`);
    const data = await res.json();
    const description = data.items?.[0]?.snippet?.description || '';
    
    const chapters: SkipSegment[] = [];
    const lines = description.split('\n');
    const timestampRegex = /(\d{1,2}:)?\d{1,2}:\d{2}/;

    lines.forEach((line: string) => {
      const match = line.match(timestampRegex);
      if (match) {
        const timeParts = match[0].split(':').map(Number);
        const seconds = timeParts.length === 3 
          ? timeParts[0] * 3600 + timeParts[1] * 60 + timeParts[2]
          : timeParts[0] * 60 + timeParts[1];
        
        const label = line.toLowerCase();
        if (label.includes('intro') || label.includes('opening')) {
          chapters.push({ type: 'op', startTime: seconds, endTime: seconds + 90 }); // Assume 90s if no end
        } else if (label.includes('outro') || label.includes('credits')) {
          chapters.push({ type: 'ed', startTime: seconds, endTime: seconds + 300 });
        }
      }
    });

    return chapters;
  } catch {
    return [];
  }
}

export async function getSkipSegments(tmdbId: number, mediaType: 'movie' | 'tv', season?: number, episode?: number, youtubeId?: string): Promise<SkipSegment[]> {
  if (mediaType === 'movie') {
    if (youtubeId) return await getYoutubeChapters(youtubeId);
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
