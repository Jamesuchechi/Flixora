import type { ImageSize, TMDBPaginatedResponse, TMDBMovie, TMDBTVShow } from '@/types/tmdb';

const BASE_URL  = process.env.TMDB_BASE_URL  ?? 'https://api.themoviedb.org/3';
const API_KEY   = process.env.TMDB_API_KEY   ?? '';
const IMG_BASE  = process.env.TMDB_IMAGE_BASE ?? 'https://image.tmdb.org/t/p';

async function get<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.set('api_key', API_KEY);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`TMDB ${res.status}: ${endpoint}`);
  return res.json() as Promise<T>;
}

function image(path: string | null | undefined, size: ImageSize = 'w500'): string {
  if (!path) return '/assets/placeholder-poster.png';
  return `${IMG_BASE}/${size}${path}`;
}

function releaseYear(date: string | undefined): string {
  if (!date) return 'N/A';
  return date.split('-')[0];
}

function ratingColor(rating: number): string {
  if (rating >= 8) return 'text-green-400';
  if (rating >= 6) return 'text-yellow-400';
  return 'text-red-400';
}

// ─── Endpoints ────────────────────────────────────────────────────────────────

const trending = {
  all:    (page = '1') => get<TMDBPaginatedResponse<TMDBMovie & TMDBTVShow>>('/trending/all/day', { page }),
  movies: (page = '1') => get<TMDBPaginatedResponse<TMDBMovie>>('/trending/movie/day', { page }),
  tv:     (page = '1') => get<TMDBPaginatedResponse<TMDBTVShow>>('/trending/tv/day', { page }),
};

const movies = {
  popular:   (page = '1') => get<TMDBPaginatedResponse<TMDBMovie>>('/movie/popular', { page }),
  topRated:  (page = '1') => get<TMDBPaginatedResponse<TMDBMovie>>('/movie/top_rated', { page }),
  nowPlaying:(page = '1') => get<TMDBPaginatedResponse<TMDBMovie>>('/movie/now_playing', { page }),
  upcoming:  (page = '1') => get<TMDBPaginatedResponse<TMDBMovie>>('/movie/upcoming', { page }),
  detail:    (id: number) => get<TMDBMovie>(`/movie/${id}`),
  credits:   (id: number) => get<{ id: number; cast: unknown[]; crew: unknown[] }>(`/movie/${id}/credits`),
  videos:    (id: number) => get<{ id: number; results: unknown[] }>(`/movie/${id}/videos`),
  similar:   (id: number) => get<TMDBPaginatedResponse<TMDBMovie>>(`/movie/${id}/similar`),
  byGenre:   (genreId: string, page = '1') =>
    get<TMDBPaginatedResponse<TMDBMovie>>('/discover/movie', { with_genres: genreId, sort_by: 'popularity.desc', page }),
};

const tv = {
  popular:   (page = '1') => get<TMDBPaginatedResponse<TMDBTVShow>>('/tv/popular', { page }),
  topRated:  (page = '1') => get<TMDBPaginatedResponse<TMDBTVShow>>('/tv/top_rated', { page }),
  onAir:     (page = '1') => get<TMDBPaginatedResponse<TMDBTVShow>>('/tv/on_the_air', { page }),
  detail:    (id: number) => get<TMDBTVShow>(`/tv/${id}`),
  credits:   (id: number) => get<{ id: number; cast: unknown[]; crew: unknown[] }>(`/tv/${id}/credits`),
  videos:    (id: number) => get<{ id: number; results: unknown[] }>(`/tv/${id}/videos`),
  season:    (id: number, season: number) => get<unknown>(`/tv/${id}/season/${season}`),
  similar:   (id: number) => get<TMDBPaginatedResponse<TMDBTVShow>>(`/tv/${id}/similar`),
};

const genres = {
  movies: () => get<{ genres: { id: number; name: string }[] }>('/genre/movie/list'),
  tv:     () => get<{ genres: { id: number; name: string }[] }>('/genre/tv/list'),
};

const search = {
  multi: (query: string, page = '1') =>
    get<TMDBPaginatedResponse<unknown>>('/search/multi', { query, page }),
  movies: (query: string, page = '1') =>
    get<TMDBPaginatedResponse<TMDBMovie>>('/search/movie', { query, page }),
  tv: (query: string, page = '1') =>
    get<TMDBPaginatedResponse<TMDBTVShow>>('/search/tv', { query, page }),
};

export const tmdb = {
  get,
  image,
  releaseYear,
  ratingColor,
  trending,
  movies,
  tv,
  genres,
  search,
};
