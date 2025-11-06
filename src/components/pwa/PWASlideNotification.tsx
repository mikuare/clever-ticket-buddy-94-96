import { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const PWASlideNotification = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Check if running as installed app (standalone mode)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (isStandalone) {
      // Already installed, don't show prompt
      return;
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent Chrome from showing default prompt
      e.preventDefault();
      
      // Save the event for later use
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show our custom prompt
      setShowPrompt(true);
      
      console.log('✅ PWA install prompt ready');
      
      // Auto-hide after 5 seconds
      setTimeout(() => {
        setShowPrompt(false);
      }, 5000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // No install prompt available - show manual instructions
      alert(
        'To install:\n\n' +
        'Chrome/Edge: Look for the install icon (⊕) in the address bar\n\n' +
        'iOS Safari: Tap Share → Add to Home Screen\n\n' +
        'Firefox: Tap Menu → Install'
      );
      setShowPrompt(false);
      return;
    }

    // Show the NATIVE browser install prompt
    deferredPrompt.prompt();

    // Wait for user's response
    const { outcome } = await deferredPrompt.userChoice;
    
    console.log(`PWA install prompt: ${outcome}`);
    
    // Clear the deferred prompt
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleClose = () => {
    setShowPrompt(false);
  };

  if (!showPrompt) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-[200] animate-in slide-in-from-top duration-500">
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white shadow-2xl border-b-4 border-blue-500">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Left side - Icon + Message */}
            <div className="flex items-center gap-4 flex-1">
              <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm shadow-lg">
                <Download className="h-7 w-7 animate-bounce" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-base sm:text-lg">Install QMAZ Helpdesk App</p>
                <p className="text-xs sm:text-sm text-blue-100 mt-0.5">
                  Get quick access from your home screen • Works offline • Native app experience
                </p>
              </div>
            </div>

            {/* Right side - Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleInstallClick}
                className="px-5 py-2.5 text-sm font-bold bg-white text-blue-700 hover:bg-blue-50 rounded-lg transition-all shadow-lg hover:shadow-xl transform hover:scale-105 whitespace-nowrap"
              >
                Install Now
              </button>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Auto-hide progress bar (5 seconds) */}
      <div className="h-1 bg-blue-900">
        <div 
          className="h-full bg-gradient-to-r from-white via-blue-200 to-white"
          style={{
            width: '100%',
            animation: 'shrink 5s linear forwards'
          }} 
        />
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

