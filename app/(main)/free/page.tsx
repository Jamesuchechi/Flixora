import { getFreeFilms } from '@/lib/supabase/actions/free-films';
import { MovieCard } from '@/components/movie/MovieCard';


export const metadata = {
  title: 'Watch Free Movies Online | Flixora',
  description: 'Stream hundreds of high-quality, verified free films and public domain classics in 1080p. No subscription required for these titles.',
};

export default async function FreeFilmsPage() {
  const freeFilms = await getFreeFilms();

  return (
    <div className="min-h-screen bg-[--flx-bg] pb-20 pt-28 px-4 md:px-8 lg:px-12">
      {/* Hero Header */}
      <div className="max-w-7xl mx-auto mb-16 relative overflow-hidden rounded-[40px] bg-[#110c1d] border border-white/5 p-8 md:p-16">
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 mb-6">
            <div className="px-3 py-1 bg-[--flx-cyan] text-black text-[10px] font-black uppercase tracking-[2px] rounded-full">
              Legal & Free
            </div>
            <div className="w-1 h-1 rounded-full bg-white/20" />
            <span className="text-white/40 text-[10px] font-bold uppercase tracking-[2px]">Verified Archive</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight uppercase tracking-tighter">
            Cinematic <br /> 
            <span className="text-[--flx-cyan]">Freedom.</span>
          </h1>
          
          <p className="text-white/60 text-lg mb-10 leading-relaxed max-w-xl">
            Flixora curates the world&apos;s best public domain and studio-uploaded free films. 
            No ads, no accounts, just pure cinema from the archives of history.
          </p>

          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-4 bg-white/5 backdrop-blur-xl border border-white/10 px-6 py-4 rounded-2xl">
              <span className="text-3xl font-black text-white">{freeFilms.length}</span>
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-[2px] leading-tight">
                Verified <br /> Titles
              </span>
            </div>
            <div className="flex items-center gap-4 bg-white/5 backdrop-blur-xl border border-white/10 px-6 py-4 rounded-2xl">
              <span className="text-3xl font-black text-[--flx-cyan]">1080p</span>
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-[2px] leading-tight">
                Average <br /> Quality
              </span>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-linear-to-l from-[--flx-cyan]/10 to-transparent pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[--flx-purple]/20 blur-[120px] rounded-full pointer-events-none" />
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold text-white uppercase tracking-[4px]">Browse Full Library</h2>
          <div className="h-px flex-1 bg-white/5 mx-8 hidden md:block" />
        </div>

        {freeFilms.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {freeFilms.map((film) => (
              <MovieCard
                key={film.id}
                id={film.tmdb_id}
                title={film.title}
                posterPath={film.poster_path ?? null}
                rating={8.5} // Default for verified classics or fetch from TMDB?
                releaseDate="Classic"
                mediaType="movie"
                isFree={true}
              />
            ))}
          </div>
        ) : (
          <div className="py-32 text-center">
            <p className="text-white/40 uppercase tracking-[4px] font-bold">The archives are loading...</p>
          </div>
        )}
      </div>
    </div>
  );
}
