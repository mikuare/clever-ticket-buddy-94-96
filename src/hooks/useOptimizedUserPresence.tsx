import { useState, useEffect, useCallback, useRef } from 'react';
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

interface PresenceStats {
  totalUsers: number;
  onlineUsers: number;
  adminUsers: number;
  onlineAdmins: number;
}

export const useOptimizedUserPresence = () => {
  const { user, profile } = useAuth();
  const [allUsers, setAllUsers] = useState<UserPresence[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<PresenceStats>({
    totalUsers: 0,
    onlineUsers: 0,
    adminUsers: 0,
    onlineAdmins: 0
  });
  
  const presenceInterval = useRef<NodeJS.Timeout | null>(null);
  const cleanupInterval = useRef<NodeJS.Timeout | null>(null);
  const batchUpdateTimeout = useRef<NodeJS.Timeout | null>(null);
  const pendingUpdates = useRef<Set<string>>(new Set());

  // Optimized presence update with batching
  const updatePresence = useCallback(async (isOnline: boolean = true) => {
    if (!user || !profile) return;
    
    try {
      await supabase.rpc('update_user_presence', {
        p_user_id: user.id,
        p_is_online: isOnline,
        p_department_code: profile.department_code,
        p_full_name: profile.full_name,
        p_is_admin: profile.is_admin
      });
      console.log(`Optimized presence update: ${isOnline ? 'online' : 'offline'}`);
    } catch (error) {
      console.error('Error updating presence:', error);
    }
  }, [user, profile]);

  // Batch presence updates to reduce database load
  const batchedPresenceUpdate = useCallback(() => {
    if (!user) return;
    
    pendingUpdates.current.add(user.id);
    
    // Clear existing timeout
    if (batchUpdateTimeout.current) {
      clearTimeout(batchUpdateTimeout.current);
    }
    
    // Batch updates every 30 seconds
    batchUpdateTimeout.current = setTimeout(() => {
      if (pendingUpdates.current.size > 0) {
        updatePresence(true);
        pendingUpdates.current.clear();
      }
    }, 30000);
  }, [user, updatePresence]);

  // Optimized user presence fetching
  const fetchUserPresence = useCallback(async () => {
    try {
      console.log('Fetching optimized user presence...');
      
      const { data, error } = await supabase
        .from('user_presence')
        .select('id, user_id, is_online, last_seen, department_code, full_name, is_admin, updated_at')
        .order('full_name');

      if (error) throw error;

      const users = data || [];
      setAllUsers(users);

      // Calculate stats efficiently
      const newStats = users.reduce((acc, user) => {
        acc.totalUsers++;
        if (user.is_online) acc.onlineUsers++;
        if (user.is_admin) {
          acc.adminUsers++;
          if (user.is_online) acc.onlineAdmins++;
        }
        return acc;
      }, { totalUsers: 0, onlineUsers: 0, adminUsers: 0, onlineAdmins: 0 });

      setStats(newStats);
      setLoading(false);
      
      console.log('User presence stats:', newStats);
    } catch (error) {
      console.error('Error fetching user presence:', error);
      setLoading(false);
    }
  }, []);

  // Optimized cleanup with less frequent updates
  const cleanupOfflineUsers = useCallback(async () => {
    try {
      const fortyFiveSecondsAgo = new Date(Date.now() - 45000).toISOString();
      
      const { error } = await supabase
        .from('user_presence')
        .update({ 
          is_online: false, 
          updated_at: new Date().toISOString() 
        })
        .lt('last_seen', fortyFiveSecondsAgo)
        .eq('is_online', true);

      if (error) {
        console.error('Error in optimized cleanup:', error);
      }
    } catch (error) {
      console.error('Error in cleanup process:', error);
    }
  }, []);

  // Handle page visibility with optimized updates
  const handleVisibilityChange = useCallback(() => {
    if (document.hidden) {
      // Don't immediately set offline, wait for cleanup process
      return;
    } else {
      // Page is visible again, update presence
      updatePresence(true);
    }
  }, [updatePresence]);

  // Setup optimized presence tracking
  useEffect(() => {
    if (!user || !profile) return;

    let mounted = true;

    // Initial presence update
    updatePresence(true);

    // Set up optimized intervals
    // Update presence every 35 seconds (less frequent than before)
    presenceInterval.current = setInterval(() => {
      if (mounted && !document.hidden) {
        batchedPresenceUpdate();
      }
    }, 35000);

    // Cleanup offline users every 30 seconds (less frequent)
    cleanupInterval.current = setInterval(() => {
      if (mounted) {
        cleanupOfflineUsers();
      }
    }, 30000);

    // Add visibility change listener
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup function
    return () => {
      mounted = false;
      
      if (presenceInterval.current) {
        clearInterval(presenceInterval.current);
      }
      
      if (cleanupInterval.current) {
        clearInterval(cleanupInterval.current);
      }
      
      if (batchUpdateTimeout.current) {
        clearTimeout(batchUpdateTimeout.current);
      }
      
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      // Set offline on cleanup
      if (user) {
        updatePresence(false);
      }
    };
  }, [user, profile, updatePresence, batchedPresenceUpdate, cleanupOfflineUsers, handleVisibilityChange]);

  // Setup real-time subscription with optimized handling
  useEffect(() => {
    if (!user) return;

    let mounted = true;
    
    // Initial fetch
    fetchUserPresence();
    
    // Setup optimized real-time subscription
    const channel = supabase
      .channel(`optimized-presence-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_presence'
        },
        (payload) => {
          if (!mounted) return;
          
          console.log('Optimized presence change:', payload);
          
          // Update users list efficiently
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
          
          // Recalculate stats after state update
          setStats(prev => {
            const users = payload.eventType === 'DELETE' 
              ? allUsers.filter(u => u.user_id !== payload.old.user_id)
              : allUsers;
            
            return users.reduce((acc, user) => {
              acc.totalUsers++;
              if (user.is_online) acc.onlineUsers++;
              if (user.is_admin) {
                acc.adminUsers++;
                if (user.is_online) acc.onlineAdmins++;
              }
              return acc;
            }, { totalUsers: 0, onlineUsers: 0, adminUsers: 0, onlineAdmins: 0 });
          });
        }
      )
      .subscribe((status) => {
        console.log('Optimized presence subscription status:', status);
      });

    return () => {
      mounted = false;
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [user, fetchUserPresence]);

  // Helper functions
  const getOnlineUsers = useCallback(() => allUsers.filter(u => u.is_online), [allUsers]);
  const getOfflineUsers = useCallback(() => allUsers.filter(u => !u.is_online), [allUsers]);
  const getUsersByDepartment = useCallback((dept: string) => 
    allUsers.filter(u => u.department_code === dept), [allUsers]);
  const getOnlineUsersByDepartment = useCallback((dept: string) => 
    allUsers.filter(u => u.department_code === dept && u.is_online), [allUsers]);

  return {
    allUsers,
    loading,
    stats,
    getOnlineUsers,
    getOfflineUsers,
    getUsersByDepartment,
    getOnlineUsersByDepartment,
    onlineCount: stats.onlineUsers,
    totalCount: stats.totalUsers,
    refreshPresence: fetchUserPresence
  };
};