import { getFreeFilms } from '@/lib/supabase/actions/free-films';
import { tmdb } from '@/lib/tmdb';
import { MovieRow } from './MovieRow';
import { TMDBMovie, TMDBTVShow } from '@/types/tmdb';

/**
 * Special row for home page that shows legitimately free films from YouTube.
 */
export async function FreeFilmsRow() {
  const freeFilms = await getFreeFilms();
  
  if (!freeFilms || freeFilms.length === 0) return null;

  // Fetch TMDB metadata for each free film
  const movieDetails = await Promise.all(
    freeFilms.map(async (f) => {
      try {
        if (f.media_type === 'movie') {
          return { ...(await tmdb.movies.detail(f.tmdb_id)), media_type: 'movie' };
        } else {
          return { ...(await tmdb.tv.detail(f.tmdb_id)), media_type: 'tv' };
        }
      } catch {
        return null;
      }
    })
  );

  const validItems = movieDetails.filter((item): item is (TMDBMovie | TMDBTVShow) & { media_type: 'movie' | 'tv' } => item !== null);

  if (validItems.length === 0) return null;

  return (
    <MovieRow 
      title="Watch Free Now" 
      items={validItems.map(item => ({ ...item, is_free: true }))} 
      pill={{ label: 'FREE', variant: 'new' }}
      seeAllHref="/free"
      className="bg-[--flx-purple]/5 border-y border-white/5 my-8"
    />
  );
}
