'use client';

import { RefreshCw, ShieldAlert } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body className="bg-[#090514] min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-700">
          <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
            <div className="absolute inset-0 bg-red-500/20 rounded-[32px] animate-pulse" />
            <div className="relative w-16 h-16 bg-red-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-red-500/40">
              <ShieldAlert size={32} className="text-white" />
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="font-bebas text-5xl text-white tracking-wide uppercase leading-none">
              Fatal Core <span className="text-red-500">Collapse</span>
            </h1>
            <p className="text-[13px] text-white/40 font-bold uppercase tracking-[3px] leading-relaxed">
              A critical failure has occurred at the application root. The cinematic environment has been compromised.
            </p>
          </div>

          <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
            <p className="font-mono text-[9px] text-red-400/60 break-all">
              DIGEST_ID: {error.digest || 'ROOT_STREAMS_LOST'}
            </p>
          </div>

          <button
            onClick={() => reset()}
            className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-white text-black font-black text-[14px] uppercase tracking-[2px] hover:bg-white/90 transition-all active:scale-95 shadow-xl shadow-white/5"
          >
            <RefreshCw size={18} />
            Reinitialize Environment
          </button>

          <p className="text-[9px] font-black uppercase tracking-[5px] text-white/10">
            Emergency Recovery Protocol • Flixora Core
          </p>
        </div>
      </body>
    </html>
  );
}
