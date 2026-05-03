import { createClient } from './supabase/server';

const API_KEY = process.env.YOUTUBE_API_KEY;
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

export interface YouTubeQuota {
  units_used: number;
  last_reset: string;
}

/**
 * Increments the YouTube API quota usage in Supabase.
 */
async function incrementQuota(units: number) {
  const supabase = await createClient();
  const today = new Date().toISOString().split('T')[0];

  const { error } = await supabase.rpc('increment_youtube_quota', { 
    p_date: today, 
    p_units: units 
  });

  if (error) {
    // If RPC fails, try a direct upsert as fallback
    await supabase
      .from('youtube_quota')
      .upsert({ date: today, units_used: units }, { onConflict: 'date' });
  }
}

/**
 * Quota-aware YouTube API fetcher.
 */
async function fetchYouTube(endpoint: string, params: Record<string, string> = {}, units = 1) {
  if (!API_KEY) {
    console.warn('YouTube API Key missing. Skipping YouTube API call.');
    return null;
  }

  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.set('key', API_KEY);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  try {
    const res = await fetch(url.toString(), {
      next: { revalidate: 86400 },
    });

    if (!res.ok) {
      const error = await res.json();
      console.error('YouTube API Error:', error);
      return null;
    }

    // Successfully fetched, increment quota
    await incrementQuota(units);

    return res.json();
  } catch (error) {
    console.error('YouTube Fetch Exception:', error);
    return null;
  }
}

/**
 * Checks if a YouTube video is still available.
 * Cost: 1 unit.
 */
export async function checkVideoAvailability(videoId: string): Promise<boolean> {
  const data = await fetchYouTube('/videos', {
    id: videoId,
    part: 'status,contentDetails',
  });

  if (!data || !data.items || data.items.length === 0) return false;

  const status = data.items[0].status;
  return status.embeddable && status.uploadStatus === 'processed' && status.privacyStatus === 'public';
}

/**
 * Fetches video details like duration and category.
 * Cost: 1 unit.
 */
export async function getVideoDetails(videoId: string) {
  const data = await fetchYouTube('/videos', {
    id: videoId,
    part: 'snippet,contentDetails',
  });

  if (!data || !data.items || data.items.length === 0) return null;

  return data.items[0];
}
