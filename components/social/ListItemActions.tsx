'use client';

import { ArrowBigUp, ArrowBigDown } from 'lucide-react';
import { voteOnListItem } from '@/lib/supabase/actions/lists';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface ListItemActionsProps {
  listId: string;
  tmdbId: number;
  mediaType: string;
  initialScore: number;
  initialUserVote: number;
}

export function ListItemActions({ listId, tmdbId, mediaType, initialScore, initialUserVote }: ListItemActionsProps) {
  const [score, setScore] = useState(initialScore);
  const [userVote, setUserVote] = useState(initialUserVote);
  const [isLoading, setIsLoading] = useState(false);

  const handleVote = async (vote: 1 | -1) => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      // Toggle vote
      const newVote = userVote === vote ? 0 : vote;
      // We don't actually have a "0" vote in DB yet, but upserting same vote is fine.
      // For simplicity, let's just send the vote.
      await voteOnListItem(listId, tmdbId, mediaType, newVote);
      
      const diff = newVote - userVote;
      setScore(prev => prev + diff);
      setUserVote(newVote);
    } catch (error) {
      console.error('Failed to vote:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-1 bg-black/40 backdrop-blur-md rounded-2xl p-2 border border-white/10 group-hover:border-[--flx-cyan]/30 transition-colors">
       <button 
         onClick={(e) => { e.preventDefault(); handleVote(1); }}
         className={cn(
           "p-1 rounded-lg transition-all",
           userVote === 1 ? "text-[--flx-cyan] bg-[--flx-cyan]/10 scale-110" : "text-white/40 hover:text-white"
         )}
       >
          <ArrowBigUp size={24} fill={userVote === 1 ? "currentColor" : "none"} />
       </button>
       <span className={cn(
         "text-xs font-black tracking-tighter",
         score > 0 ? "text-[--flx-cyan]" : score < 0 ? "text-red-500" : "text-white/40"
       )}>
          {score > 0 ? `+${score}` : score}
       </span>
       <button 
         onClick={(e) => { e.preventDefault(); handleVote(-1); }}
         className={cn(
           "p-1 rounded-lg transition-all",
           userVote === -1 ? "text-red-500" : "text-white/40 hover:text-white"
         )}
       >
          <ArrowBigDown size={24} fill={userVote === -1 ? "currentColor" : "none"} />
       </button>
    </div>
  );
}
