import Link from 'next/link';
import { tmdb } from "@/lib/tmdb";
import { HeroBanner } from "@/components/home/HeroBanner";
import { TopBar } from "@/components/home/TopBar";
import { MovieRow } from "@/components/home/MovieRow";
import { FeaturedRow } from "@/components/home/FeaturedRow";
import { GenreTabs } from "@/components/home/GenreTabs";
import { ContinueWatching } from "@/components/home/ContinueWatching";
import { FreeFilmsRow } from "@/components/home/FreeFilmsRow";
import type { TMDBMovie, TMDBTVShow } from "@/types/tmdb";

export const revalidate = 3600;

export default async function HomePage() {
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
    bollywood
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
  ]);

  type AnyMedia = (TMDBMovie | TMDBTVShow) & { media_type?: "movie" | "tv" };

  return (
    <div className="min-h-screen">
      <HeroBanner />
      <TopBar />
      <ContinueWatching />
      <FreeFilmsRow />

      <section className="px-10 py-7">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bebas text-xl tracking-widest text-[--flx-text-1]">
            Trending Now
          </h2>
          <Link href="/movies" className="text-xs text-[--flx-cyan] font-medium hover:opacity-70 transition-opacity">
            View all
          </Link>
        </div>
        <GenreTabs genres={movieGenres.genres} />
        <MovieRow title="" items={trending.results.slice(0, 10) as AnyMedia[]} showRank />
      </section>

      <div className="h-px bg-white/5 mx-10" />
      <MovieRow title="Top Rated All Time" items={topRated.results.slice(0, 10)} seeAllHref="/movies?sort=top_rated" />

      <div className="h-px bg-white/5 mx-10" />
      <FeaturedRow title="New Series" shows={newSeries.results.slice(0, 6)} />

      <div className="h-px bg-white/5 mx-10" />
      <MovieRow title="Popular Movies" items={popular.results.slice(0, 10)} seeAllHref="/movies" pill={{ label: "HOT", variant: "hot" }} />

      <div className="h-px bg-white/5 mx-10" />
      <MovieRow title="Anime Essentials" items={anime.results.slice(0, 10)} pill={{ label: "J-ANIME", variant: "new" }} />

      <div className="h-px bg-white/5 mx-10" />
      <MovieRow title="K-Cinema Spotlight" items={koreanMovies.results.slice(0, 10)} pill={{ label: "K-WAVE", variant: "new" }} />

      <div className="h-px bg-white/5 mx-10" />
      <MovieRow title="Spanish Cinema" items={spanishMovies.results.slice(0, 10)} pill={{ label: "ESPAÑOL", variant: "new" }} />

      <div className="h-px bg-white/5 mx-10" />
      <MovieRow title="French Classics" items={frenchMovies.results.slice(0, 10)} pill={{ label: "FRANÇAIS", variant: "new" }} />

      <div className="h-px bg-white/5 mx-10" />
      <MovieRow title="Bollywood Hits" items={bollywood.results.slice(0, 10)} pill={{ label: "BOLLYWOOD", variant: "new" }} />

      <div className="h-24" />
    </div>
  );
}
