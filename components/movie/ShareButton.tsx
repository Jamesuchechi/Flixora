'use client';

import { useState } from 'react';
import { Share2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/useToast';

export function ShareButton() {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast({ message: 'Link copied to clipboard', type: 'success' });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
      toast({ message: 'Could not copy link', type: 'error' });
    }
  };

  return (
    <button
      onClick={handleShare}
      className={cn(
        "w-full flex items-center justify-center gap-3 px-6 py-3 rounded-xl border transition-all duration-300 font-bold text-xs uppercase tracking-[2px]",
        copied
          ? "bg-green-500/10 border-green-500/30 text-green-400"
          : "bg-white/5 border-white/10 text-[--flx-text-2] hover:bg-white/10 hover:border-white/20 hover:text-white"
      )}
    >
      {copied ? (
        <>
          <Check size={16} />
          Copied!
        </>
      ) : (
        <>
          <Share2 size={16} />
          Share Title
        </>
      )}
    </button>
  );
}
