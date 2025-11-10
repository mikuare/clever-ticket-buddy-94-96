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

    // Always remind users about the PWA option on each visit/refresh
    setShowPrompt(true);

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent Chrome from showing default prompt
      e.preventDefault();
      
      // Save the event for later use
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show our custom prompt
      setShowPrompt(true);
      
      console.log('✅ PWA install prompt ready');
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

  // Auto-hide prompt a few seconds after it becomes visible
  useEffect(() => {
    if (!showPrompt) return;

    const timer = window.setTimeout(() => {
      setShowPrompt(false);
    }, 6000);

    return () => window.clearTimeout(timer);
  }, [showPrompt]);

  if (!showPrompt) {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 z-[200] animate-in slide-in-from-left duration-500">
      <div className="w-[360px] max-w-[90vw] bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white shadow-2xl border border-blue-400 rounded-2xl overflow-hidden">
        <div className="px-4 py-4 flex items-start gap-4">
          <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm shadow-lg">
            <Download className="h-7 w-7 animate-bounce" />
          </div>
          <div className="flex-1 space-y-2">
            <div>
              <p className="font-bold text-base">Install the QMAZ Helpdesk PWA</p>
              <p className="text-xs text-blue-100 mt-0.5">
                Get quick access from your home screen • Pure PWA (no APK sideloading required)
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleInstallClick}
                className="px-4 py-2 text-sm font-bold bg-white text-blue-700 hover:bg-blue-50 rounded-lg transition-all shadow-lg hover:shadow-xl transform hover:scale-105 whitespace-nowrap"
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
        <div className="h-1 bg-blue-900">
          <div
            className="h-full bg-gradient-to-r from-white via-blue-200 to-white"
            style={{
              width: '100%',
              animation: 'shrink 5s linear forwards'
            }}
          />
        </div>
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

