import { tmdb } from "@/lib/tmdb";
import { HeroBanner } from "@/components/home/HeroBanner";
import { TopBar } from "@/components/home/TopBar";
import { MovieRow } from "@/components/home/MovieRow";
import { FeaturedRow } from "@/components/home/FeaturedRow";
import { GenreTabs } from "@/components/home/GenreTabs";
import type { TMDBMovie, TMDBTVShow } from "@/types/tmdb";

export const revalidate = 3600;

export default async function HomePage() {
  const [trending, topRated, newSeries, popular, movieGenres] = await Promise.all([
    tmdb.trending.all(),
    tmdb.movies.topRated(),
    tmdb.tv.onAir(),
    tmdb.movies.popular(),
    tmdb.genres.movies(),
  ]);

  type AnyMedia = (TMDBMovie | TMDBTVShow) & { media_type?: "movie" | "tv" };

  return (
    <div className="min-h-screen">
      <HeroBanner />
      <TopBar />

      <section className="px-10 py-7">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bebas text-xl tracking-widest text-[--flx-text-1]">
            Trending Now
          </h2>
          <a href="/movies" className="text-xs text-[--flx-cyan] font-medium hover:opacity-70 transition-opacity">
            View all
          </a>
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

      <div className="h-16" />
    </div>
  );
}
