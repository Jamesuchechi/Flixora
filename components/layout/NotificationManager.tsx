'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useStore } from '@/store/useStore';
import { getNotifications } from '@/lib/supabase/actions/notifications';

export function NotificationManager() {
  const setUnreadNotifications = useStore((s) => s.setUnreadNotifications);
  const supabase = createClient();

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel>;

    const init = async () => {
      // 1. Fetch initial unread count
      const notifications = await getNotifications();
      const unread = notifications.filter(n => !n.is_read).length;
      setUnreadNotifications(unread);

      // 2. Subscribe to new notifications
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      channel = supabase
        .channel(`realtime_notifications_${user.id}_${Date.now()}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            // Increment unread count on new notification
            setUnreadNotifications(useStore.getState().unreadNotifications + 1);
            
            // Optionally: Play sound effect if enabled in preferences
            const { preferences } = useStore.getState();
            if (preferences.soundEffects) {
              const audio = new Audio('/sounds/notification.mp3');
              audio.play().catch(() => {}); // Ignore blocked autoplay
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          async () => {
            // Recalculate unread count on updates (like marking as read)
            const fresh = await getNotifications();
            const unreadCount = fresh.filter(n => !n.is_read).length;
            setUnreadNotifications(unreadCount);
          }
        )
        .subscribe();
    };

    init();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [supabase, setUnreadNotifications]);

  return null; // This component handles side effects only
}
