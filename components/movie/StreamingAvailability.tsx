import { getStreamingSources } from '@/lib/watchmode';

interface StreamingAvailabilityProps {
  imdbId?: string;
}

export async function StreamingAvailability({ imdbId }: StreamingAvailabilityProps) {
  if (!imdbId) return null;

  const allSources = await getStreamingSources(imdbId);
  
  // Filter for 'sub' (subscription) and unique sources in the US (or just unique names)
  const subscriptionSources = allSources
    .filter(s => s.type === 'sub')
    .filter((v, i, a) => a.findIndex(t => t.name === v.name) === i)
    .slice(0, 5); // Just show top 5

  if (subscriptionSources.length === 0) return null;

  return (
    <div className="flex flex-col gap-3 animate-fade-up" style={{ animationDelay: '0.4s' }}>
      <h3 className="text-[10px] text-white/30 uppercase tracking-[3px] font-bold">Available to Stream</h3>
      
      <div className="flex flex-wrap gap-4">
        {subscriptionSources.map((source) => (
          <a
            key={source.source_id}
            href={source.web_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/5 hover:border-[--flx-cyan]/30 hover:bg-white/10 transition-all group"
          >
            {/* Simple colored circle if we don't have icons from the API directly */}
            <div className="w-2 h-2 rounded-full bg-[--flx-cyan] shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
            <span className="text-xs font-medium text-white/70 group-hover:text-white transition-colors">
              {source.name}
            </span>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-white/20 group-hover:text-[--flx-cyan] transition-colors">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3" />
            </svg>
          </a>
        ))}
      </div>
    </div>
  );
}
