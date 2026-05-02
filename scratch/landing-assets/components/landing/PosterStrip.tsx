const POSTERS = [
  { emoji: '🏜️', rating: '8.8', bg: 'from-[#1a0535] to-[#0d1a3b]' },
  { emoji: '🦇', rating: '9.0', bg: 'from-[#200515] to-[#3b0a0a]' },
  { emoji: '🌌', rating: '8.7', bg: 'from-[#051a1a] to-[#0a2a1a]' },
  { emoji: '💣', rating: '8.1', bg: 'from-[#1a1505] to-[#3b2a05]' },
  { emoji: '🔮', rating: '7.9', bg: 'from-[#0a0520] to-[#1a0a35]' },
  { emoji: '🐉', rating: '8.5', bg: 'from-[#1a0a0a] to-[#2a1505]' },
  { emoji: '🧪', rating: '9.0', bg: 'from-[#051a0a] to-[#0a3b1a]' },
  { emoji: '🕷️', rating: '7.4', bg: 'from-[#200a1a] to-[#3b0a2a]' },
  { emoji: '💍', rating: '9.0', bg: 'from-[#1a0535] to-[#0d1a3b]' },
  { emoji: '👊', rating: '7.2', bg: 'from-[#051a1a] to-[#0a2a1a]' },
  { emoji: '🤖', rating: '8.8', bg: 'from-[#1a1505] to-[#3b2a05]' },
  { emoji: '👾', rating: '7.3', bg: 'from-[#200515] to-[#3b0a0a]' },
];

export function PosterStrip() {
  return (
    <div className="relative px-12 pb-20 overflow-hidden">
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-[--flx-bg] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[--flx-bg] to-transparent z-10 pointer-events-none" />

      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {POSTERS.map((p, i) => (
          <div
            key={i}
            className="flex-shrink-0 w-[120px] rounded-xl overflow-hidden relative cursor-pointer transition-transform duration-200 hover:-translate-y-1.5 hover:scale-[1.03]"
          >
            <div className={`w-full h-[180px] bg-gradient-to-br ${p.bg} flex items-center justify-center text-4xl`}>
              {p.emoji}
            </div>
            <span className="absolute bottom-2 left-2.5 text-[10px] font-semibold text-[--flx-gold]">
              ★ {p.rating}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
