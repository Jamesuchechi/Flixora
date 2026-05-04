'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageSquare, Plus, Star, Share2, Send } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

interface ActivityItem {
  id: string;
  user_id: string;
  type: string;
  payload: {
    tmdb_id?: number;
    media_type?: string;
    rating?: number;
    title?: string;
    list_name?: string;
    list_id?: string;
    [key: string]: unknown;
  };
  created_at: string;
  profiles: {
    username: string;
    avatar_url: string;
  };
  like_count?: number;
  has_liked?: boolean;
  comment_count?: number;
  has_watched?: boolean;
}

interface ActivityComment {
  id: string;
  activity_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles: {
    username: string;
    avatar_url: string;
  };
}

export const ActivityFeed: React.FC<{ initialData: ActivityItem[] }> = ({ initialData }) => {
  const [activities, setActivities] = useState<ActivityItem[]>(initialData);
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const supabase = createClient();

  useEffect(() => {
    // Subscribe to new activity events
    const channel = supabase
      .channel('activity_feed')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'activity_events' },
        async (payload) => {
           // Fetch the full event with profile info
           const { data } = await supabase
             .from('activity_events')
             .select('*, profiles(*)')
             .eq('id', payload.new.id)
             .single();
           
           if (data) {
             setActivities(prev => [data as unknown as ActivityItem, ...prev]);
           }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const renderActivityContent = (item: ActivityItem) => {
    const isSpoiler = !item.has_watched && item.type === 'rated';
    
    switch (item.type) {
      case 'rated':
        return (
          <div className="flex flex-col gap-3">
             <div className="flex items-center gap-3">
                <div className={cn(
                  "inline-flex items-center gap-1 px-3 py-1 bg-[--flx-gold]/10 text-[--flx-gold] rounded-full border border-[--flx-gold]/20",
                  isSpoiler && "blur-sm select-none"
                )}>
                  <Star className="w-3 h-3 fill-current" />
                  <span className="text-xs font-bold">{item.payload.rating}/10</span>
                </div>
                {isSpoiler && (
                  <span className="text-[10px] text-[--flx-gold] font-medium italic opacity-60">Spoiler hidden</span>
                )}
             </div>
             <p className="text-[--flx-text-2] text-sm">
                rated <span className="text-white font-medium">{item.payload.title || `Media #${item.payload.tmdb_id}`}</span>
             </p>
          </div>
        );
      case 'watched':
        return (
          <p className="text-[--flx-text-2] text-sm">
            just finished watching <span className="text-white font-medium">{item.payload.title || `Media #${item.payload.tmdb_id}`}</span>
          </p>
        );
      case 'added_to_watchlist':
        return (
          <p className="text-[--flx-text-2] text-sm">
            added <span className="text-white font-medium">{item.payload.title || `Media #${item.payload.tmdb_id}`}</span> to their watchlist
          </p>
        );
      case 'fork_list':
        return (
          <p className="text-[--flx-text-2] text-sm">
            forked a collection: <span className="text-white font-medium">{item.payload.list_name || 'Untitled List'}</span>
          </p>
        );
      case 'join_party':
        return (
          <p className="text-[--flx-text-2] text-sm">
            joined a watch party for <span className="text-white font-medium">{item.payload.title || `Media #${item.payload.tmdb_id}`}</span>
          </p>
        );
      case 'create_list':
        return (
          <p className="text-[--flx-text-2] text-sm">
            created a new collection: <span className="text-white font-medium">{item.payload.list_name || 'Untitled List'}</span>
          </p>
        );
      default:
        return <p className="text-[--flx-text-2] text-sm">performed an action</p>;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <AnimatePresence initial={false}>
        {activities.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ delay: index * 0.05 }}
            className="group bg-[--flx-surface-1] border border-[--flx-border] rounded-3xl p-5 hover:border-[--flx-purple]/30 transition-all shadow-lg"
          >
            <div className="flex gap-4">
              {/* User Avatar */}
              <Link href={`/u/${item.profiles.username}`}>
                <div className="relative w-12 h-12 rounded-2xl overflow-hidden bg-[--flx-surface-2] border border-[--flx-border]">
                  <Image
                    src={item.profiles.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.profiles.username}`}
                    alt={item.profiles.username}
                    fill
                    className="object-cover"
                  />
                </div>
              </Link>

              {/* Activity Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <Link href={`/u/${item.profiles.username}`} className="text-white font-bold hover:text-[--flx-purple] transition-colors">
                    {item.profiles.username}
                  </Link>
                  <span className="text-[--flx-text-3] text-xs">
                    {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                
                {renderActivityContent(item)}

                {/* Interactions */}
                <div className="flex items-center gap-6 mt-4 pt-4 border-t border-[--flx-border]">
                  <button 
                    onClick={async () => {
                      const { toggleActivityLike } = await import('@/lib/supabase/actions/social');
                      const result = await toggleActivityLike(item.id);
                      setActivities(prev => prev.map(a => 
                        a.id === item.id 
                          ? { ...a, has_liked: result.liked, like_count: (a.like_count || 0) + (result.liked ? 1 : -1) }
                          : a
                      ));
                    }}
                    className={`flex items-center gap-2 transition-colors group/btn ${item.has_liked ? 'text-[--flx-pink]' : 'text-[--flx-text-3] hover:text-[--flx-pink]'}`}
                  >
                    <Heart className={`w-4 h-4 ${item.has_liked ? 'fill-current' : 'group-hover/btn:fill-current'}`} />
                    <span className="text-xs font-medium">{item.like_count || 0}</span>
                  </button>
                  <button 
                    onClick={() => setExpandedComments(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
                    className={`flex items-center gap-2 transition-colors ${expandedComments[item.id] ? 'text-[--flx-cyan]' : 'text-[--flx-text-3] hover:text-[--flx-cyan]'}`}
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span className="text-xs font-medium">{item.comment_count || 0}</span>
                  </button>
                  <button className="flex items-center gap-2 text-[--flx-text-3] hover:text-white transition-colors ml-auto">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
                
                {/* Comments Section */}
                <AnimatePresence>
                  {expandedComments[item.id] && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <ActivityComments activityId={item.id} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {activities.length === 0 && (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-[--flx-surface-1] rounded-full flex items-center justify-center mx-auto mb-6 border border-[--flx-border]">
            <Plus className="w-8 h-8 text-[--flx-text-3]" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Your feed is quiet</h3>
          <p className="text-[--flx-text-2] max-w-xs mx-auto">
            Follow more friends to see what they&apos;re watching and loving on Flixora.
          </p>
        </div>
      )}
    </div>
  );
};

/**
 * Sub-component for handling activity comments
 */
const ActivityComments: React.FC<{ activityId: string }> = ({ activityId }) => {
  const [comments, setComments] = useState<ActivityComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    const fetchComments = async () => {
      const { getActivityComments } = await import('@/lib/supabase/actions/social');
      const data = await getActivityComments(activityId);
      setComments(data);
      setIsLoading(false);
    };
    fetchComments();
  }, [activityId]);

  const handlePostComment = async () => {
    if (!newComment.trim()) return;
    const { addActivityComment } = await import('@/lib/supabase/actions/social');
    try {
      const comment = await addActivityComment(activityId, newComment);
      setComments(prev => [...prev, comment]);
      setNewComment('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-[--flx-border]">
      <div className="space-y-4 mb-4">
        {isLoading ? (
          <div className="flex justify-center py-4">
             <div className="w-5 h-5 border-2 border-[--flx-cyan] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : comments.map(comment => (
          <div key={comment.id} className="flex gap-3">
             <div className="relative w-8 h-8 rounded-xl overflow-hidden bg-[--flx-surface-2] shrink-0">
                <Image
                  src={comment.profiles.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.profiles.username}`}
                  alt={comment.profiles.username}
                  fill
                  className="object-cover"
                />
             </div>
             <div className="flex-1 bg-[--flx-surface-2] rounded-2xl px-4 py-2">
                <div className="flex items-center justify-between mb-1">
                   <span className="text-white text-xs font-bold">{comment.profiles.username}</span>
                   <span className="text-[--flx-text-3] text-[10px]">
                      {new Date(comment.created_at).toLocaleDateString()}
                   </span>
                </div>
                <p className="text-[--flx-text-2] text-sm leading-relaxed">{comment.content}</p>
             </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <div className="flex-1 bg-[--flx-surface-2] rounded-2xl px-4 py-2 border border-transparent focus-within:border-[--flx-cyan]/50 transition-all">
          <input
            type="text"
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handlePostComment()}
            className="w-full bg-transparent border-none outline-none text-white text-sm"
          />
        </div>
        <button 
          onClick={handlePostComment}
          className="w-10 h-10 rounded-2xl bg-[--flx-surface-2] flex items-center justify-center text-[--flx-text-3] hover:text-[--flx-cyan] transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
