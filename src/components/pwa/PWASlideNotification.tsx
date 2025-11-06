import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const PWASlideNotification = () => {
  const [showNotification, setShowNotification] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (isStandalone) {
      localStorage.setItem('pwa-installed', 'true');
      return;
    }

    // Check if user already has the app installed
    const installed = localStorage.getItem('pwa-installed');
    if (installed === 'true') {
      return;
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Show notification after 1 second
    const showTimer = setTimeout(() => {
      setShowNotification(true);
    }, 1000);

    // Auto-hide after 4 seconds (if user doesn't interact)
    const hideTimer = setTimeout(() => {
      setShowNotification(false);
    }, 5000); // 1 second delay + 4 seconds display = 5 seconds total

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      try {
        // Show the native browser install prompt
        await deferredPrompt.prompt();
        
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
          localStorage.setItem('pwa-installed', 'true');
          setShowNotification(false);
        }
        
        setDeferredPrompt(null);
      } catch (error) {
        console.error('Installation failed:', error);
      }
    } else {
      // If no deferred prompt, try to guide user to browser install option
      // Check if browser supports installation
      if ('serviceWorker' in navigator) {
        alert('To install:\n\n1. Look for the install icon (⊕) in your browser address bar\n2. Or tap the menu (⋮) and select "Install app" or "Add to Home screen"');
      }
    }
    setShowNotification(false);
  };

  const handleCancel = () => {
    setShowNotification(false);
  };

  if (!showNotification) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-[200] animate-in slide-in-from-top duration-500">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Left side - Message */}
            <div className="flex items-center gap-3 flex-1">
              <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm sm:text-base">Install QMAZ Helpdesk as App?</p>
                <p className="text-xs text-blue-100 hidden sm:block">Quick access • Works offline • Native experience</p>
              </div>
            </div>

            {/* Right side - Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-medium text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleInstall}
                className="px-4 py-2 text-sm font-bold bg-white text-blue-600 hover:bg-blue-50 rounded-lg transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Install
              </button>
              <button
                onClick={handleCancel}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors ml-2"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Progress bar showing 4-second timer */}
      <div className="h-1 bg-blue-800">
        <div className="h-full bg-white animate-[shrink_4s_linear_forwards]" style={{
          width: '100%',
          animation: 'shrink 4s linear forwards'
        }} />
      </div>
      
      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

export default PWASlideNotification;

