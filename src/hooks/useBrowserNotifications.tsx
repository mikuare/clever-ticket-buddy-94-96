import { useCallback, useEffect, useRef } from 'react';
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
  const originalFaviconHref = useRef<string | null>(null);
  const baseFaviconImage = useRef<HTMLImageElement | null>(null);
  const lastAppliedFaviconCount = useRef<number>(0);
  const { showNotification } = useWebNotifications();

  const ensureFaviconLink = useCallback(() => {
    let link = document.querySelector<HTMLLinkElement>("link[rel='icon']");

    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }

    return link;
  }, []);

  const restoreFavicon = useCallback(() => {
    const link = ensureFaviconLink();

    if (originalFaviconHref.current) {
      link.href = originalFaviconHref.current;
    }

    link.removeAttribute('data-notification-badge');
    lastAppliedFaviconCount.current = 0;
  }, [ensureFaviconLink]);

  const drawFaviconWithBadge = useCallback((count: number) => {
    const display = count > 99 ? '99+' : count.toString();
    const size = 64;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return null;
    }

    if (baseFaviconImage.current) {
      ctx.drawImage(baseFaviconImage.current, 0, 0, size, size);
    } else {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, size, size);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 28px "Inter", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Q', size / 2, size / 2 + 1);
    }

    const badgeRadius = size * 0.22;
    const badgeX = size * 0.78;
    const badgeY = size * 0.22;

    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(badgeX, badgeY, badgeRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = display.length >= 3 ? 'bold 18px "Inter", sans-serif' : 'bold 20px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(display, badgeX, badgeY + (display.length >= 3 ? 0.5 : 0));

    return canvas.toDataURL('image/png');
  }, []);

  const applyFaviconBadge = useCallback((count: number) => {
    const link = ensureFaviconLink();

    if (count <= 0) {
      restoreFavicon();
      return;
    }

    if (link.dataset.notificationBadge === 'true' && lastAppliedFaviconCount.current === count) {
      return;
    }

    const badgeUrl = drawFaviconWithBadge(count);

    if (!badgeUrl) {
      return;
    }

    link.href = badgeUrl;
    link.dataset.notificationBadge = 'true';
    lastAppliedFaviconCount.current = count;
  }, [drawFaviconWithBadge, ensureFaviconLink, restoreFavicon]);

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

  // Capture original favicon and preload for badge rendering
  useEffect(() => {
    const link = ensureFaviconLink();

    if (!originalFaviconHref.current) {
      originalFaviconHref.current = link.href || '/favicon.ico';
    }

    if (originalFaviconHref.current) {
      const image = new Image();
      image.crossOrigin = 'anonymous';
      image.src = originalFaviconHref.current;
      image.onload = () => {
        baseFaviconImage.current = image;
      };
    }
  }, [ensureFaviconLink]);

  // Update browser tab title with enhanced formatting and play sound
  useEffect(() => {
    if (!isEnabled) {
      document.title = originalTitle.current;
      restoreFavicon();
      return;
    }

    if (notificationCount > 0) {
      // Enhanced title format with visual indicators
      const countDisplay = notificationCount > 99 ? '99+' : notificationCount.toString();
      document.title = `(${countDisplay}) 🔔 ${originalTitle.current}`;
      applyFaviconBadge(notificationCount);
      
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
      restoreFavicon();
    }

    previousCount.current = notificationCount;
  }, [applyFaviconBadge, isEnabled, notificationCount, restoreFavicon, showNotification, showWebNotification, title]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.title = originalTitle.current;
      restoreFavicon();
    };
  }, [restoreFavicon]);

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