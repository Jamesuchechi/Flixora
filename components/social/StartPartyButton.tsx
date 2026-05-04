'use client';

import { useState } from 'react';
import { Users, Loader2 } from 'lucide-react';
import { startWatchParty } from '@/lib/supabase/actions/watch-parties';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface StartPartyButtonProps {
  tmdbId: number;
  mediaType: 'movie' | 'tv';
  className?: string;
}

export function StartPartyButton({ tmdbId, mediaType, className }: StartPartyButtonProps) {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const handleStartParty = async () => {
    try {
      setIsPending(true);
      const party = await startWatchParty(tmdbId, mediaType);
      router.push(`/party/${party.id}`);
    } catch (error) {
      console.error('Failed to start party:', error);
      alert('Failed to start watch party. Please try again.');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <button
      onClick={handleStartParty}
      disabled={isPending}
      className={cn(
        "group flex items-center gap-3 bg-white/5 hover:bg-white/10 backdrop-blur-md text-white font-black text-[10px] uppercase tracking-[2px] px-8 py-5 rounded-[20px] border border-white/10 transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:pointer-events-none",
        className
      )}
    >
      {isPending ? (
        <Loader2 className="w-4 h-4 animate-spin text-[--flx-cyan]" />
      ) : (
        <Users className="w-4 h-4 text-[--flx-cyan] group-hover:scale-110 transition-transform" />
      )}
      <span>{isPending ? 'Starting...' : 'Watch Together'}</span>
    </button>
  );
}
