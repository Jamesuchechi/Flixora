'use client';

import { useState } from 'react';
import { Shield, ShieldOff, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Profile } from '@/types/supabase';
import Image from 'next/image';
import { unblockUser } from '@/lib/supabase/actions/social';

interface BlockListProps {
  initialBlocked: Profile[];
}

export function BlockList({ initialBlocked }: BlockListProps) {
  const [blocked, setBlocked] = useState<Profile[]>(initialBlocked);
  const [isUnblocking, setIsUnblocking] = useState<string | null>(null);

  const handleUnblock = async (userId: string) => {
    try {
      setIsUnblocking(userId);
      await unblockUser(userId);
      setBlocked(prev => prev.filter(u => u.id !== userId));
    } catch (error) {
      console.error('Failed to unblock user:', error);
    } finally {
      setIsUnblocking(null);
    }
  };

  if (blocked.length === 0) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-[32px] p-12 text-center">
         <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="text-white/20" size={24} />
         </div>
         <p className="text-sm text-white/40 font-medium uppercase tracking-widest">Your block list is empty</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      <AnimatePresence mode="popLayout">
        {blocked.map((user) => (
          <motion.div
            key={user.id}
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl group hover:bg-white/10 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-white/5 bg-[--flx-surface-2]">
                <Image 
                  src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                  alt={user.username || ''}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <p className="text-sm font-black text-white">{user.username}</p>
                <p className="text-[10px] text-white/40 uppercase tracking-widest">Blocked</p>
              </div>
            </div>

            <button
              onClick={() => handleUnblock(user.id)}
              disabled={isUnblocking === user.id}
              className="flex items-center gap-2 px-6 py-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
            >
              {isUnblocking === user.id ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <ShieldOff size={14} />
              )}
              <span>Unblock</span>
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
