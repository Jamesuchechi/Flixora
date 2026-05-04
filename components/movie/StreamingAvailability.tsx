import { getStreamingSources, type WatchmodeSource } from '@/lib/watchmode';
import { getProviderMeta, isFreeProvider, toJustWatchSlug } from '@/lib/streaming-providers';

// ── Props ──────────────────────────────────────────────────────────────────────

interface StreamingAvailabilityProps {
  imdbId?: string;
  title?: string;
}

// ── Skeleton loader ────────────────────────────────────────────────────────────

function SkeletonPills() {
  return (
    <div className="flex flex-wrap gap-2">
      {[100, 130, 115].map((w) => (
        <div
          key={w}
          className="h-10 rounded-2xl bg-white/5 animate-pulse"
          style={{ width: w }}
        />
      ))}
    </div>
  );
}

// ── Provider pill ──────────────────────────────────────────────────────────────

function ProviderPill({ source, isFree }: { source: WatchmodeSource; isFree: boolean }) {
  const meta = getProviderMeta(source.name);

  const bg  = `${meta.color}26`;   // 15% opacity
  const border = `${meta.color}4D`; // 30% opacity
  const text   = meta.color;

  return (
    <a
      href={source.web_url}
      target="_blank"
      rel="noopener noreferrer"
      title={`Watch on ${meta.displayName}`}
      className="group flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border transition-all duration-200 hover:scale-[1.03] hover:brightness-110"
      style={{
        backgroundColor: bg,
        borderColor: border,
        color: text,
      }}
    >
      <span className="text-base leading-none">{meta.logo}</span>
      <div className="flex flex-col">
        <span className="text-[11px] font-black uppercase tracking-wider leading-tight">
          {meta.displayName}
        </span>
        <span
          className="text-[9px] font-bold uppercase tracking-widest leading-tight opacity-70"
        >
          {isFree ? 'Free' : source.price ? `$${source.price}` : 'Stream'}
        </span>
      </div>
    </a>
  );
}

// ── Main component — server component ─────────────────────────────────────────

export async function StreamingAvailability({ imdbId, title }: StreamingAvailabilityProps) {
  if (!imdbId) return null;

  const allSources: WatchmodeSource[] = await getStreamingSources(imdbId);
  if (!allSources.length) return null;

  // Deduplicate by provider name, US region preferred
  const seen = new Set<string>();
  const unique = allSources.filter((s) => {
    if (seen.has(s.name)) return false;
    seen.add(s.name);
    return true;
  });

  const freeSources = unique.filter((s) => isFreeProvider(s));
  const subSources  = unique
    .filter((s) => !isFreeProvider(s) && s.type === 'sub')
    .slice(0, 6);

  if (freeSources.length === 0 && subSources.length === 0) return null;

  const jwSlug = title ? toJustWatchSlug(title) : '';

  return (
    <div className="flex flex-col gap-5 animate-fade-up" style={{ animationDelay: '0.4s' }}>

      {/* ── Section A: Free ── */}
      {freeSources.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-black uppercase tracking-[3px] text-white/30">
              Stream Free
            </span>
            <span className="px-2 py-0.5 rounded-md bg-[--flx-cyan]/15 border border-[--flx-cyan]/30 text-[--flx-cyan] text-[9px] font-black uppercase tracking-widest">
              FREE
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {freeSources.map((s) => (
              <ProviderPill key={s.source_id} source={s} isFree />
            ))}
          </div>
        </div>
      )}

      {/* ── Section B: Subscription ── */}
      {subSources.length > 0 && (
        <div className="flex flex-col gap-3">
          <span className="text-[9px] font-black uppercase tracking-[3px] text-white/20">
            Subscription
          </span>
          <div className="flex flex-wrap gap-2">
            {subSources.map((s) => (
              <ProviderPill key={s.source_id} source={s} isFree={false} />
            ))}
          </div>
        </div>
      )}

      {/* ── JustWatch link ── */}
      {jwSlug && (
        <a
          href={`https://www.justwatch.com/us/movie/${jwSlug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[9px] font-bold text-white/25 hover:text-[--flx-cyan] transition-colors uppercase tracking-widest w-fit"
        >
          See all streaming options →
        </a>
      )}
    </div>
  );
}

// Named export for the skeleton (used as a Suspense fallback)
export { SkeletonPills as StreamingAvailabilitySkeleton };
