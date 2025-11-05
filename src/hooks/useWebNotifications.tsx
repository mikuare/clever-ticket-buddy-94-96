import { useEffect, useRef, useCallback } from 'react';

export interface WebNotificationOptions {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  requireInteraction?: boolean;
}

export const useWebNotifications = () => {
  const permissionGranted = useRef(false);
  const serviceWorkerRegistration = useRef<ServiceWorkerRegistration | null>(null);

  // Get existing Service Worker registration
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        console.log('✅ Service Worker is ready:', registration);
        serviceWorkerRegistration.current = registration;
      });
    }
  }, []);

  // Request notification permission
  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      permissionGranted.current = true;
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      permissionGranted.current = permission === 'granted';
      return permission === 'granted';
    }

    return false;
  }, []);

  // Show notification - uses Service Worker for better Chrome support
  const showNotification = useCallback(async (options: WebNotificationOptions) => {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return;
    }

    // Request permission if not already granted
    if (Notification.permission !== 'granted') {
      const granted = await requestPermission();
      if (!granted) return;
    }

    try {
      // Use Service Worker notification for better Chrome cross-tab support
      if (serviceWorkerRegistration.current) {
        await serviceWorkerRegistration.current.showNotification(options.title, {
          body: options.body,
          icon: options.icon || '/lovable-uploads/bbcaed06-9a97-41a7-b55f-7e09c6b998df.png',
          tag: options.tag,
          requireInteraction: options.requireInteraction || false,
          badge: '/lovable-uploads/bbcaed06-9a97-41a7-b55f-7e09c6b998df.png',
          renotify: true,
        } as NotificationOptions);
        
        console.log('Service Worker notification sent successfully');
      } else {
        // Fallback to regular notification API
        const notification = new Notification(options.title, {
          body: options.body,
          icon: options.icon || '/lovable-uploads/bbcaed06-9a97-41a7-b55f-7e09c6b998df.png',
          tag: options.tag,
          requireInteraction: options.requireInteraction || false,
          badge: '/lovable-uploads/bbcaed06-9a97-41a7-b55f-7e09c6b998df.png',
        });

        // Auto close after 5 seconds if not requiring interaction
        if (!options.requireInteraction) {
          setTimeout(() => notification.close(), 5000);
        }

        // Focus window when notification is clicked
        notification.onclick = () => {
          window.focus();
          notification.close();
        };
        
        console.log('Regular notification sent successfully');
      }
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }, [requestPermission]);

  // Check permission on mount
  useEffect(() => {
    if ('Notification' in window) {
      permissionGranted.current = Notification.permission === 'granted';
    }
  }, []);

  return {
    requestPermission,
    showNotification,
    permissionGranted: permissionGranted.current,
    isSupported: 'Notification' in window,
  };
};
