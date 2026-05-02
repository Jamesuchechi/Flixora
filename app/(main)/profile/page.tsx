'use client';

import { useStore } from '@/store/useStore';
import Link from 'next/link';
import { cn } from '@/lib/utils';

/**
 * Premium User Profile and Watchlist Management Page.
 */
export default function ProfilePage() {
  const watchlist = useStore((s) => s.watchlist);

  return (
    <div className="min-h-screen px-6 md:px-12 py-12 pb-24">
      
      {/* ── USER IDENTITY HEADER ── */}
      <header className="flex flex-col md:flex-row items-center md:items-end gap-6 mb-12 animate-fade-up">
        {/* Avatar with Glow */}
        <div className="relative group">
          <div className="absolute inset-0 bg-linear-to-br from-[--flx-purple] to-[--flx-cyan] rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-opacity" />
          <div className="relative w-24 h-24 rounded-full bg-linear-to-br from-[--flx-purple] to-[--flx-cyan] flex items-center justify-center text-3xl font-bebas text-white shadow-2xl border-4 border-[--flx-bg]">
            JD
          </div>
        </div>
        
        <div className="text-center md:text-left space-y-1">
          <h1 className="font-bebas text-5xl tracking-[3px] text-[--flx-text-1] uppercase leading-none">John Doe</h1>
          <div className="flex items-center justify-center md:justify-start gap-3">
             <p className="text-[11px] font-bold text-[--flx-text-3] uppercase tracking-[2px]">Premium Member</p>
             <div className="w-1 h-1 rounded-full bg-white/10" />
             <p className="text-[11px] font-bold text-[--flx-cyan] uppercase tracking-[2px]">john@example.com</p>
          </div>
        </div>
        
        <div className="flex-1" />
        
        <button className="px-6 py-2.5 rounded-xl bg-white/5 border border-white/5 text-[11px] font-bold uppercase tracking-widest text-[--flx-text-2] hover:bg-white/10 hover:text-white transition-all cursor-pointer">
          Edit Profile
        </button>
      </header>

      {/* ── STATS DASHBOARD ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mb-20 animate-fade-up" style={{ animationDelay: '0.1s' }}>
        {[
          { label: 'Watchlist', value: watchlist.length, color: 'text-[--flx-purple]' },
          { label: 'Watched',   value: 0,              color: 'text-[--flx-cyan]'   },
          { label: 'Avg Rating', value: '4.8',          color: 'text-[--flx-gold]'   },
        ].map(({ label, value, color }, i) => (
          <div key={label} className="relative group animate-fade-up" style={{ animationDelay: `${i * 100}ms` }}>
            <div className="absolute inset-0 bg-white/5 rounded-2xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative bg-linear-to-b from-white/5 to-transparent border border-white/5 rounded-[24px] p-6 text-center backdrop-blur-sm transition-transform duration-300 group-hover:-translate-y-1">
              <p className={cn("font-bebas text-4xl mb-1", color)}>{value}</p>
              <p className="text-[10px] font-bold text-[--flx-text-3] uppercase tracking-[2px]">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── WATCHLIST SECTION ── */}
      <section className="space-y-8 animate-fade-up" style={{ animationDelay: '0.2s' }}>
        <div className="flex items-center gap-4">
          <h2 className="font-bebas text-3xl tracking-[3px] text-[--flx-text-1] uppercase">My Watchlist</h2>
          <div className="h-px flex-1 bg-linear-to-r from-white/10 to-transparent" />
        </div>

        {watchlist.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center space-y-6 bg-white/2 rounded-[32px] border border-dashed border-white/10">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-[--flx-text-3]">
               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 21.23l-7.78-7.78a5.5 5.5 0 1 1 7.78-7.78l1.06 1.06 1.06-1.06a5.5 5.5 0 0 1 7.78 7.78l-7.78 7.78z" /></svg>
            </div>
            <div className="space-y-2">
              <p className="text-base font-medium text-[--flx-text-2]">Your list is waiting for its first title.</p>
              <Link href="/movies" className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[--flx-cyan] hover:opacity-70 transition-opacity">
                Start Browsing <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14m-7-7 7 7-7 7" /></svg>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-6">
            {watchlist.map((id, i) => (
              <Link 
                key={id} 
                href={`/movies/${id}`} 
                className="group animate-fade-up"
                style={{ animationDelay: `${i * 30}ms` }}
              >
                <div className="relative aspect-2/3 rounded-2xl overflow-hidden bg-[--flx-surface-2] border border-white/5 transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] group-hover:border-[--flx-purple]/30">
                  {/* Placeholder for when real data isn't synced yet */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-linear-to-br from-[--flx-surface-1] to-[--flx-surface-3] text-center p-4">
                     <p className="text-[10px] font-bold text-[--flx-text-3] uppercase tracking-widest mb-1">ID #{id}</p>
                     <p className="text-[13px] font-bebas text-white/40 leading-tight">Syncing Meta...</p>
                  </div>
                  
                  {/* Hover Quick Action */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                    <div className="w-12 h-12 rounded-full bg-[--flx-purple] flex items-center justify-center shadow-xl shadow-[--flx-purple]/40 active:scale-90 transition-transform">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                    </div>
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-[12px] font-bold text-[--flx-text-2] uppercase tracking-tighter truncate group-hover:text-white transition-colors">
                    Movie Reference #{id}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
