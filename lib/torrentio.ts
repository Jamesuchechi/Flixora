'use server';

export interface StreamTorrent {
  quality: string;
  hash: string;
  seeds: number;
  size: string;
  title: string;
  magnetUri: string;
}

const TRACKER_LIST = [
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

function buildMagnetUri(hash: string, title: string): string {
  let magnet = `magnet:?xt=urn:btih:${hash}&dn=${encodeURIComponent(title)}`;
  TRACKER_LIST.forEach(tracker => {
    magnet += `&tr=${encodeURIComponent(tracker)}`;
  });
  return magnet;
}

export async function getMediaTorrents(
  imdbId: string, 
  mediaType: 'movie' | 'tv', 
  season?: number, 
  episode?: number
): Promise<{ torrents: StreamTorrent[]; error: string | null }> {
  try {
    let url = `https://torrentio.strem.fun/stream/movie/${imdbId}.json`;
    if (mediaType === 'tv') {
      if (!season || !episode) return { torrents: [], error: 'Season or episode missing for TV show' };
      url = `https://torrentio.strem.fun/stream/series/${imdbId}:${season}:${episode}.json`;
    }

    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error(`Torrentio API Error: ${res.status}`);

    const data = await res.json();
    if (!data.streams || data.streams.length === 0) {
      return { torrents: [], error: 'No streams found' };
    }

    const parsedTorrents: StreamTorrent[] = [];

    for (const stream of data.streams) {
      if (!stream.infoHash) continue;
      
      const nameStr = stream.name || '';
      const titleStr = stream.title || '';

      let quality = 'Unknown';
      if (nameStr.includes('4k') || nameStr.includes('2160p') || titleStr.includes('2160p')) quality = '2160p';
      else if (nameStr.includes('1080p') || titleStr.includes('1080p')) quality = '1080p';
      else if (nameStr.includes('720p') || titleStr.includes('720p')) quality = '720p';
      else if (nameStr.includes('480p') || titleStr.includes('480p')) quality = '480p';

      const seedMatch = titleStr.match(/👤\s*(\d+)/);
      const seeds = seedMatch ? parseInt(seedMatch[1], 10) : 0;

      const sizeMatch = titleStr.match(/💾\s*([\d.]+\s*[A-Z]+)/);
      const size = sizeMatch ? sizeMatch[1] : 'Unknown size';

      const safeTitle = titleStr.split('\n')[0] || stream.infoHash;

      parsedTorrents.push({
        quality,
        hash: stream.infoHash,
        seeds,
        size,
        title: safeTitle,
        magnetUri: buildMagnetUri(stream.infoHash, safeTitle)
      });
    }

    // Filter out 0 seeds and sort by quality and seeds
    const qualityRank: Record<string, number> = { '2160p': 4, '1080p': 3, '720p': 2, '480p': 1, 'Unknown': 0 };
    
    const validTorrents = parsedTorrents
      .filter(t => t.seeds > 0)
      .sort((a, b) => {
        const qA = qualityRank[a.quality] || 0;
        const qB = qualityRank[b.quality] || 0;
        if (qA !== qB) return qB - qA;
        return b.seeds - a.seeds;
      });

    // Group by quality and take the best seeded one per quality to keep the list clean
    const uniqueByQuality = new Map<string, StreamTorrent>();
    for (const t of validTorrents) {
      if (!uniqueByQuality.has(t.quality)) {
        uniqueByQuality.set(t.quality, t);
      }
    }

    return { torrents: Array.from(uniqueByQuality.values()), error: null };
  } catch (error) {
    console.error('Torrentio Fetch Error:', error);
    return { torrents: [], error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
