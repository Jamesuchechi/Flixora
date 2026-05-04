'use server';

/**
 * YTS API client for fetching torrent metadata by IMDb ID.
 * This executes on the server to avoid CORS issues.
 */

const YTS_BASE = 'https://yts.mx/api/v2';

export interface YTSTorrent {
  quality: '720p' | '1080p' | '2160p' | '3D';
  type: 'web' | 'bluray';
  hash: string;
  seeds: number;
  peers: number;
  size: string;
  date_uploaded: string;
}

export interface YTSMovie {
  id: number;
  imdb_code: string;
  title: string;
  year: number;
  rating: number;
  runtime: number;
  torrents: YTSTorrent[];
}

export const TRACKER_LIST = [
  'udp://open.demonii.com:1337/announce',
  'udp://tracker.openbittorrent.com:80',
  'udp://tracker.coppersurfer.tk:6969',
  'udp://glotorrents.pw:6969/announce',
  'udp://tracker.opentrackr.org:1337/announce',
  'udp://torrent.gresille.org:80/announce',
  'udp://p4p.arenabg.com:1337',
  'udp://tracker.leechers-paradise.org:6969',
  'udp://tracker.internetwarriors.net:1337/announce',
  'udp://exodus.desync.com:6969/announce'
];

/**
 * Constructs a magnet URI from a hash and title.
 */
export function buildMagnetUri(hash: string, title: string): string {
  let magnet = `magnet:?xt=urn:btih:${hash}&dn=${encodeURIComponent(title)}`;
  TRACKER_LIST.forEach(tracker => {
    magnet += `&tr=${encodeURIComponent(tracker)}`;
  });
  return magnet;
}

/**
 * Fetches movie torrents from YTS by IMDb ID.
 */
export async function getMovieTorrents(imdbId: string): Promise<{
  movie: YTSMovie | null;
  torrents: (YTSTorrent & { magnetUri: string })[];
  error: string | null;
}> {
  try {
    const url = `${YTS_BASE}/list_movies.json?query_term=${imdbId}&limit=1`;
    const res = await fetch(url);
    
    if (!res.ok) throw new Error(`YTS API Error: ${res.status}`);
    
    const data = await res.json();
    const movie = data.data.movies?.[0] as YTSMovie | undefined;

    if (!movie || movie.imdb_code !== imdbId) {
      return { movie: null, torrents: [], error: 'Not found in YTS' };
    }

    const torrents = (movie.torrents || [])
      .filter(t => t.seeds > 0)
      .map(t => ({
        ...t,
        magnetUri: buildMagnetUri(t.hash, movie.title)
      }))
      .sort((a, b) => {
        const qMap = { '2160p': 3, '1080p': 2, '720p': 1, '3D': 0 };
        const qA = qMap[a.quality as keyof typeof qMap] || 0;
        const qB = qMap[b.quality as keyof typeof qMap] || 0;
        return qB - qA;
      });

    return { movie, torrents, error: null };
  } catch (error) {
    console.error('YTS Fetch Error:', error);
    return { movie: null, torrents: [], error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
