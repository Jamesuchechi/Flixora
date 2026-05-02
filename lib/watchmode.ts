const API_KEY = process.env.WATCHMODE_API_KEY || '';
const BASE_URL = 'https://api.watchmode.com/v1';

export interface WatchmodeSource {
  source_id: number;
  name: string;
  type: string; // 'sub', 'buy', 'rent', 'free'
  region: string;
  ios_url: string;
  android_url: string;
  web_url: string;
  format: string; // 'HD', 'SD', '4K'
  price: number | null;
}

/**
 * Fetch streaming sources from Watchmode using an IMDb ID.
 */
export async function getStreamingSources(imdbId: string): Promise<WatchmodeSource[]> {
  if (!API_KEY || !imdbId) return [];

  try {
    // Step 1: Map IMDb ID to Watchmode ID
    const searchUrl = new URL(`${BASE_URL}/search/`);
    searchUrl.searchParams.set('apiKey', API_KEY);
    searchUrl.searchParams.set('search_field', 'imdb_id');
    searchUrl.searchParams.set('search_value', imdbId);

    const searchRes = await fetch(searchUrl.toString(), {
       next: { revalidate: 86400 } // 24 hours
    });

    if (!searchRes.ok) return [];
    const searchData = (await searchRes.json()) as {
      title_results?: { id: number }[];
    };
    
    // Extract the first matching title ID
    const watchmodeId = searchData.title_results?.[0]?.id;
    if (!watchmodeId) return [];

    // Step 2: Get Sources for that Watchmode ID
    const sourcesUrl = new URL(`${BASE_URL}/title/${watchmodeId}/sources/`);
    sourcesUrl.searchParams.set('apiKey', API_KEY);

    const sourcesRes = await fetch(sourcesUrl.toString(), {
       next: { revalidate: 86400 }
    });

    if (!sourcesRes.ok) return [];
    const sourcesData = await sourcesRes.json();

    return sourcesData as WatchmodeSource[];
  } catch (error) {
    console.error('Watchmode Fetch Error:', error);
    return [];
  }
}
