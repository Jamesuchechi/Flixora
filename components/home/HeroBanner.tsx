import { tmdb } from '@/lib/tmdb';
import { HeroCarousel } from './HeroCarousel';
import type { TMDBMovie, TMDBTVShow } from '@/types/tmdb';

export async function HeroBanner() {
  const data = await tmdb.trending.all();
  
  // Filter and map items to ensure they have the media_type property
  // and are limited to a reasonable number for the carousel (e.g., top 10)
  const items = data.results.slice(0, 10).map(item => {
    const trendingItem = item as (TMDBMovie | TMDBTVShow) & { media_type?: 'movie' | 'tv' };
    return {
      ...item,
      media_type: trendingItem.media_type || ('title' in item ? 'movie' : 'tv')
    } as ((TMDBMovie | TMDBTVShow) & { media_type: 'movie' | 'tv' });
  });

  if (!items || items.length === 0) return null;

  return <HeroCarousel items={items} />;
}

