'use client';
// PartyContainer: Handles client-side watch party logic

import { useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { Share2, Info, UserPlus } from 'lucide-react';
import { VideoPlayer } from '@/components/watch/VideoPlayer';
import { PartyChat } from '@/components/watch/PartyChat';
import { InviteModal } from '@/components/social/InviteModal';
import type { TMDBMovie, TMDBTVShow } from '@/types/tmdb';
import type { Profile, WatchParty, PartyParticipant } from '@/types/supabase';
import Image from 'next/image';

import { HostControls } from '@/components/social/HostControls';
import { useRouter } from 'next/navigation';

interface PartyContainerProps {
  party: WatchParty & { is_locked: boolean };
  currentUser: User; 
  participants: (PartyParticipant & { user: Profile })[];
  media: TMDBMovie | TMDBTVShow;
  title: string;
  isHost: boolean;
}

export function PartyUI({ 
  party, 
  currentUser, 
  participants, 
  media, 
  title, 
  isHost
}: PartyContainerProps) {
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const router = useRouter();

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[--flx-bg]">
      <InviteModal 
        partyId={party.id} 
        isOpen={isInviteModalOpen} 
        onClose={() => setIsInviteModalOpen(false)} 
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col p-4 lg:p-8 gap-6 overflow-y-auto">
        {/* Party Info Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Live Watch Party {party.is_locked && '• Locked'}</span>
            </div>
            <h1 className="text-2xl font-black text-white uppercase tracking-tight">
              Watching {title}
            </h1>
          </div>

          <div className="flex items-center gap-4">
             <div className="flex -space-x-3">
                {participants.slice(0, 5).map((p) => {
                  const userProfile = p.user as unknown as Profile;
                  return (
                    <div key={p.user_id} className="relative w-10 h-10 rounded-xl border-2 border-[--flx-bg] overflow-hidden bg-[--flx-surface-2]">
                      <Image
                        src={userProfile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userProfile.username}`}
                        alt={userProfile.username || 'User'}
                        fill
                        className="object-cover"
                      />
                    </div>
                  );
                })}
                {participants.length > 5 && (
                  <div className="w-10 h-10 rounded-xl border-2 border-[--flx-bg] bg-[--flx-surface-2] flex items-center justify-center text-[10px] font-bold text-white">
                    +{participants.length - 5}
                  </div>
                )}
             </div>
             
             <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsInviteModalOpen(true)}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[--flx-purple] text-white text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-[--flx-purple]/20"
                >
                  <UserPlus size={16} />
                  <span>Invite</span>
                </button>
                {isHost && (
                  <HostControls 
                    partyId={party.id} 
                    participants={participants} 
                    isLocked={party.is_locked}
                    onUpdate={() => router.refresh()}
                  />
                )}
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Party link copied to clipboard!');
                  }}
                  className="p-3 rounded-xl bg-white/5 text-white/60 hover:text-white transition-all"
                >
                  <Share2 size={20} />
                </button>
             </div>
          </div>
        </div>

        {/* Video Player */}
        <div className="w-full">
           <VideoPlayer 
              tmdbId={party.tmdb_id}
              mediaType={party.media_type as 'movie' | 'tv'}
              title={title}
              backdrop={media.backdrop_path || ''}
              posterPath={media.poster_path || ''}
              partyId={party.id}
              isHost={isHost}
              rating={media.vote_average}
           />
        </div>

        {/* Media Details Summary */}
        <div className="bg-white/5 border border-white/5 rounded-3xl p-6">
           <div className="flex items-center gap-2 mb-4 text-[--flx-purple]">
              <Info size={16} />
              <h3 className="text-xs font-black uppercase tracking-widest">Film Info</h3>
           </div>
           <p className="text-[--flx-text-2] text-sm leading-relaxed">
             {media.overview}
           </p>
        </div>
      </div>

      {/* Right Sidebar - Chat */}
      <div className="w-full lg:w-96 lg:h-screen sticky top-0 shrink-0">
        <PartyChat partyId={party.id} currentUser={currentUser} />
      </div>
    </div>
  );
}
