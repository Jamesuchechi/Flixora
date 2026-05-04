'use client';

import { useState } from 'react';
import { Settings, UserX, Crown, Lock, Unlock, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { kickParticipant, transferHost, updatePartySettings } from '@/lib/supabase/actions/social';
import { endWatchParty } from '@/lib/supabase/actions/watch-parties';
import { createClient } from '@/lib/supabase/client';
import type { Profile, PartyParticipant } from '@/types/supabase';
import Image from 'next/image';

interface HostControlsProps {
  partyId: string;
  participants: (PartyParticipant & { user: Profile })[];
  isLocked: boolean;
  onUpdate: () => void;
}

export function HostControls({ partyId, participants, isLocked, onUpdate }: HostControlsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleKick = async (userId: string) => {
    if (!confirm('Are you sure you want to kick this user?')) return;
    await kickParticipant(partyId, userId);
    onUpdate();
  };

  const handleTransfer = async (userId: string) => {
    if (!confirm('Transfer host privileges to this user? You will lose control.')) return;
    await transferHost(partyId, userId);
    onUpdate();
  };

  const toggleLock = async () => {
    await updatePartySettings(partyId, { is_locked: !isLocked });
    onUpdate();
  };

  const handleEndParty = async () => {
    if (!confirm('End this watch party for everyone?')) return;
    await endWatchParty(partyId);
    
    // Broadcast ended signal
    const supabase = createClient();
    const channel = supabase.channel(`party_sync:${partyId}`);
    channel.send({
      type: 'broadcast',
      event: 'ended',
      payload: {}
    });

    onUpdate();
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(true)}
        className="p-3 rounded-xl bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-all border border-white/5"
      >
        <Settings size={20} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-60"
            />
            <motion.div 
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              className="fixed top-0 right-0 h-screen w-full max-w-md bg-[--flx-surface-1] border-l border-white/10 shadow-2xl z-70 flex flex-col"
            >
              <div className="p-8 flex items-center justify-between border-b border-white/5">
                <div>
                  <h2 className="text-2xl font-black text-white uppercase tracking-tight">Host Controls</h2>
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">Manage your watch party</p>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-3 hover:bg-white/5 rounded-xl transition-all">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-10">
                {/* Party Status */}
                <section className="space-y-4">
                  <h3 className="text-[10px] font-black text-[--flx-cyan] uppercase tracking-widest">Party Settings</h3>
                  <button 
                    onClick={toggleLock}
                    className={`w-full flex items-center justify-between p-6 rounded-[24px] border transition-all ${isLocked ? 'bg-[--flx-purple]/10 border-[--flx-purple]/30 text-[--flx-purple]' : 'bg-white/5 border-white/10 text-white/60 hover:text-white'}`}
                  >
                    <div className="flex items-center gap-4">
                      {isLocked ? <Lock size={20} /> : <Unlock size={20} />}
                      <div className="text-left">
                        <p className="text-sm font-black uppercase tracking-wider">{isLocked ? 'Party Locked' : 'Party Public'}</p>
                        <p className="text-[10px] opacity-60">{isLocked ? 'Only invited friends can join' : 'Anyone with the link can join'}</p>
                      </div>
                    </div>
                    <div className={`w-12 h-6 rounded-full relative transition-colors ${isLocked ? 'bg-[--flx-purple]' : 'bg-white/10'}`}>
                       <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${isLocked ? 'left-7' : 'left-1'}`} />
                    </div>
                  </button>
                </section>

                {/* Participant Management */}
                <section className="space-y-4">
                  <h3 className="text-[10px] font-black text-[--flx-cyan] uppercase tracking-widest">Manage Members ({participants.length})</h3>
                  <div className="space-y-3">
                    {participants.map((p) => (
                      <div key={p.user_id} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl group">
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-[--flx-surface-2]">
                            <Image 
                              src={p.user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.user.username}`}
                              alt={p.user.username || ''}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">{p.user.username}</p>
                            <p className="text-[8px] font-black text-white/40 uppercase tracking-widest">Member</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleTransfer(p.user_id)}
                            title="Transfer Host"
                            className="p-2 hover:bg-[--flx-gold]/10 hover:text-[--flx-gold] rounded-lg transition-all"
                          >
                            <Crown size={16} />
                          </button>
                          <button 
                            onClick={() => handleKick(p.user_id)}
                            title="Kick Member"
                            className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-all"
                          >
                            <UserX size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              <div className="p-8 border-t border-white/5 bg-white/2">
                 <button 
                   onClick={handleEndParty}
                   className="w-full py-4 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 rounded-2xl text-[10px] font-black uppercase tracking-[3px] transition-all"
                 >
                    End Party for Everyone
                 </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
