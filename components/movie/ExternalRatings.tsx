import { getOMDBData, getSourceRating } from '@/lib/omdb';

interface ExternalRatingsProps {
  imdbId?: string;
}

export async function ExternalRatings({ imdbId }: ExternalRatingsProps) {
  if (!imdbId) return null;

  const data = await getOMDBData(imdbId);
  if (!data) return null;

  const rtRating = getSourceRating(data, 'Rotten Tomatoes');
  const imdbRating = data.imdbRating;
  const metacritic = getSourceRating(data, 'Metacritic');

  return (
    <div className="flex items-center gap-6 animate-fade-in">
      {/* IMDb */}
      {imdbRating && (
        <div className="flex flex-col">
          <span className="text-[10px] text-white/30 uppercase tracking-widest font-bold mb-1">IMDb</span>
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 bg-[#f5c518] rounded flex items-center justify-center">
               <span className="text-[10px] text-black font-black">IMDb</span>
            </div>
            <span className="text-sm font-bold text-white/90">{imdbRating}</span>
          </div>
        </div>
      )}

      {/* Rotten Tomatoes */}
      {rtRating && (
        <div className="flex flex-col">
          <span className="text-[10px] text-white/30 uppercase tracking-widest font-bold mb-1">Tomatoes</span>
          <div className="flex items-center gap-1.5">
             <span className="text-lg">🍅</span>
             <span className="text-sm font-bold text-white/90">{rtRating}</span>
          </div>
        </div>
      )}

      {/* Metacritic */}
      {metacritic && (
        <div className="flex flex-col">
          <span className="text-[10px] text-white/30 uppercase tracking-widest font-bold mb-1">Metascore</span>
          <div className="flex items-center gap-1.5">
             <div className={Number(data.Metascore) > 60 ? "w-5 h-5 bg-[#66cc33] rounded flex items-center justify-center" : "w-5 h-5 bg-[#ffcc33] rounded flex items-center justify-center"}>
                <span className="text-[10px] text-white font-bold">{data.Metascore}</span>
             </div>
             <span className="text-[10px] text-white/50 uppercase tracking-tighter">Meta</span>
          </div>
        </div>
      )}
    </div>
  );
}
