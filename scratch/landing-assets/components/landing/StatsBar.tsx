const STATS = [
  { num: '50K+',  label: 'Titles available'  },
  { num: '4K',    label: 'Ultra HD quality'  },
  { num: '2.4M',  label: 'Active viewers'    },
  { num: '140+',  label: 'Countries served'  },
];

export function StatsBar() {
  return (
    <div className="px-12 pb-20">
      <div className="grid grid-cols-2 md:grid-cols-4 border border-white/6 rounded-2xl overflow-hidden divide-x divide-white/6">
        {STATS.map(({ num, label }) => (
          <div key={label} className="py-9 px-7 text-center bg-[--flx-bg]">
            <p className="font-['Bebas_Neue',sans-serif] text-[52px] leading-none tracking-wide bg-gradient-to-r from-[--flx-cyan] to-[--flx-purple] bg-clip-text text-transparent mb-1.5">
              {num}
            </p>
            <p className="text-[12px] text-[--flx-text-3] tracking-wide">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
