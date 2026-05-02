import type { ImageSize, TMDBPaginatedResponse, TMDBMovie, TMDBTVShow, TMDBExternalIds } from '@/types/tmdb';

const IS_SERVER = typeof window === 'undefined';
const BASE_URL  = IS_SERVER 
  ? (process.env.TMDB_BASE_URL ?? 'https://api.themoviedb.org/3')
  : '/api/tmdb';

const API_KEY   = process.env.TMDB_API_KEY ?? '';
const IMG_BASE  = process.env.TMDB_IMAGE_BASE ?? 'https://image.tmdb.org/t/p';

async function get<T>(
  endpoint: string, 
  params: Record<string, string> = {}, 
  options: { silent?: boolean; retries?: number } = { retries: 2 }
): Promise<T> {
  // Ensure endpoint doesn't have a double leading slash and baseUrl doesn't have a trailing one
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const cleanBase = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
  
  const url = IS_SERVER 
    ? new URL(`${cleanBase}${cleanEndpoint}`)
    : new URL(`${cleanBase}${cleanEndpoint}`, typeof window !== 'undefined' ? window.location.origin : '');

  if (IS_SERVER && API_KEY) {
    url.searchParams.set('api_key', API_KEY);
  }
  
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  let lastError: unknown = null;
  const { silent = false, retries = 2 } = options;
  const maxRetries = retries;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(url.toString(), { 
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        next: IS_SERVER ? { revalidate: 3600 } : undefined 
      });
      
      if (!res.ok) {
        if (!silent) {
          const errorText = await res.text().catch(() => 'No error body');
          console.error(`TMDB Error [${res.status}]: ${endpoint}`, errorText);
        }
        throw new Error(`TMDB ${res.status}: ${endpoint}`);
      }
      
      return res.json() as Promise<T>;
    } catch (err: unknown) {
      lastError = err;
      
      const isTimeout = 
        (err && typeof err === 'object' && 'code' in err && err.code === 'ETIMEDOUT') ||
        (err instanceof Error && (err.message.includes('timeout') || err.message.includes('fetch failed')));
      
      if (isTimeout && attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 500;
        if (!silent) console.warn(`TMDB Retry ${attempt + 1}/${maxRetries} for ${endpoint} after ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      if (!silent) {
        const message = err instanceof Error ? err.message : String(err);
        console.error('TMDB Fetch Exception:', { message, endpoint, isServer: IS_SERVER });
      }
      throw err;
    }
  }
  throw lastError;
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
  all:    (page = '1', options?: { silent?: boolean }) => get<TMDBPaginatedResponse<TMDBMovie & TMDBTVShow>>('/trending/all/day', { page }, options),
  movies: (page = '1', options?: { silent?: boolean }) => get<TMDBPaginatedResponse<TMDBMovie>>('/trending/movie/day', { page }, options),
  tv:     (page = '1', options?: { silent?: boolean }) => get<TMDBPaginatedResponse<TMDBTVShow>>('/trending/tv/day', { page }, options),
};

const movies = {
  popular:   (page = '1', options?: { silent?: boolean }) => get<TMDBPaginatedResponse<TMDBMovie>>('/movie/popular', { page }, options),
  topRated:  (page = '1', options?: { silent?: boolean }) => get<TMDBPaginatedResponse<TMDBMovie>>('/movie/top_rated', { page }, options),
  nowPlaying:(page = '1', options?: { silent?: boolean }) => get<TMDBPaginatedResponse<TMDBMovie>>('/movie/now_playing', { page }, options),
  upcoming:  (page = '1', options?: { silent?: boolean }) => get<TMDBPaginatedResponse<TMDBMovie>>('/movie/upcoming', { page }, options),
  detail:    (id: number, options?: { silent?: boolean }) => get<TMDBMovie>(`/movie/${id}`, {}, options),
  credits:   (id: number, options?: { silent?: boolean }) => get<{ id: number; cast: unknown[]; crew: unknown[] }>(`/movie/${id}/credits`, {}, options),
  videos:    (id: number, options?: { silent?: boolean }) => get<{ id: number; results: unknown[] }>(`/movie/${id}/videos`, {}, options),
  similar:   (id: number, options?: { silent?: boolean }) => get<TMDBPaginatedResponse<TMDBMovie>>(`/movie/${id}/similar`, {}, options),
  byGenre:   (genreId: string, page = '1', options?: { silent?: boolean }) =>
    get<TMDBPaginatedResponse<TMDBMovie>>('/discover/movie', { with_genres: genreId, sort_by: 'popularity.desc', page }, options),
  externalIds: (id: number, options?: { silent?: boolean }) => get<TMDBExternalIds>(`/movie/${id}/external_ids`, {}, options),
};

const tv = {
  popular:   (page = '1', options?: { silent?: boolean }) => get<TMDBPaginatedResponse<TMDBTVShow>>('/tv/popular', { page }, options),
  topRated:  (page = '1', options?: { silent?: boolean }) => get<TMDBPaginatedResponse<TMDBTVShow>>('/tv/top_rated', { page }, options),
  onAir:     (page = '1', options?: { silent?: boolean }) => get<TMDBPaginatedResponse<TMDBTVShow>>('/tv/on_the_air', { page }, options),
  detail:    (id: number, options?: { silent?: boolean }) => get<TMDBTVShow>(`/tv/${id}`, {}, options),
  credits:   (id: number, options?: { silent?: boolean }) => get<{ id: number; cast: unknown[]; crew: unknown[] }>(`/tv/${id}/credits`, {}, options),
  videos:    (id: number, options?: { silent?: boolean }) => get<{ id: number; results: unknown[] }>(`/tv/${id}/videos`, {}, options),
  season:    (id: number, season: number, options?: { silent?: boolean }) => get<unknown>(`/tv/${id}/season/${season}`, {}, options),
  similar:   (id: number, options?: { silent?: boolean }) => get<TMDBPaginatedResponse<TMDBTVShow>>(`/tv/${id}/similar`, {}, options),
  externalIds: (id: number, options?: { silent?: boolean }) => get<TMDBExternalIds>(`/tv/${id}/external_ids`, {}, options),
};

const genres = {
  movies: (options?: { silent?: boolean }) => get<{ genres: { id: number; name: string }[] }>('/genre/movie/list', {}, options),
  tv:     (options?: { silent?: boolean }) => get<{ genres: { id: number; name: string }[] }>('/genre/tv/list', {}, options),
};

const search = {
  multi: (query: string, page = '1', options?: { silent?: boolean }) =>
    get<TMDBPaginatedResponse<unknown>>('/search/multi', { query, page }, options),
  movies: (query: string, page = '1', options?: { silent?: boolean }) =>
    get<TMDBPaginatedResponse<TMDBMovie>>('/search/movie', { query, page }, options),
  tv: (query: string, page = '1', options?: { silent?: boolean }) =>
    get<TMDBPaginatedResponse<TMDBTVShow>>('/search/tv', { query, page }, options),
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
