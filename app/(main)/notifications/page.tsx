'use client';

import { motion } from 'framer-motion';
import { Bell, Heart, Play, UserPlus, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const NOTIFICATIONS = [
  {
    id: 1,
    type: 'release',
    title: 'New Movie Available!',
    desc: 'The highly anticipated "Dune: Part Two" is now streaming on Flixora. Watch it in 4K UHD now.',
    time: '2 hours ago',
    icon: Play,
    color: 'text-cyan-400',
    bg: 'bg-cyan-400/10',
    unread: true,
  },
  {
    id: 2,
    type: 'watchlist',
    title: 'Price Drop',
    desc: 'An item in your watchlist "Spider-Man: Across the Spider-Verse" is now available for free streaming.',
    time: '5 hours ago',
    icon: Heart,
    color: 'text-pink-400',
    bg: 'bg-pink-400/10',
    unread: true,
  },
  {
    id: 3,
    type: 'system',
    title: 'Account Verified',
    desc: 'Your account has been successfully verified. You now have full access to all premium features.',
    time: '1 day ago',
    icon: CheckCircle2,
    color: 'text-green-400',
    bg: 'bg-green-400/10',
    unread: false,
  },
  {
    id: 4,
    type: 'social',
    title: 'New Feature: Play Together',
    desc: 'You can now host watch parties with your friends! Click here to learn more about the new social features.',
    time: '2 days ago',
    icon: UserPlus,
    color: 'text-violet-400',
    bg: 'bg-violet-400/10',
    unread: false,
  },
];

export default function NotificationsPage() {
  return (
    <div className="min-h-screen bg-[--flx-bg] pb-24">
      {/* Header */}
      <div className="relative pt-24 pb-12 px-10 border-b border-white/5 bg-linear-to-b from-white/2 to-transparent">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="font-bebas text-5xl tracking-widest text-[--flx-text-1]">Notifications</h1>
            <p className="text-xs font-bold text-[--flx-text-3] uppercase tracking-[3px]">Stay updated with Flixora</p>
          </div>
          <button className="text-[10px] font-bold uppercase tracking-widest text-[--flx-cyan] hover:opacity-70 transition-opacity cursor-pointer">
             Mark all as read
          </button>
        </div>
      </div>

      {/* List */}
      <div className="max-w-4xl mx-auto px-10 py-12">
        <div className="space-y-4">
          {NOTIFICATIONS.map((notif, i) => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={cn(
                "group relative p-6 rounded-3xl border transition-all duration-300 cursor-pointer",
                notif.unread 
                  ? "bg-white/3 border-white/10 hover:border-[--flx-purple]/40 hover:bg-white/5" 
                  : "bg-transparent border-white/5 hover:border-white/10 grayscale-[0.5] hover:grayscale-0"
              )}
            >
              <div className="flex gap-6">
                {/* Icon Container */}
                <div className={cn("shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", notif.bg, notif.color)}>
                  <notif.icon size={20} />
                </div>

                {/* Content */}
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-[--flx-text-1] group-hover:text-[--flx-cyan] transition-colors">{notif.title}</h3>
                    <span className="text-[10px] font-bold text-[--flx-text-3] uppercase tracking-tighter">{notif.time}</span>
                  </div>
                  <p className="text-xs text-[--flx-text-3] leading-relaxed max-w-2xl">{notif.desc}</p>
                </div>

                {/* Unread dot */}
                {notif.unread && (
                  <div className="w-2 h-2 rounded-full bg-[--flx-cyan] shadow-[0_0_10px_rgba(34,211,238,0.8)] self-center" />
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State Mockup */}
        {NOTIFICATIONS.length === 0 && (
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
