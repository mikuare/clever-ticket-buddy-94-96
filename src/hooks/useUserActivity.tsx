import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

// This hook is now deprecated in favor of useRealTimeUserPresence
// Keeping it empty to avoid breaking existing imports
export const useUserActivity = () => {
  const { user, profile } = useAuth();

  useEffect(() => {
    // This functionality is now handled by useRealTimeUserPresence
    console.log('useUserActivity is deprecated, use useRealTimeUserPresence instead');
  }, [user, profile]);
};
