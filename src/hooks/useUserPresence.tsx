import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

// This hook is now deprecated in favor of useRealTimeUserPresence
// Keeping minimal functionality for backward compatibility
interface UserPresence {
  user_id: string;
  full_name: string;
  department_code: string;
  online_at: string;
  is_admin?: boolean;
}

export const useUserPresence = (departmentCode?: string) => {
  const { user, profile } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState<Map<string, UserPresence>>(new Map());

  useEffect(() => {
    console.log('useUserPresence is deprecated, use useRealTimeUserPresence instead');
    // Return empty state since this is now handled by the new system
  }, [user, profile, departmentCode]);

  const isUserOnline = (userId: string): boolean => {
    return onlineUsers.has(userId);
  };

  const getOnlineUserCount = (): number => {
    return onlineUsers.size;
  };

  return {
    onlineUsers: Array.from(onlineUsers.values()),
    isUserOnline,
    getOnlineUserCount,
    channel: null
  };
};
