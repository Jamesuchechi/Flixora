'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { UserPlus, UserCheck, MessageSquare, ShieldCheck, MapPin, Calendar } from 'lucide-react';
import type { Profile } from '@/types/supabase';

interface ProfileHeaderProps {
  profile: Profile;
  isOwnProfile?: boolean;
  isFriend?: boolean;
  onFollow?: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profile,
  isOwnProfile = false,
  isFriend = false,
  onFollow
}) => {
  return (
    <div className="relative w-full">
      {/* Cover Image */}
      <div className="h-64 md:h-80 w-full relative overflow-hidden bg-[--flx-surface-1]">
        {profile.cover_url ? (
          <Image
            src={profile.cover_url}
            alt="Cover"
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="w-full h-full bg-linear-to-br from-[--flx-purple-d] via-[--flx-surface-2] to-[--flx-bg] animate-banner" />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-[--flx-bg] via-transparent to-transparent" />
      </div>

      {/* Profile Info Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
            {/* Avatar */}
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative w-40 h-40 rounded-3xl p-1 bg-linear-to-br from-[--flx-purple] to-[--flx-cyan] shadow-2xl"
            >
              <div className="w-full h-full rounded-[22px] overflow-hidden bg-[--flx-bg]">
                <Image
                  src={profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`}
                  alt={profile.username || 'User'}
                  width={160}
                  height={160}
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Online Indicator (Placeholder for now) */}
              <div className="absolute bottom-2 right-2 w-5 h-5 bg-green-500 border-4 border-[--flx-bg] rounded-full animate-pulse" />
            </motion.div>

            {/* User Text Info */}
            <div className="flex-1 text-center md:text-left mb-2">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                  {profile.username}
                </h1>
                <ShieldCheck className="w-6 h-6 text-[--flx-purple]" />
              </div>
              <p className="text-[--flx-text-2] text-lg max-w-md line-clamp-2 mb-4">
                {profile.bio || "No bio yet. This cinephile prefers to let their watchlist do the talking."}
              </p>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-[--flx-text-3]">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  Joined {new Date(profile.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                </div>
                {/* Mock data for location/link for now since they aren't in schema yet, but UI is robust */}
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  Cinema City
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 self-center md:self-end mb-2">
            {!isOwnProfile ? (
              <>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onFollow}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold transition-all ${
                    isFriend 
                      ? 'bg-[--flx-surface-2] text-white border border-[--flx-border]' 
                      : 'bg-white text-[--flx-bg] hover:bg-opacity-90'
                  }`}
                >
                  {isFriend ? (
                    <>
                      <UserCheck className="w-5 h-5" />
                      Friends
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-5 h-5" />
                      Add Friend
                    </>
                  )}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2.5 rounded-xl bg-[--flx-surface-2] text-white border border-[--flx-border] hover:bg-[--flx-surface-3]"
                >
                  <MessageSquare className="w-5 h-5" />
                </motion.button>
              </>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-2.5 rounded-xl bg-[--flx-surface-2] text-white border border-[--flx-border] font-semibold hover:bg-[--flx-surface-3]"
              >
                Edit Profile
              </motion.button>
            )}
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex gap-8 mt-8 border-t border-[--flx-border] pt-6 overflow-x-auto scrollbar-hide">
          <div className="text-center md:text-left min-w-max">
            <div className="text-2xl font-bold text-white">124</div>
            <div className="text-sm text-[--flx-text-3] uppercase tracking-wider">Movies Watched</div>
          </div>
          <div className="text-center md:text-left min-w-max">
            <div className="text-2xl font-bold text-white">42</div>
            <div className="text-sm text-[--flx-text-3] uppercase tracking-wider">Series Completed</div>
          </div>
          <div className="text-center md:text-left min-w-max">
            <div className="text-2xl font-bold text-white">1.2k</div>
            <div className="text-sm text-[--flx-text-3] uppercase tracking-wider">Friends</div>
          </div>
          <div className="text-center md:text-left min-w-max">
            <div className="text-2xl font-bold text-white">8.4</div>
            <div className="text-sm text-[--flx-text-3] uppercase tracking-wider">Avg Rating</div>
          </div>
        </div>
      </div>
    </div>
  );
};
