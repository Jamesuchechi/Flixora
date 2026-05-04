'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { List, ChevronRight, Lock, Globe } from 'lucide-react';
import type { CustomList } from '@/types/supabase';

interface EnrichedCustomList extends CustomList {
  item_count?: number;
}

interface UserListsProps {
  lists: EnrichedCustomList[];
  isOwnProfile?: boolean;
}

export const UserLists: React.FC<UserListsProps> = ({ lists, isOwnProfile = false }) => {
  if (lists.length === 0 && !isOwnProfile) return null;

  return (
    <div className="flex-1">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <List className="w-5 h-5 text-[--flx-purple]" />
          <h2 className="text-xl font-bold text-white tracking-tight uppercase">Public Lists</h2>
        </div>
        <Link href="/lists" className="text-sm text-[--flx-text-3] hover:text-white transition-colors flex items-center gap-1">
          View All
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid gap-4">
        {lists.map((list, index) => (
          <motion.div
            key={list.id}
            initial={{ x: 20, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            viewport={{ once: true }}
            className="group block p-5 rounded-2xl bg-[--flx-surface-1] border border-[--flx-border] hover:border-[--flx-purple]/30 hover:bg-[--flx-surface-2] transition-all cursor-pointer"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white mb-1 group-hover:text-[--flx-purple] transition-colors">
                  {list.name}
                </h3>
                <p className="text-sm text-[--flx-text-3] line-clamp-2">
                  {list.description || "A curated collection of cinematic gems."}
                </p>
              </div>
              <div className="shrink-0 pt-1">
                {list.is_public ? (
                  <Globe className="w-4 h-4 text-green-400/60" />
                ) : (
                  <Lock className="w-4 h-4 text-orange-400/60" />
                )}
              </div>
            </div>

            <div className="mt-4 flex items-center gap-4">
               <div className="px-3 py-1 rounded-full bg-white/5 text-[10px] uppercase tracking-widest font-bold text-[--flx-text-3]">
                  {list.item_count || 0} TITLES
               </div>
               <div className="px-3 py-1 rounded-full bg-white/5 text-[10px] uppercase tracking-widest font-bold text-[--flx-text-3]">
                  {list.is_public ? 'PUBLIC' : 'PRIVATE'}
               </div>
            </div>
          </motion.div>
        ))}

        {lists.length === 0 && isOwnProfile && (
          <div className="p-8 rounded-3xl border-2 border-dashed border-[--flx-border] flex flex-col items-center justify-center text-center">
            <List className="w-10 h-10 text-[--flx-text-3] mb-4" />
            <p className="text-[--flx-text-2] mb-4">You haven&apos;t created any public lists yet.</p>
            <button className="px-6 py-2 bg-[--flx-surface-2] hover:bg-[--flx-surface-3] text-white rounded-xl font-medium transition-all">
              Create My First List
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
