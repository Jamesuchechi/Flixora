'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { saveReaction, getFriends } from '@/lib/supabase/actions/social';
import { useStore } from '@/store/useStore';
import { createClient } from '@/lib/supabase/client';

interface ReactionOverlayProps {
  tmdbId: number;
  currentTime: number;
}

const EMOJIS = ['😂', '😱', '😭', '🔥', '💀', '😍', '🍿', '💯'];
export const ReactionOverlay: React.FC<ReactionOverlayProps> = ({ tmdbId, currentTime }) => {
  const [activeReactions, setActiveReactions] = useState<{ id: number; emoji: string; xOffset: number }[]>([]);
  const visibility = useStore(s => s.preferences.reactionVisibility);
  const supabase = createClient();

  const triggerAnimation = useCallback((emoji: string) => {
    const id = Date.now() + Math.random();
    const xOffset = Math.random() * 200 - 100;
    setActiveReactions(prev => [...prev, { id, emoji, xOffset }]);
    setTimeout(() => {
      setActiveReactions(prev => prev.filter(r => r.id !== id));
    }, 2000);
  }, []);

  // Listen for real-time reactions
  useEffect(() => {
    if (visibility === 'hide') return;

    const channel = supabase
      .channel(`reactions_${tmdbId}`)
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'reactions', 
          filter: `tmdb_id=eq.${tmdbId}` 
        },
        async (payload) => {
          const newReaction = payload.new;
          
          // Filter by visibility
          if (visibility === 'friends') {
            const friends = await getFriends();
            const friendIds = new Set(friends.map(f => f.id));
            const { data: { user } } = await supabase.auth.getUser();
            if (newReaction.user_id !== user?.id && !friendIds.has(newReaction.user_id)) return;
          }

          // Show if within 5 seconds of current time (for semi-live feel)
          // Or just show everything that comes in while watching
          triggerAnimation(newReaction.emoji);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tmdbId, visibility, supabase, triggerAnimation]);

  const handleReaction = useCallback(async (emoji: string) => {
    saveReaction(tmdbId, emoji, currentTime);
    triggerAnimation(emoji);
  }, [tmdbId, currentTime, triggerAnimation]);

  return (
    <div className="absolute inset-0 pointer-events-none z-30">
      {/* Floating Reactions */}
      <AnimatePresence>
        {activeReactions.map((r) => (
          <motion.div
            key={r.id}
            initial={{ opacity: 0, y: 0, x: r.xOffset, scale: 0.5 }}
            animate={{ opacity: 1, y: -400, x: r.xOffset, scale: 2 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2, ease: "easeOut" }}
            className="absolute bottom-20 left-1/2 text-4xl"
          >
            {r.emoji}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Emoji Selector */}
      <div className="absolute bottom-8 right-8 pointer-events-auto flex items-center gap-2 p-2 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity">
        {EMOJIS.map((emoji) => (
          <motion.button
            key={emoji}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleReaction(emoji)}
            className="w-10 h-10 flex items-center justify-center text-xl hover:bg-white/10 rounded-xl transition-colors"
          >
            {emoji}
          </motion.button>
        ))}
      </div>
    </div>
  );
};
