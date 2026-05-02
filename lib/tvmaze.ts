const BASE_URL = 'https://api.tvmaze.com';

export interface TVMazeShow {
  id: number;
  url: string;
  name: string;
  type: string;
  status: string;
  premiered: string;
  officialSite: string;
  schedule: {
    time: string;
    days: string[];
  };
  rating: {
    average: number;
  };
  network?: {
    name: string;
    country: {
      name: string;
      code: string;
      timezone: string;
    };
  };
  summary: string;
  _links: {
    self: { href: string };
    previousepisode?: { href: string };
    nextepisode?: { href: string };
  };
}

export interface TVMazeEpisode {
  id: number;
  url: string;
  name: string;
  season: number;
  number: number;
  airdate: string;
  airtime: string;
  runtime: number;
  summary: string;
}

/**
 * Lookup a TV show by its IMDb ID.
 */
export async function getTVMazeShow(imdbId: string): Promise<TVMazeShow | null> {
  if (!imdbId) return null;

  try {
    const res = await fetch(`${BASE_URL}/lookup/shows?imdb=${imdbId}`, {
      next: { revalidate: 86400 }
    });
    if (!res.ok) return null;
    return res.json() as Promise<TVMazeShow>;
  } catch (error) {
    console.error('TVMaze Lookup Error:', error);
    return null;
  }
}

/**
 * Fetch detailed episode info using a TVmaze link (from _links.nextepisode)
 */
export async function getTVMazeEpisode(url: string): Promise<TVMazeEpisode | null> {
  try {
    const res = await fetch(url, {
      next: { revalidate: 86400 }
    });
    if (!res.ok) return null;
    return res.json() as Promise<TVMazeEpisode>;
  } catch (error) {
    console.error('TVMaze Episode Error:', error);
    return null;
  }
}
