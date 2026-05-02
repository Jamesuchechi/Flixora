export function TopBar() {
  return (
    <div className="flex items-center justify-between px-10 py-3.5 bg-[--flx-purple]/4 border-y border-[--flx-purple]/10 text-xs text-[--flx-text-3]">
      <div className="flex items-center gap-2">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="2">
          <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
        </svg>
        Updated <span className="text-[--flx-text-2] ml-1 font-medium">2 hours ago</span>
      </div>

      <div className="hidden sm:flex items-center gap-4">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[--flx-pink] animate-pulse-dot" />
          <span className="text-[--flx-text-2] font-medium">3 titles live now</span>
        </span>
        <span className="text-[--flx-text-3]/40">·</span>
        <span>New this week: <span className="text-[--flx-text-2] font-medium">24 movies · 8 series</span></span>
      </div>

      <div className="flex items-center gap-1.5">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
        Watchlist: <span className="text-[--flx-text-2] font-medium ml-1">12 saved</span>
      </div>
    </div>
  );
}
