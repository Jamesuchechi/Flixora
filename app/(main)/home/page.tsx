import { Suspense } from 'react';
import Link from 'next/link';
import { tmdb } from "@/lib/tmdb";
import { HeroBanner } from "@/components/home/HeroBanner";
import { TopBar } from "@/components/home/TopBar";
import { MovieRow } from "@/components/home/MovieRow";
import { FeaturedRow } from "@/components/home/FeaturedRow";
import { ContinueWatching } from "@/components/home/ContinueWatching";
import { FreeFilmsRow } from "@/components/home/FreeFilmsRow";
import { MoodStrip } from "@/components/home/MoodStrip";
import { SpotlightCard } from "@/components/home/SpotlightCard";
import { EditorialGrid } from "@/components/home/EditorialGrid";
import type { TMDBMovie, TMDBTVShow } from "@/types/tmdb";

export const revalidate = 3600;

interface HomePageProps {
  searchParams: Promise<{ genre?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const resolvedSearchParams = await searchParams;
  const [
    trending, 
    topRated, 
    newSeries, 
    popular, 
    movieGenres, 
    koreanMovies, 
    anime,
    spanishMovies,
    frenchMovies,
    bollywood,
    nollywood,
    nowPlaying
  ] = await Promise.all([
    tmdb.trending.all(),
    tmdb.movies.topRated(),
    tmdb.tv.onAir(),
    tmdb.movies.popular(),
    tmdb.genres.movies(),
    tmdb.discover.movies({ with_original_language: 'ko' }),
    tmdb.discover.tv({ with_original_language: 'ja', with_genres: '16' }),
    tmdb.discover.movies({ with_original_language: 'es' }),
    tmdb.discover.movies({ with_original_language: 'fr' }),
    tmdb.discover.movies({ with_original_language: 'hi' }),
    tmdb.discover.movies({ with_origin_country: 'NG' }),
    tmdb.movies.nowPlaying(),
  ]);

  type AnyMedia = (TMDBMovie | TMDBTVShow) & { media_type?: "movie" | "tv" };

  const activeMood = resolvedSearchParams.genre || 'All';
  
  // Filter trending items based on mood
  let filteredTrending = trending.results;
  if (activeMood !== 'All') {
    const genreId = movieGenres.genres.find(
      g => g.name.toLowerCase() === activeMood.toLowerCase() || 
           (activeMood === 'Sci-Fi' && g.name === 'Science Fiction')
    )?.id;

    if (genreId) {
      filteredTrending = trending.results.filter(item => 
        item.genre_ids?.includes(genreId)
      );
    }
  }

  return (
    <div className="min-h-screen">
      <HeroBanner />
      <TopBar />
      
      <ContinueWatching />
      
      <div className="h-px bg-white/5 mx-10" />
      <Suspense fallback={<div className="h-20" />}>
        <MoodStrip />
      </Suspense>
      
      <div className="h-px bg-white/5 mx-10" />
      <div className="bg-linear-to-r from-[--flx-purple]/5 via-transparent to-[--flx-cyan]/5 border-y border-white/5 py-2">
        <FreeFilmsRow />
      </div>

      <div className="h-px bg-white/5 mx-10" />
      <section className="px-10 py-7">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bebas text-2xl md:text-3xl tracking-[3px] text-[--flx-text-1]">
            Trending {activeMood !== 'All' ? `in ${activeMood}` : 'Now'}
          </h2>
          <Link href="/movies" className="text-xs text-[--flx-cyan] font-black uppercase tracking-[2px] hover:opacity-70 transition-opacity">
            View all
          </Link>
        </div>
        <MovieRow title="" items={filteredTrending.slice(0, 10) as AnyMedia[]} showRank />
      </section>

      <div className="h-px bg-white/5 mx-10" />
      <MovieRow title="Top Rated All Time" items={topRated.results.slice(0, 10)} seeAllHref="/movies?sort=top_rated" />

      <div className="h-px bg-white/5 mx-10" />
      <SpotlightCard item={trending.results[1]} />

      <div className="h-px bg-white/5 mx-10" />
      <FeaturedRow title="New Series" shows={newSeries.results.slice(0, 6)} />

      <div className="h-px bg-white/5 mx-10" />
      <MovieRow title="Popular Movies" items={popular.results.slice(0, 10)} seeAllHref="/movies" pill={{ label: "HOT", variant: "hot" }} />

      <div className="h-px bg-white/5 mx-10" />
      <MovieRow title="Anime Essentials" items={anime.results.slice(0, 10)} pill={{ label: "J-ANIME", variant: "new" }} />

      <div className="h-px bg-white/5 mx-10" />
      <MovieRow title="K-Cinema Spotlight" items={koreanMovies.results.slice(0, 10)} pill={{ label: "K-WAVE", variant: "new" }} />

      <div className="h-px bg-white/5 mx-10" />
      <EditorialGrid items={topRated.results.slice(0, 4)} title="Flixora Picks" />

      <div className="h-px bg-white/5 mx-10" />
      <MovieRow title="Spanish Cinema" items={spanishMovies.results.slice(0, 10)} pill={{ label: "ESPAÑOL", variant: "new" }} />

      <div className="h-px bg-white/5 mx-10" />
      <MovieRow title="French Classics" items={frenchMovies.results.slice(0, 10)} pill={{ label: "FRANÇAIS", variant: "new" }} />

      <div className="h-px bg-white/5 mx-10" />
      <MovieRow title="Bollywood Hits" items={bollywood.results.slice(0, 10)} pill={{ label: "BOLLYWOOD", variant: "new" }} />

      <div className="h-px bg-white/5 mx-10" />
      <MovieRow title="Nollywood Excellence" items={nollywood.results.slice(0, 10)} pill={{ label: "NOLLYWOOD", variant: "hot" }} />

      {/* regional/domain test row */}
      <div className="h-px bg-white/5 mx-10" />
      <MovieRow 
        title="YouTube Global Classics" 
        items={[
          { id: 430040, title: 'Big Buck Bunny', poster_path: '/nGeXN3fO4X30uM8U32eLdpxU43y.jpg', media_type: 'movie', vote_average: 7.2 },
          { id: 290157, title: 'Sita Sings the Blues', poster_path: '/c4hC6lDNR0G68Xh9uVb7rXvFf7T.jpg', media_type: 'movie', vote_average: 7.1 },
          { id: 310569, title: 'The Prophet', poster_path: '/2mR0yWdGqCqR5R6v1WkPq6fF8XU.jpg', media_type: 'movie', vote_average: 7.4 }
        ] as AnyMedia[]} 
        pill={{ label: "TEST", variant: "new" }} 
      />

      <div className="h-px bg-white/5 mx-10" />
      <MovieRow title="Recently Added" items={nowPlaying.results.slice(0, 10)} pill={{ label: "LATEST", variant: "new" }} />

      <div className="h-24" />
    </div>
  );
}


