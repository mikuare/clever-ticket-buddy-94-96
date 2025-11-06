import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const PWAFloatingButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showButton, setShowButton] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (isStandalone) {
      return; // Already installed, don't show button
    }

    // Check if user permanently dismissed
    const dismissed = localStorage.getItem('pwa-install-hidden');
    if (dismissed === 'true') {
      return;
    }

    // Show button after 2 seconds
    const timer = setTimeout(() => {
      setShowButton(true);
    }, 2000);

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      console.log('✅ PWA: beforeinstallprompt event captured');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Chrome has the install event - use native dialog
      try {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        console.log(`PWA install: ${outcome}`);
        
        if (outcome === 'accepted') {
          setShowButton(false);
          localStorage.setItem('pwa-installed', 'true');
        }
        
        setDeferredPrompt(null);
      } catch (error) {
        console.error('Install error:', error);
        // Show instructions as fallback
        setShowInstructions(true);
      }
    } else {
      // No install event - show manual instructions
      setShowInstructions(true);
    }
  };

  const handleHideButton = () => {
    setShowButton(false);
    localStorage.setItem('pwa-install-hidden', 'true');
  };

  const handleCloseInstructions = () => {
    setShowInstructions(false);
  };

  if (!showButton) {
    return null;
  }

  return (
    <>
      {/* Floating Install Button */}
      <div className="fixed bottom-6 right-6 z-[150] flex flex-col items-end gap-2">
        {/* Main Install Button */}
        <button
          onClick={handleInstallClick}
          className="group relative bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-full p-4 shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 transform hover:scale-110 animate-bounce"
          title="Install QMAZ Helpdesk App"
        >
          <Download className="w-6 h-6" />
          
          {/* Tooltip */}
          <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Install as App
            <div className="absolute left-full top-1/2 -translate-y-1/2 border-8 border-transparent border-l-gray-900"></div>
          </div>
        </button>

        {/* Small Close Button */}
        <button
          onClick={handleHideButton}
          className="bg-gray-600 hover:bg-gray-700 text-white rounded-full p-2 shadow-lg transition-all duration-200 text-xs"
          title="Hide install button"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Instructions Modal */}
      {showInstructions && (
        <div className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-300">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-xl">
                    <Download className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      Install QMAZ Helpdesk
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Add to your home screen
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleCloseInstructions}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Instructions */}
              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    📱 How to install on Mobile:
                  </p>
                  <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-2 list-decimal list-inside">
                    <li>Tap the menu icon (⋮) in your browser</li>
                    <li>Select <strong>"Add to Home screen"</strong> or <strong>"Install app"</strong></li>
                    <li>Tap <strong>"Install"</strong> or <strong>"Add"</strong></li>
                    <li>The app will appear on your home screen!</li>
                  </ol>
                </div>

                <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <p className="text-sm font-semibold text-green-900 dark:text-green-100 mb-2">
                    💻 How to install on Desktop:
                  </p>
                  <ol className="text-sm text-green-800 dark:text-green-200 space-y-2 list-decimal list-inside">
                    <li>Look for the install icon (⊕) in the address bar (top right)</li>
                    <li>Or click the menu (⋮) and select <strong>"Install app"</strong></li>
                    <li>Click <strong>"Install"</strong></li>
                    <li>The app will open in its own window!</li>
                  </ol>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                  <p className="text-sm font-semibold text-purple-900 dark:text-purple-100 mb-2">
                    🍎 iOS Safari:
                  </p>
                  <ol className="text-sm text-purple-800 dark:text-purple-200 space-y-2 list-decimal list-inside">
                    <li>Tap the <strong>Share</strong> button at the bottom</li>
                    <li>Scroll down and tap <strong>"Add to Home Screen"</strong></li>
                    <li>Tap <strong>"Add"</strong> in the top right</li>
                  </ol>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-6 flex gap-3">
                <button
                  onClick={handleCloseInstructions}
                  className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Got It
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PWAFloatingButton;

