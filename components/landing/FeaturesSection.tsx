import { Layout, Zap, Heart, Search, Tv, ShieldCheck } from 'lucide-react';

const FEATURES = [
  {
    Icon: Layout,
    bg: 'bg-[--flx-purple]/10',
    color: 'text-violet-400',
    title: 'Aurora Cinematic UI',
    desc: 'An immersive interface designed to put the focus on content — not ads or clutter.',
  },
  {
    Icon: Zap,
    bg: 'bg-[--flx-cyan]/8',
    color: 'text-cyan-400',
    title: 'Instant 4K Streaming',
    desc: 'Adaptive bitrate that scales to 4K Ultra HD in seconds. Say goodbye to buffering.',
  },
  {
    Icon: Heart,
    bg: 'bg-[--flx-pink]/10',
    color: 'text-pink-400',
    title: 'Smart Watchlist',
    desc: 'Resume exactly where you left off. Synced across all your devices, instantly.',
  },
  {
    Icon: Search,
    bg: 'bg-[--flx-gold]/10',
    color: 'text-yellow-400',
    title: 'Powerful Search',
    desc: 'Find any title across 50,000+ entries before you even finish typing your query.',
  },
  {
    Icon: Tv,
    bg: 'bg-[--flx-purple]/10',
    color: 'text-violet-400',
    title: 'Episode Browser',
    desc: 'Full season navigation with rich thumbnails and metadata for every series.',
  },
  {
    Icon: ShieldCheck,
    bg: 'bg-[--flx-cyan]/8',
    color: 'text-cyan-400',
    title: 'Zero Ads, Period',
    desc: 'A pure cinematic experience. No pre-rolls, banners, or interruptions, ever.',
  },
];

export function FeaturesSection() {
  return (
    <section className="px-12 py-32 relative" id="features">
      {/* Background Decor */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-[--flx-purple]/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Header */}
      <div className="max-w-[700px] mb-20">
        <p className="text-[10px] tracking-[4px] uppercase text-[--flx-purple] font-bold mb-4">
          ENGINEERED FOR CINEMA
        </p>
        <h2 className="font-bebas text-[clamp(44px,7vw,72px)] leading-[0.9] tracking-[1px] mb-6">
          Everything You Need,<br />Nothing You Don&apos;t
        </h2>
        <p className="text-[16px] text-[--flx-text-2] font-light leading-relaxed max-w-[500px]">
          We rebuilt the streaming experience from the ground up to respect your time and your taste.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {FEATURES.map(({ Icon, bg, color, title, desc }) => (
          <div
            key={title}
            className="group relative bg-white/3 border border-white/5 rounded-[32px] p-10 hover:bg-white/5 hover:border-white/10 transition-all duration-500"
          >
            <div className={`w-14 h-14 rounded-2xl ${bg} flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500`}>
              <Icon className={`${color}`} size={26} />
            </div>
            <h3 className="text-[18px] font-semibold text-[--flx-text-1] mb-4">{title}</h3>
            <p className="text-[14px] text-[--flx-text-3] leading-relaxed group-hover:text-[--flx-text-2] transition-colors">
              {desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
