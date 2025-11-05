import { useEffect, useRef } from 'react';
import { useWebNotifications } from './useWebNotifications';

interface UseBrowserNotificationsProps {
  isEnabled: boolean;
  notificationCount: number;
  title?: string;
  showWebNotification?: boolean;
}

export const useBrowserNotifications = ({ 
  isEnabled, 
  notificationCount, 
  title = 'Helpdesk Admin',
  showWebNotification = true
}: UseBrowserNotificationsProps) => {
  const originalTitle = useRef<string>('');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const previousCount = useRef<number>(0);
  const { showNotification } = useWebNotifications();

  // Initialize original title and enhanced audio system
  useEffect(() => {
    originalTitle.current = document.title || title;
    
    // Create enhanced notification sound using Web Audio API
    const createNotificationSound = () => {
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        // Create a pleasant two-tone notification
        const playTone = (frequency: number, duration: number, delay: number = 0) => {
          setTimeout(() => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = frequency;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.15, audioContext.currentTime + 0.02);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration);
          }, delay);
        };
        
        // Play two-tone notification: higher tone followed by lower tone
        playTone(800, 0.2, 0);    // First tone
        playTone(600, 0.3, 150);  // Second tone with slight delay
      } catch (error) {
        console.log('Audio context not available for notifications');
      }
    };

    audioRef.current = { play: createNotificationSound } as any;
  }, [title]);

  // Update browser tab title with enhanced formatting and play sound
  useEffect(() => {
    if (!isEnabled) {
      document.title = originalTitle.current;
      return;
    }

    if (notificationCount > 0) {
      // Enhanced title format with visual indicators
      const countDisplay = notificationCount > 99 ? '99+' : notificationCount.toString();
      document.title = `(${countDisplay}) 🔔 ${originalTitle.current}`;
      
      // Play sound and show web notification when count increases
      if (notificationCount > previousCount.current && previousCount.current >= 0) {
        const newNotifications = notificationCount - previousCount.current;
        console.log(`Playing notification sound for ${newNotifications} new notifications`);
        
        try {
          audioRef.current?.play?.();
        } catch (error) {
          console.log('Could not play notification sound:', error);
        }

        // Show web notification
        if (showWebNotification) {
          showNotification({
            title: `🔔 ${title}`,
            body: `You have ${newNotifications} new notification${newNotifications > 1 ? 's' : ''}`,
            tag: 'notification-count',
          });
        }
      }
    } else {
      document.title = originalTitle.current;
    }

    previousCount.current = notificationCount;
  }, [isEnabled, notificationCount]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.title = originalTitle.current;
    };
  }, []);

  return {
    playNotificationSound: () => {
      try {
        audioRef.current?.play?.();
      } catch (error) {
        console.log('Could not play notification sound');
      }
    }
  };
};