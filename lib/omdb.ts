const API_KEY = process.env.OMDB_API_KEY || '';
const BASE_URL = 'https://www.omdbapi.com';

export interface OMDBData {
  Ratings?: { Source: string; Value: string }[];
  imdbRating?: string;
  Metascore?: string;
  Response: string;
  Error?: string;
}

/**
 * Fetch detailed ratings and extra metadata from OMDb using an IMDb ID.
 */
export async function getOMDBData(imdbId: string): Promise<OMDBData | null> {
  if (!API_KEY || !imdbId) return null;

  try {
    const url = new URL(BASE_URL);
    url.searchParams.set('apikey', API_KEY);
    url.searchParams.set('i', imdbId);

    const res = await fetch(url.toString(), {
      next: { revalidate: 86400 }, // Cache for 24 hours
    });

    if (!res.ok) return null;

    const data = await res.json();
    if (data.Response === 'False') return null;

    return data as OMDBData;
  } catch (error) {
    console.error('OMDb Fetch Error:', error);
    return null;
  }
}

/**
 * Extract a specific rating source (e.g., "Rotten Tomatoes")
 */
export function getSourceRating(data: OMDBData | null, source: string): string | null {
  if (!data?.Ratings) return null;
  const rating = data.Ratings.find((r) => r.Source === source);
  return rating ? rating.Value : null;
}
