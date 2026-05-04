import Link from 'next/link';
import { getStreamingSources, type WatchmodeSource } from '@/lib/watchmode';
import { getProviderMeta, isFreeProvider, toJustWatchSlug } from '@/lib/streaming-providers';
import { ExternalLink, Tv2, PlayCircle } from 'lucide-react';

// ── Props ──────────────────────────────────────────────────────────────────────

interface WhereToWatchProps {
  imdbId?: string;
  tmdbId: number;
  title: string;
  mediaType: 'movie' | 'tv';
  /** If Flixora has a free YouTube version, pass this so we can highlight it */
  fullFilmYoutubeId?: string;
}

// ── Type badge ────────────────────────────────────────────────────────────────

function TypeBadge({ type, price }: { type: string; price: number | null }) {
  if (type === 'free' || (price === null && type === 'sub')) {
    return (
      <span className="px-2 py-0.5 rounded-md bg-[--flx-cyan]/15 border border-[--flx-cyan]/30 text-[--flx-cyan] text-[8px] font-black uppercase tracking-widest">
        Free
      </span>
    );
  }
  if (type === 'sub') {
    return (
      <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-white/40 text-[8px] font-black uppercase tracking-widest">
        Sub
      </span>
    );
  }
  if (type === 'rent') {
    return (
      <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[8px] font-black uppercase tracking-widest">
        {price ? `Rent $${price}` : 'Rent'}
      </span>
    );
  }
  if (type === 'buy') {
    return (
      <span className="px-2 py-0.5 rounded-md bg-[--flx-purple]/15 border border-[--flx-purple]/30 text-violet-300 text-[8px] font-black uppercase tracking-widest">
        {price ? `Buy $${price}` : 'Buy'}
      </span>
    );
  }
  return null;
}

// ── Provider card ──────────────────────────────────────────────────────────────

function ProviderCard({ source }: { source: WatchmodeSource }) {
  const meta = getProviderMeta(source.name);
  const free = isFreeProvider(source);

  return (
    <a
      href={source.web_url}
      target="_blank"
      rel="noopener noreferrer"
      title={`Watch on ${meta.displayName}`}
      className="group flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all duration-200 hover:scale-[1.04] hover:brightness-110"
      style={{
        backgroundColor: `${meta.color}18`,
        borderColor: free ? `${meta.color}60` : `${meta.color}30`,
      }}
    >
      <span className="text-2xl leading-none">{meta.logo}</span>
      <div className="flex flex-col items-center gap-1 text-center">
        <span
          className="text-[11px] font-black uppercase tracking-wider leading-tight"
          style={{ color: meta.color }}
        >
          {meta.displayName}
        </span>
        <TypeBadge type={source.type} price={source.price} />
      </div>
      <ExternalLink
        size={10}
        className="opacity-0 group-hover:opacity-40 transition-opacity"
        style={{ color: meta.color }}
      />
    </a>
  );
}

// ── Empty state ────────────────────────────────────────────────────────────────

function EmptyState({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center gap-4 py-8 text-center">
      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
        <Tv2 size={20} className="text-white/20" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-bold text-white/40">Not currently available for streaming.</p>
        <p className="text-[11px] text-white/20">Check back soon or find it at your local library.</p>
      </div>
      <a
        href={`https://www.justwatch.com/us/search?q=${encodeURIComponent(title)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-[--flx-cyan] transition-colors"
      >
        Search on JustWatch →
      </a>
    </div>
  );
}

// ── Main component — server component ─────────────────────────────────────────

export async function WhereToWatch({
  imdbId,
  tmdbId,
  title,
  mediaType,
  fullFilmYoutubeId,
}: WhereToWatchProps) {
  const allSources: WatchmodeSource[] = imdbId
    ? await getStreamingSources(imdbId)
    : [];

  // Deduplicate by provider name
  const seen = new Set<string>();
  const unique = allSources.filter((s) => {
    const key = `${s.name}:${s.type}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Split by access type
  const freeSources = unique.filter((s) => isFreeProvider(s));
  const subSources  = unique.filter((s) => !isFreeProvider(s) && s.type === 'sub');
  const rentSources = unique.filter((s) => s.type === 'rent').slice(0, 4);
  const buySources  = unique.filter((s) => s.type === 'buy').slice(0, 4);

  const hasAnySource = freeSources.length + subSources.length + rentSources.length + buySources.length > 0;
  const jwSlug = toJustWatchSlug(title);
  const watchHref = `/watch/${tmdbId}?type=${mediaType}&mode=free`;

  return (
    <div className="bg-white/5 border border-white/5 rounded-3xl p-6 space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-black uppercase tracking-[3px] text-white">
            Where to Watch Legally
          </h3>
          <p className="text-[10px] text-white/30 mt-1 font-medium">
            Support the creators — stream on official platforms
          </p>
        </div>
        <Tv2 size={16} className="text-white/20 mt-0.5 shrink-0" />
      </div>

      {/* Flixora Free Highlight */}
      {fullFilmYoutubeId && (
        <Link
          href={watchHref}
          className="flex items-center gap-4 px-5 py-4 rounded-2xl bg-[--flx-cyan]/10 border border-[--flx-cyan]/30 hover:bg-[--flx-cyan]/15 transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-[--flx-cyan]/20 flex items-center justify-center shrink-0">
            <PlayCircle size={20} className="text-[--flx-cyan]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[11px] font-black uppercase tracking-wider text-[--flx-cyan]">
                Watch Free Here
              </span>
              <span className="px-2 py-0.5 rounded-md bg-[--flx-cyan] text-black text-[8px] font-black uppercase tracking-widest">
                Free on Flixora
              </span>
            </div>
            <p className="text-[10px] text-white/40 truncate">
              Full film available on Flixora — no subscription needed
            </p>
          </div>
          <ExternalLink size={12} className="text-[--flx-cyan]/40 group-hover:text-[--flx-cyan] transition-colors shrink-0" />
        </Link>
      )}

      {/* Source grid */}
      {hasAnySource ? (
        <div className="space-y-5">

          {/* Free */}
          {freeSources.length > 0 && (
            <div className="space-y-3">
              <span className="text-[9px] font-black uppercase tracking-[3px] text-white/30 flex items-center gap-2">
                Free
                <span className="px-1.5 py-0.5 rounded bg-[--flx-cyan]/15 text-[--flx-cyan] border border-[--flx-cyan]/20">
                  {freeSources.length}
                </span>
              </span>
              <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))' }}>
                {freeSources.map((s) => <ProviderCard key={`${s.source_id}`} source={s} />)}
              </div>
            </div>
          )}

          {/* Subscription */}
          {subSources.length > 0 && (
            <div className="space-y-3">
              <span className="text-[9px] font-black uppercase tracking-[3px] text-white/30">
                Subscription
              </span>
              <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))' }}>
                {subSources.map((s) => <ProviderCard key={`${s.source_id}`} source={s} />)}
              </div>
            </div>
          )}

          {/* Rent & Buy */}
          {(rentSources.length > 0 || buySources.length > 0) && (
            <div className="space-y-3">
              <span className="text-[9px] font-black uppercase tracking-[3px] text-white/30">
                Rent / Buy
              </span>
              <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))' }}>
                {[...rentSources, ...buySources].map((s) => (
                  <ProviderCard key={`${s.source_id}`} source={s} />
                ))}
              </div>
            </div>
          )}

          {/* JustWatch link */}
          <a
            href={`https://www.justwatch.com/us/movie/${jwSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[9px] font-bold text-white/20 hover:text-[--flx-cyan] transition-colors uppercase tracking-widest inline-flex items-center gap-1"
          >
            See all streaming options →
          </a>
        </div>
      ) : (
        /* No sources found */
        !fullFilmYoutubeId && <EmptyState title={title} />
      )}
    </div>
  );
}
