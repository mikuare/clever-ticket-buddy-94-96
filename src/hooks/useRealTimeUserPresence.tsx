
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface UserPresence {
  id: string;
  user_id: string;
  is_online: boolean;
  last_seen: string;
  department_code: string;
  full_name: string;
  is_admin: boolean;
  updated_at: string;
}

export const useRealTimeUserPresence = () => {
  const { user, profile } = useAuth();
  const [allUsers, setAllUsers] = useState<UserPresence[]>([]);
  const [loading, setLoading] = useState(true);

  // Track current user's presence
  useEffect(() => {
    if (!user || !profile) return;

    let presenceInterval: NodeJS.Timeout;
    let mounted = true;

    const updatePresence = async (isOnline: boolean = true) => {
      if (!mounted) return;
      
      try {
        await supabase.rpc('update_user_presence', {
          p_user_id: user.id,
          p_is_online: isOnline,
          p_department_code: profile.department_code,
          p_full_name: profile.full_name,
          p_is_admin: profile.is_admin
        });
        console.log(`Updated presence: ${isOnline ? 'online' : 'offline'}`);
      } catch (error) {
        console.error('Error updating presence:', error);
      }
    };

    const startPresenceTracking = async () => {
      // Set user as online
      await updatePresence(true);
      
      // Update presence every 25 seconds to maintain online status
      presenceInterval = setInterval(() => {
        if (mounted) {
          updatePresence(true);
        }
      }, 25000);
    };

    const stopPresenceTracking = async () => {
      if (presenceInterval) {
        clearInterval(presenceInterval);
      }
      // Set user as offline when leaving
      if (mounted) {
        await updatePresence(false);
      }
    };

    // Start tracking
    startPresenceTracking();

    // Handle page visibility changes
    const handleVisibilityChange = () => {
      if (!mounted) return;
      
      if (document.hidden) {
        // Page is hidden, but don't immediately set offline
        // The 30-second delay is handled by the cleanup function
      } else {
        // Page is visible again, set online
        updatePresence(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Handle beforeunload to set offline
    const handleBeforeUnload = () => {
      mounted = false;
      // Use navigator.sendBeacon for reliable offline status update
      navigator.sendBeacon('/api/user-offline', JSON.stringify({ userId: user.id }));
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      mounted = false;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      stopPresenceTracking();
    };
  }, [user, profile]);

  // Listen to real-time presence updates and fetch initial data
  useEffect(() => {
    if (!user) return;

    let mounted = true;
    let channel: any = null;

    const fetchAllUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('user_presence')
          .select('*')
          .order('full_name');

        if (error) throw error;
        if (mounted) {
          setAllUsers(data || []);
        }
      } catch (error) {
        console.error('Error fetching user presence:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    const setupRealtimeSubscription = () => {
      // Create a unique channel name to avoid conflicts
      const channelName = `user-presence-${Date.now()}-${Math.random()}`;
      
      channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'user_presence'
          },
          (payload) => {
            if (!mounted) return;
            
            console.log('Presence change received:', payload);
            
            if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
              const newPresence = payload.new as UserPresence;
              setAllUsers(prev => {
                const filtered = prev.filter(u => u.user_id !== newPresence.user_id);
                return [...filtered, newPresence].sort((a, b) => a.full_name.localeCompare(b.full_name));
              });
            } else if (payload.eventType === 'DELETE') {
              const deletedPresence = payload.old as UserPresence;
              setAllUsers(prev => prev.filter(u => u.user_id !== deletedPresence.user_id));
            }
          }
        )
        .subscribe((status) => {
          console.log('User presence subscription status:', status);
        });
    };

    // Initial fetch
    fetchAllUsers();
    
    // Set up real-time subscription
    setupRealtimeSubscription();

    return () => {
      mounted = false;
      if (channel) {
        console.log('Cleaning up user presence channel');
        supabase.removeChannel(channel);
      }
    };
  }, [user]);

  // Cleanup offline users after 30 seconds
  useEffect(() => {
    const cleanupInterval = setInterval(async () => {
      const thirtySecondsAgo = new Date(Date.now() - 30000).toISOString();
      
      try {
        // Update users who haven't been seen in 30 seconds to offline
        const { error } = await supabase
          .from('user_presence')
          .update({ is_online: false, updated_at: new Date().toISOString() })
          .lt('last_seen', thirtySecondsAgo)
          .eq('is_online', true);

        if (error) {
          console.error('Error cleaning up offline users:', error);
        }
      } catch (error) {
        console.error('Error in cleanup interval:', error);
      }
    }, 15000); // Run every 15 seconds

    return () => clearInterval(cleanupInterval);
  }, []);

  const getOnlineUsers = () => allUsers.filter(user => user.is_online);
  const getOfflineUsers = () => allUsers.filter(user => !user.is_online);
  const getUsersByDepartment = (departmentCode: string) => 
    allUsers.filter(user => user.department_code === departmentCode);
  const getOnlineUsersByDepartment = (departmentCode: string) => 
    allUsers.filter(user => user.department_code === departmentCode && user.is_online);

  return {
    allUsers,
    loading,
    getOnlineUsers,
    getOfflineUsers,
    getUsersByDepartment,
    getOnlineUsersByDepartment,
    onlineCount: getOnlineUsers().length,
    totalCount: allUsers.length
  };
};
