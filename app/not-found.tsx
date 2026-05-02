import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';

/**
 * Premium Custom 404 Page for Flixora.
 */
export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 relative overflow-hidden bg-[--flx-bg]">
      
      {/* Background Atmosphere */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute w-[800px] h-[600px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[--flx-purple]/10 blur-[150px] animate-aurora" />
        <div className="absolute w-[600px] h-[400px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[--flx-cyan]/5 blur-[120px] animate-aurora" style={{ animationDelay: '-3s' }} />
      </div>

      {/* 404 Content */}
      <div className="relative z-10 space-y-8 animate-fade-up">
        <Badge variant="muted" className="px-4 py-1.5 border-white/10 tracking-[4px]">Error 404</Badge>
        
        <div className="space-y-2">
          <h1 className="font-bebas text-[140px] md:text-[200px] leading-none tracking-tight bg-linear-to-b from-white via-white/80 to-white/20 bg-clip-text text-transparent select-none">
            Lost
          </h1>
          <p className="text-[13px] uppercase tracking-[3px] font-bold text-[--flx-text-3] max-w-xs mx-auto leading-relaxed">
            The title you are looking for has drifted out of range.
          </p>
        </div>

        <div className="pt-4">
          <Link
            href="/"
            className="inline-flex items-center gap-3 bg-[--flx-purple] hover:bg-[--flx-purple-d] text-white font-bold text-xs uppercase tracking-widest px-10 py-4 rounded-2xl transition-all shadow-xl shadow-[--flx-purple]/20 active:scale-95 group"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="group-hover:-translate-x-1 transition-transform">
              <path d="M19 12H5m7-7-7 7 7 7" />
            </svg>
            Return to Base
          </Link>
        </div>
      </div>

      {/* Decorative lines */}
      <div className="absolute bottom-10 left-10 right-10 flex items-center justify-between opacity-10">
         <div className="h-px w-24 bg-white" />
         <span className="font-bebas text-xs tracking-widest text-white uppercase">Flixora Orbital</span>
         <div className="h-px w-24 bg-white" />
      </div>
    </div>
  );
}
