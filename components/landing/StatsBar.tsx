const STATS = [
  { num: '50K+',  label: 'TITLES AVAILABLE', icon: '🎬' },
  { num: '4K',    label: 'ULTRA HD QUALITY', icon: '💎' },
  { num: '2.4M',  label: 'ACTIVE VIEWERS',   icon: '👥' },
  { num: '140+',  label: 'COUNTRIES SERVED', icon: '🌍' },
];

export function StatsBar() {
  return (
    <section className="px-12 pb-32">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map(({ num, label, icon }) => (
          <div 
            key={label} 
            className="group relative p-8 rounded-3xl bg-white/2 border border-white/5 hover:border-[--flx-purple]/30 transition-all duration-500 overflow-hidden"
          >
            {/* Hover Glow */}
            <div className="absolute -inset-24 bg-[--flx-purple]/10 blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            
            <div className="relative z-10">
              <span className="inline-block mb-3 opacity-80">{icon}</span>
              <p className="font-bebas text-[58px] leading-none tracking-tight bg-linear-to-b from-white to-white/40 bg-clip-text text-transparent mb-2">
                {num}
              </p>
              <p className="text-[10px] tracking-[3px] font-bold text-[--flx-text-3] group-hover:text-[--flx-text-2] transition-colors">
                {label}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
