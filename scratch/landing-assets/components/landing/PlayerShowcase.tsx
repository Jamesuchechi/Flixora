const CAPABILITY_TAGS = [
  { label: 'Keyboard shortcuts', color: 'border-[--flx-purple]/30 text-violet-300 bg-[--flx-purple]/10' },
  { label: 'Auto-advance',       color: 'border-[--flx-cyan]/25 text-cyan-300 bg-[--flx-cyan]/8'        },
  { label: '4K + HDR',           color: 'border-[--flx-gold]/20 text-yellow-300 bg-[--flx-gold]/8'      },
  { label: 'Dolby Atmos',        color: 'border-[--flx-pink]/25 text-pink-300 bg-[--flx-pink]/8'        },
];

const QUEUE = ['🦇', '🌌', '💣'];

export function PlayerShowcase() {
  return (
    <section className="px-12 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left — text */}
        <div>
          <p className="text-[11px] tracking-[2.5px] uppercase text-[--flx-purple] font-semibold mb-3">The Player</p>
          <h2 className="font-['Bebas_Neue',sans-serif] text-[clamp(36px,5vw,52px)] tracking-[1.5px] mb-4">
            Watch the Way<br />You Want
          </h2>
          <p className="text-[15px] text-[--flx-text-2] font-light leading-relaxed mb-7 max-w-[440px]">
            Cinematic player with keyboard shortcuts, auto-advance, progress sync across devices, and full-screen 4K with Dolby audio.
          </p>
          <div className="flex flex-wrap gap-2">
            {CAPABILITY_TAGS.map(({ label, color }) => (
              <span key={label} className={`px-3.5 py-1.5 rounded-full text-[11px] font-medium border ${color}`}>
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Right — mini player mockup */}
        <div className="bg-[--flx-surface-1] border border-white/6 rounded-2xl p-6 space-y-4">
          {/* Player */}
          <div className="bg-[--flx-surface-2] rounded-xl overflow-hidden">
            <div className="h-[130px] bg-gradient-to-br from-[#1a0535] to-[#0d2040] flex items-center justify-center text-4xl relative">
              🏜️
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <div className="w-10 h-10 rounded-full bg-[--flx-purple]/90 flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                </div>
              </div>
            </div>
            {/* Progress */}
            <div className="mx-3 mt-3 mb-2 h-[3px] bg-white/10 rounded-full">
              <div className="h-full w-[42%] bg-gradient-to-r from-[--flx-purple] to-[--flx-cyan] rounded-full" />
            </div>
            <div className="flex items-center justify-between px-3 pb-3">
              <span className="text-[12px] font-medium text-[--flx-text-1]">Dune: Part Two</span>
              <span className="text-[10px] text-[--flx-text-3]">1:14:22 / 2:46:00</span>
            </div>
          </div>

          {/* Queue */}
          <p className="text-[11px] text-[--flx-text-3] tracking-wide">Up next</p>
          <div className="flex gap-2.5">
            {QUEUE.map((emoji, i) => (
              <div
                key={i}
                className="flex-1 h-[72px] rounded-lg bg-gradient-to-br from-[#1a0535] to-[#0d1a3b] flex items-center justify-center text-2xl cursor-pointer hover:scale-105 transition-transform"
              >
                {emoji}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
