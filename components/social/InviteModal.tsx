'use client';

import { useState, useEffect } from 'react';
import { X, Search, UserPlus, Check, Link as LinkIcon, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getFriends } from '@/lib/supabase/actions/social';
import { inviteToWatchParty } from '@/lib/supabase/actions/watch-parties';
import type { Profile } from '@/types/supabase';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface InviteModalProps {
  partyId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function InviteModal({ partyId, isOpen, onClose }: InviteModalProps) {
  const [friends, setFriends] = useState<Profile[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [invitedIds, setInvitedIds] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchFriends = async () => {
        setIsLoading(true);
        const data = await getFriends();
        setFriends(data as unknown as Profile[]);
        setIsLoading(false);
      };
      fetchFriends();
    }
  }, [isOpen]);

  const filteredFriends = friends.filter(f => 
    f.username?.toLowerCase().includes(search.toLowerCase())
  );

  const handleInvite = async (friendId: string) => {
    if (invitedIds.has(friendId)) return;
    
    try {
      await inviteToWatchParty(partyId, friendId);
      setInvitedIds(prev => new Set(prev).add(friendId));
    } catch (error) {
      console.error('Failed to invite friend:', error);
    }
  };

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/party/${partyId}` : '';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-[--flx-surface-1] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-white uppercase tracking-tight">Invite Friends</h2>
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-[2px]">Share the experience</p>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/5 rounded-full text-white/40 hover:text-white transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Link Copy Section */}
            <div className="p-6 bg-white/5 border-b border-white/5">
               <div className="flex items-center gap-3 p-3 bg-black/40 rounded-2xl border border-white/5">
                 <div className="p-2 bg-[--flx-purple]/20 rounded-xl text-[--flx-purple]">
                    <LinkIcon size={16} />
                 </div>
                 <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-0.5">Party Link</p>
                    <p className="text-xs text-white/60 truncate">{shareUrl}</p>
                 </div>
                 <button 
                   onClick={handleCopyLink}
                   className={cn(
                     "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                     copied ? "bg-green-500/20 text-green-500" : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                   )}
                 >
                   {copied ? <Check size={14} /> : 'Copy'}
                 </button>
               </div>
            </div>

            {/* Friends List */}
            <div className="p-6 space-y-4">
               <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                  <input 
                    type="text"
                    placeholder="Search friends..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/5 rounded-2xl text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[--flx-purple]/50 transition-all"
                  />
               </div>

               <div className="max-h-64 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                  {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-10 gap-3">
                       <Loader2 className="w-6 h-6 animate-spin text-[--flx-purple]" />
                       <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Finding friends...</span>
                    </div>
                  ) : filteredFriends.length > 0 ? (
                    filteredFriends.map((friend) => (
                      <div 
                        key={friend.id}
                        className="flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/5 transition-all"
                      >
                         <div className="flex items-center gap-3">
                            <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-white/10 bg-[--flx-surface-2]">
                               <Image 
                                 src={friend.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${friend.username}`}
                                 alt={friend.username || ''}
                                 fill
                                 className="object-cover"
                               />
                            </div>
                            <div>
                               <p className="text-sm font-bold text-white">{friend.username}</p>
                               <p className="text-[10px] text-white/40 uppercase tracking-widest">Friend</p>
                            </div>
                         </div>
                         <button 
                           onClick={() => handleInvite(friend.id)}
                           disabled={invitedIds.has(friend.id)}
                           className={cn(
                             "p-2 rounded-xl transition-all",
                             invitedIds.has(friend.id) 
                               ? "bg-green-500/10 text-green-500 cursor-default" 
                               : "bg-[--flx-purple]/10 text-[--flx-purple] hover:bg-[--flx-purple] hover:text-white"
                           )}
                         >
                           {invitedIds.has(friend.id) ? <Check size={18} /> : <UserPlus size={18} />}
                         </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10">
                       <p className="text-xs text-white/20 font-medium">No friends found.</p>
                    </div>
                  )}
               </div>
            </div>

            {/* Footer */}
            <div className="p-6 bg-white/5 border-t border-white/5 text-center">
               <p className="text-[10px] font-medium text-white/30 italic">
                 Friends will receive a notification to join your party.
               </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
