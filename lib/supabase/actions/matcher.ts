'use server';

import { cacheTrailer } from './trailers';

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

/**
 * AI Matcher: Searches YouTube for a full version of a movie.
 * Returns the videoId if a high-confidence match is found.
 */
export async function findFullMovieOnYouTube(tmdbId: number, title: string, year: string, mediaType: 'movie' | 'tv' = 'movie') {
  if (!YOUTUBE_API_KEY) return null;
  if (mediaType === 'tv') return null; // Full TV series are rarely single videos on YouTube

  try {
    const query = encodeURIComponent(`${title} ${year} full movie`);
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&type=video&maxResults=5&key=${YOUTUBE_API_KEY}`;
    
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();

    if (!searchData.items || searchData.items.length === 0) return null;
    interface YouTubeSearchItem {
      id: { videoId: string };
    }

    // Get durations for these videos to filter out trailers
    const videoIds = (searchData.items as YouTubeSearchItem[]).map((i) => i.id.videoId).join(',');
    const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,status&id=${videoIds}&key=${YOUTUBE_API_KEY}`;
    
    const detailsRes = await fetch(detailsUrl);
    const detailsData = await detailsRes.json();

    for (const video of detailsData.items) {
      const duration = video.contentDetails.duration; // ISO 8601 format (e.g., PT1H32M)
      
      // Basic check: Must be longer than 50 minutes (PT50M, PT1H, etc)
      const isLongEnough = duration.includes('H') || (duration.includes('M') && parseInt(duration.match(/PT(\d+)M/)?.[1] || '0') > 50);
      
      // Compliance check: Must allow embedding
      const isEmbeddable = video.status.embeddable;

      if (isLongEnough && isEmbeddable) {
        // Cache this as a full movie match
        await cacheTrailer(tmdbId, mediaType, video.id);
        return video.id;
      }
    }

    return null;
  } catch (error) {
    console.error('AI Matcher Error:', error);
    return null;
  }
}
