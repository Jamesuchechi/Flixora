'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

/**
 * Global Error Page with cinematic Flixora branding.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('System Failure:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[--flx-bg] flex flex-col items-center justify-center p-6 text-center">
      <div className="relative mb-10">
        <div className="absolute inset-0 bg-[--flx-purple] blur-[100px] opacity-20 animate-pulse" />
        <div className="relative w-32 h-32 rounded-[40px] bg-white/5 border border-white/10 flex items-center justify-center text-red-500 shadow-2xl">
           <AlertCircle size={64} strokeWidth={1.5} />
        </div>
      </div>

      <div className="space-y-4 max-w-md relative z-10">
        <h1 className="font-bebas text-6xl md:text-7xl text-white tracking-tighter uppercase leading-none">
          System <span className="text-red-500">Breach</span>
        </h1>
        <p className="text-[11px] font-black uppercase tracking-[4px] text-white/40">
          A critical error has occurred in the cinematic stream.
        </p>
        <div className="p-6 rounded-3xl bg-white/3 border border-white/5 font-mono text-[10px] text-red-400/80 break-all leading-relaxed">
           ERROR_DIGEST: {error.digest || 'UNKNOWN_FRAGMENT'}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4 mt-12">
        <Button onClick={() => reset()} className="group">
           <RefreshCw size={18} className="group-active:rotate-180 transition-transform" />
           Restart Session
        </Button>
        <Link href="/">
           <Button variant="secondary" className="group">
              <Home size={18} />
              Return Home
           </Button>
        </Link>
      </div>

      <div className="fixed bottom-10 left-0 right-0">
         <p className="text-[9px] font-black uppercase tracking-[5px] text-white/10">
            Internal Core Fragment // 0xCC-404
         </p>
      </div>
    </div>
  );
}
