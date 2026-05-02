import { getTVMazeShow, getTVMazeEpisode } from '@/lib/tvmaze';

interface TVAiringStatusProps {
  imdbId?: string;
}

export async function TVAiringStatus({ imdbId }: TVAiringStatusProps) {
  if (!imdbId) return null;

  const show = await getTVMazeShow(imdbId);
  if (!show) return null;

  const nextEpisodeUrl = show._links.nextepisode?.href;
  if (!nextEpisodeUrl) {
    if (show.status === 'Ended') {
      return (
        <div className="flex items-center gap-2 py-1 px-3 rounded-full bg-white/5 border border-white/5 w-fit">
          <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
          <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Series Ended</span>
        </div>
      );
    }
    return null;
  }

  const nextEpisode = await getTVMazeEpisode(nextEpisodeUrl);
  if (!nextEpisode) return null;

  return (
    <div className="flex flex-col gap-2 animate-fade-in">
      <div className="flex items-center gap-2 py-1 px-3 rounded-full bg-[--flx-cyan]/10 border border-[--flx-cyan]/20 w-fit">
        <div className="w-1.5 h-1.5 rounded-full bg-[--flx-cyan] animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
        <span className="text-[10px] font-bold text-[--flx-cyan] uppercase tracking-widest">Next Episode Airing Soon</span>
      </div>
      
      <div className="pl-4 border-l border-white/10">
        <p className="text-xs font-medium text-white/80">
          S{nextEpisode.season} E{nextEpisode.number}: <span className="text-[--flx-text-1]">{nextEpisode.name}</span>
        </p>
        <p className="text-[10px] text-white/40 uppercase tracking-tighter mt-0.5">
          {new Date(nextEpisode.airdate).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })} @ {nextEpisode.airtime}
        </p>
      </div>
    </div>
  );
}
