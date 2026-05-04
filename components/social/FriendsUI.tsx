'use client';

import { useState } from 'react';
import { Search, UserMinus, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Profile } from '@/types/supabase';
import Image from 'next/image';
import Link from 'next/link';
import { removeFriendship } from '@/lib/supabase/actions/social';

interface FriendsListProps {
  initialFriends: Profile[];
}

export function FriendsUI({ initialFriends }: FriendsListProps) {
  const [friends, setFriends] = useState<Profile[]>(initialFriends);
  const [search, setSearch] = useState('');
  const [isRemoving, setIsRemoving] = useState<string | null>(null);

  const filteredFriends = friends.filter(f => 
    f.username?.toLowerCase().includes(search.toLowerCase())
  );

  const handleUnfriend = async (friendId: string) => {
    if (!confirm('Are you sure you want to remove this friend?')) return;
    
    try {
      setIsRemoving(friendId);
      await removeFriendship(friendId);
      setFriends(prev => prev.filter(f => f.id !== friendId));
    } catch (error) {
      console.error('Failed to remove friend:', error);
    } finally {
      setIsRemoving(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
        <input 
          type="text"
          placeholder="Search friends by username..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/20 focus:outline-none focus:border-[--flx-purple]/50 transition-all"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredFriends.length > 0 ? (
            filteredFriends.map((friend) => (
              <motion.div
                key={friend.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="group relative bg-white/5 border border-white/10 rounded-[32px] p-6 hover:bg-white/10 transition-all shadow-xl hover:shadow-[--flx-purple]/5"
              >
                <div className="flex items-center gap-4">
                  <Link href={`/u/${friend.username}`} className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-white/5 bg-[--flx-surface-2]">
                    <Image 
                      src={friend.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${friend.username}`}
                      alt={friend.username || ''}
                      fill
                      className="object-cover"
                    />
                  </Link>

                  <div className="flex-1 min-w-0">
                    <Link href={`/u/${friend.username}`} className="text-lg font-black text-white hover:text-[--flx-purple] transition-colors truncate block">
                      {friend.username}
                    </Link>
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Active Connection</p>
                  </div>

                  <div className="flex items-center gap-1">
                     <button 
                       onClick={() => handleUnfriend(friend.id)}
                       disabled={isRemoving === friend.id}
                       className="p-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all disabled:opacity-50"
                       title="Remove Friend"
                     >
                        {isRemoving === friend.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserMinus size={18} />}
                     </button>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
                   <div className="flex gap-4">
                      <div className="flex flex-col">
                         <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Joined</span>
                         <span className="text-xs font-bold text-white/60">
                           {new Date(friend.created_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                         </span>
                      </div>
                   </div>

                   <Link 
                     href={`/u/${friend.username}`}
                     className="px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-white transition-all"
                   >
                     View Profile
                   </Link>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center">
               <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
                  <Search className="text-white/20" size={24} />
               </div>
               <h3 className="text-xl font-bold text-white/40 uppercase tracking-tight">No friends found</h3>
               <p className="text-sm text-white/20">Try searching for a different username.</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
