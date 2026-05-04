'use client';

import useSWR from 'swr';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Heart, Play, UserPlus, CheckCircle2, Loader2, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getNotifications, markAsRead, markAllAsRead, deleteNotification } from '@/lib/supabase/actions/notifications';

const TYPE_CONFIG = {
  release:   { icon: Play,         color: 'text-cyan-400',   bg: 'bg-cyan-400/10' },
  watchlist: { icon: Heart,        color: 'text-pink-400',   bg: 'bg-pink-400/10' },
  system:    { icon: CheckCircle2, color: 'text-green-400',  bg: 'bg-green-400/10' },
  social:    { icon: UserPlus,     color: 'text-violet-400', bg: 'bg-violet-400/10' },
};

export default function NotificationsPage() {
  const { data: notifications = [], mutate, isLoading } = useSWR('notifications', getNotifications);

  const handleMarkAsRead = async (id: string) => {
    // Optimistic update
    mutate(prev => prev?.map(n => n.id === id ? { ...n, is_read: true } : n), false);
    await markAsRead(id);
    mutate();
  };

  const handleMarkAllAsRead = async () => {
    mutate(prev => prev?.map(n => ({ ...n, is_read: true })), false);
    await markAllAsRead();
    mutate();
  };

  const handleDelete = async (id: string) => {
    mutate(prev => prev?.filter(n => n.id !== id), false);
    await deleteNotification(id);
    mutate();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[--flx-bg] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 text-[--flx-cyan] animate-spin" />
        <p className="text-[10px] font-black text-white/20 uppercase tracking-[5px]">Retrieving Intelligence</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[--flx-bg] pb-24">
      {/* Header */}
      <div className="relative pt-24 pb-12 px-10 border-b border-white/5 bg-linear-to-b from-white/2 to-transparent">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="font-bebas text-5xl tracking-widest text-[--flx-text-1]">Notifications</h1>
            <p className="text-xs font-bold text-[--flx-text-3] uppercase tracking-[3px]">Stay updated with Flixora</p>
          </div>
          {notifications.some(n => !n.is_read) && (
            <button 
              onClick={handleMarkAllAsRead}
              className="text-[10px] font-bold uppercase tracking-widest text-[--flx-cyan] hover:opacity-70 transition-opacity cursor-pointer"
            >
              Mark all as read
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="max-w-4xl mx-auto px-10 py-12">
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {notifications.map((notif, i) => {
              const config = TYPE_CONFIG[notif.type] || TYPE_CONFIG.system;
              const Icon = config.icon;

              return (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => !notif.is_read && handleMarkAsRead(notif.id)}
                  className={cn(
                    "group relative p-6 rounded-3xl border transition-all duration-300 cursor-pointer",
                    !notif.is_read 
                      ? "bg-white/3 border-white/10 hover:border-[--flx-purple]/40 hover:bg-white/5" 
                      : "bg-transparent border-white/5 hover:border-white/10 grayscale-[0.5] hover:grayscale-0"
                  )}
                >
                  <div className="flex gap-6">
                    {/* Icon Container */}
                    <div className={cn("shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", config.bg, config.color)}>
                      <Icon size={20} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-[--flx-text-1] group-hover:text-[--flx-cyan] transition-colors">{notif.title}</h3>
                        <span className="text-[10px] font-bold text-[--flx-text-3] uppercase tracking-tighter">
                          {new Date(notif.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-[--flx-text-3] leading-relaxed max-w-2xl">{notif.content}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4">
                      {!notif.is_read && (
                        <div className="w-2 h-2 rounded-full bg-[--flx-cyan] shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
                      )}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(notif.id);
                        }}
                        className="opacity-0 group-hover:opacity-40 hover:opacity-100! transition-all text-red-500 p-2"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {notifications.length === 0 && (
          <div className="py-32 flex flex-col items-center text-center space-y-6">
            <div className="w-20 h-20 rounded-[30px] bg-white/5 border border-white/10 flex items-center justify-center text-[--flx-text-3]">
              <Bell size={32} />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bebas tracking-wider text-[--flx-text-1]">All caught up!</h3>
              <p className="text-sm text-[--flx-text-3]">No new notifications at the moment.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
