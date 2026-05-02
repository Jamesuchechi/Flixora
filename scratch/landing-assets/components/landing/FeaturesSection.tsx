const FEATURES = [
  {
    emoji: '🌌',
    bg: 'bg-[--flx-purple]/15',
    title: 'Aurora Cinematic UI',
    desc: 'A dark, immersive interface designed to put the content first — not ads, not noise.',
  },
  {
    emoji: '⚡',
    bg: 'bg-[--flx-cyan]/12',
    title: 'Instant 4K Streaming',
    desc: 'Adaptive bitrate that starts in HD and scales to 4K in seconds. No buffering.',
  },
  {
    emoji: '❤️',
    bg: 'bg-[--flx-pink]/12',
    title: 'Smart Watchlist',
    desc: 'Save titles and resume exactly where you left off — synced across all your devices.',
  },
  {
    emoji: '🔍',
    bg: 'bg-[--flx-gold]/10',
    title: 'Instant Search',
    desc: 'Search across 50,000 titles in real time, powered by TMDB. Results before you finish typing.',
  },
  {
    emoji: '📺',
    bg: 'bg-[--flx-purple]/15',
    title: 'Series Episode Browser',
    desc: 'Full season browsers with episode thumbnails, descriptions, and runtime — navigate any show like a pro.',
  },
  {
    emoji: '🚫',
    bg: 'bg-[--flx-cyan]/12',
    title: 'Zero Ads, Ever',
    desc: 'No pre-rolls. No banners. No sponsored content. Clean viewing experience by design.',
  },
];

export function FeaturesSection() {
  return (
    <section className="px-12 py-20" id="features">
      {/* Header */}
      <div className="mb-12">
        <p className="text-[11px] tracking-[2.5px] uppercase text-[--flx-purple] font-semibold mb-3">
          Why Flixora
        </p>
        <h2 className="font-['Bebas_Neue',sans-serif] text-[clamp(36px,5vw,56px)] tracking-[1.5px] mb-4">
          Built for Real<br />Movie Lovers
        </h2>
        <p className="text-[15px] text-[--flx-text-2] font-light leading-relaxed max-w-[480px]">
          We didn&apos;t copy Netflix. We built what we wished existed — a platform that actually respects your taste.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {FEATURES.map(({ emoji, bg, title, desc }) => (
          <div
            key={title}
            className="bg-[--flx-surface-1] border border-white/6 rounded-2xl p-7 hover:border-[--flx-purple]/25 hover:-translate-y-1 transition-all duration-200"
          >
            <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center text-xl mb-4`}>
              {emoji}
            </div>
            <h3 className="text-[15px] font-medium text-[--flx-text-1] mb-2">{title}</h3>
            <p className="text-[13px] text-[--flx-text-3] leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
