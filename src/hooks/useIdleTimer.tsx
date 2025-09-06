import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface UseIdleTimerProps {
<<<<<<< HEAD
  idleTime?: number; // in milliseconds, default 15 minutes
=======
  idleTime?: number; // in milliseconds, default 1 hour
>>>>>>> main
  warningTime?: number; // in milliseconds, default 2 minutes before logout
}

export const useIdleTimer = ({ 
<<<<<<< HEAD
  idleTime = 15 * 60 * 1000, // 15 minutes
=======
  idleTime = 60 * 60 * 1000, // 1 hour
>>>>>>> main
  warningTime = 2 * 60 * 1000 // 2 minutes
}: UseIdleTimerProps = {}) => {
  const { user, signOut } = useAuth();
  const timeoutRef = useRef<NodeJS.Timeout>();
  const warningTimeoutRef = useRef<NodeJS.Timeout>();
  const lastActivityRef = useRef<number>(Date.now());

  const resetTimer = useCallback(() => {
    if (!user) return;

    lastActivityRef.current = Date.now();
    
    // Clear existing timers
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }

    // Set warning timer
    warningTimeoutRef.current = setTimeout(() => {
      toast({
        title: "Session Warning",
        description: "Your session will expire in 2 minutes due to inactivity.",
        variant: "destructive",
      });
    }, idleTime - warningTime);

    // Set logout timer
    timeoutRef.current = setTimeout(async () => {
      console.log('Auto-logout due to inactivity');
      toast({
        title: "Session Expired",
        description: "You have been logged out due to inactivity. Please login again.",
        variant: "destructive",
      });
      await signOut();
    }, idleTime);
  }, [user, signOut, idleTime, warningTime]);

  useEffect(() => {
    if (!user) return;

    const events = [
      'mousedown',
      'mousemove', 
      'keypress',
      'scroll',
      'touchstart',
      'click'
    ];

    const handleActivity = () => {
      resetTimer();
    };

    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // Handle visibility change
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Page became visible again
        const now = Date.now();
        const timeSinceLastActivity = now - lastActivityRef.current;
        
        // If more than idle time has passed, logout immediately
        if (timeSinceLastActivity > idleTime) {
          console.log('Auto-logout due to prolonged inactivity');
          toast({
            title: "Session Expired",
            description: "You have been logged out due to prolonged inactivity. Please login again.",
            variant: "destructive",
          });
          signOut();
          return;
        }
        
        // Otherwise reset the timer
        resetTimer();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Initialize timer
    resetTimer();

    return () => {
      // Cleanup
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
    };
  }, [user, resetTimer, signOut, idleTime]);

  return { resetTimer };
};
