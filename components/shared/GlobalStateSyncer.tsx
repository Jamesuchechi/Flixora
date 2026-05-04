'use client';

import { useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { getWatchlist } from '@/lib/supabase/actions/watchlist';
import { getUserPreferences } from '@/lib/supabase/actions/preferences';
import { getNotifications } from '@/lib/supabase/actions/notifications';
import { createClient } from '@/lib/supabase/client';

/**
 * Global State Hydrator
 * Syncs Watchlist, User Preferences, and Notifications from Supabase to Zustand on mount
 * and handles real-time auth state transitions.
 */
export function GlobalStateSyncer() {
  const syncWatchlist = useStore((s) => s.syncWatchlist);
  const setAllPreferences = useStore((s) => s.setAllPreferences);
  const accentColor = useStore((s) => s.preferences.accentColor);
  const setUnreadNotifications = useStore((s) => s.setUnreadNotifications);
  
  const supabase = createClient();

  useEffect(() => {
    const handleSync = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        const [watchlist, prefs, notifications] = await Promise.all([
          getWatchlist(),
          getUserPreferences(),
          getNotifications()
        ]);
        
        if (watchlist) {
          syncWatchlist(watchlist.map(item => item.tmdb_id));
        }
        
        if (prefs) {
          setAllPreferences(prefs);
        }

        if (notifications) {
          const unreadCount = notifications.filter(n => !n.is_read).length;
          setUnreadNotifications(unreadCount);
        }
      }
    };

    handleSync();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        handleSync();
      } else if (event === 'SIGNED_OUT') {
        syncWatchlist([]);
        setUnreadNotifications(0);
      }
    });

    // Real-time Notifications
    const notificationChannel = supabase
      .channel('realtime-notifications')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications' },
        () => {
          handleSync();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
      supabase.removeChannel(notificationChannel);
    };
  }, [syncWatchlist, setAllPreferences, setUnreadNotifications, supabase]);

  // Apply CSS Variables globally
  useEffect(() => {
    if (accentColor) {
      document.documentElement.style.setProperty('--flx-purple', accentColor);
    }
  }, [accentColor]);

  return null;
}
