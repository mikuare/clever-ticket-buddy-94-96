import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Download, Smartphone } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    // Check if user has already dismissed the prompt
    const dismissed = localStorage.getItem('pwa-prompt-dismissed');
    const installed = localStorage.getItem('pwa-installed');
    
    if (dismissed === 'true' || installed === 'true') {
      return;
    }

    // Check if app is already installed (running in standalone mode)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (isStandalone) {
      localStorage.setItem('pwa-installed', 'true');
      return;
    }

    // Detect iOS devices
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    let promptShown = false;

    // Listen for the beforeinstallprompt event (Chrome/Edge/Android)
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the default browser prompt
      e.preventDefault();
      
      // Store the event for later use
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setCanInstall(true);
      
      // Show our custom prompt after a short delay (only once)
      if (!promptShown) {
        promptShown = true;
        setTimeout(() => {
          setShowPrompt(true);
        }, 2000); // Show after 2 seconds
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // ALWAYS show prompt after delay (even if beforeinstallprompt doesn't fire)
    // This ensures users always see the install option
    setTimeout(() => {
      if (!promptShown) {
        setCanInstall(true); // Assume installable
        setShowPrompt(true);
      }
    }, 3000); // Show after 3 seconds if event hasn't fired

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        // Show the NATIVE browser install prompt (like APK install dialog)
        await deferredPrompt.prompt();

        // Wait for the user's response
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
          // User accepted! App is now being installed like a native app
          localStorage.setItem('pwa-installed', 'true');
          
          // Hide our custom prompt immediately
          setShowPrompt(false);
          
          // The app will now appear on their home screen/app drawer!
          return;
        } else {
          // User dismissed the native install dialog
          console.log('User cancelled installation');
        }

        // Clear the deferredPrompt
        setDeferredPrompt(null);
      } catch (error) {
        console.error('Installation error:', error);
      }
    }

    // Hide the prompt
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  const handleRemindLater = () => {
    setShowPrompt(false);
    // Don't set dismissed, so it can show again on next visit
  };

  if (!showPrompt) {
    return null;
  }

  // iOS install instructions
  if (isIOS) {
    return (
      <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-300">
        <Card className="w-full max-w-md animate-in slide-in-from-bottom duration-500 sm:slide-in-from-bottom-0">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <Smartphone className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Install QMAZ Helpdesk</h3>
                  <p className="text-sm text-muted-foreground">Get quick access anytime</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Install this app on your iPhone for quick and easy access:
              </p>

              <ol className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-semibold">
                    1
                  </span>
                  <span>
                    Tap the <strong>Share</strong> button{' '}
                    <svg className="inline w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M16 5l-1.42 1.42-1.59-1.59V16h-1.98V4.83L9.42 6.42 8 5l4-4 4 4zm4 14H4v-7h2v5h12v-5h2v7z"/>
                    </svg>{' '}
                    at the bottom of Safari
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-semibold">
                    2
                  </span>
                  <span>
                    Scroll down and tap <strong>"Add to Home Screen"</strong>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-semibold">
                    3
                  </span>
                  <span>
                    Tap <strong>"Add"</strong> in the top right corner
                  </span>
                </li>
              </ol>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={handleRemindLater}
                  className="flex-1"
                >
                  Maybe Later
                </Button>
                <Button
                  onClick={handleDismiss}
                  className="flex-1"
                >
                  Got It
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Android/Desktop install prompt
  return (
    <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-300">
      <Card className="w-full max-w-md animate-in slide-in-from-bottom duration-500 sm:slide-in-from-bottom-0">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Download className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Install QMAZ Helpdesk</h3>
                <p className="text-sm text-muted-foreground">Add to your home screen</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-4">
            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
              <p className="text-sm font-medium">Why install?</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Quick access from your home screen</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Works offline</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Faster loading times</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Feels like a native app</span>
                </li>
              </ul>
            </div>

            {!deferredPrompt && (
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-4 rounded-lg space-y-2">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">📍 How to install manually:</p>
                <ol className="text-xs text-blue-800 dark:text-blue-200 space-y-1.5 list-decimal list-inside">
                  <li>Look for the <strong>install icon (⊕)</strong> in your browser's address bar (top right)</li>
                  <li>Or click the <strong>3-dots menu (⋮)</strong> and select <strong>"Install app"</strong></li>
                  <li>If you don't see it, try refreshing the page or visiting again later</li>
                </ol>
              </div>
            )}

            {deferredPrompt && (
              <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/30 dark:to-blue-950/30 border-2 border-green-400 dark:border-green-600 p-4 rounded-lg shadow-sm">
                <p className="text-sm font-bold text-green-900 dark:text-green-100 flex items-center gap-2 mb-2">
                  <span className="text-xl">✅</span>
                  <span>Ready to Install Like a Native App!</span>
                </p>
                <p className="text-xs text-green-800 dark:text-green-200">
                  Click "Install App" below to add QMAZ Helpdesk to your home screen. It will work like a real application!
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleRemindLater}
                className="flex-1"
              >
                Maybe Later
              </Button>
              <Button
                onClick={handleInstallClick}
                className={`flex-1 gap-2 ${deferredPrompt ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 animate-pulse' : ''}`}
              >
                <Download className="w-4 h-4" />
                {deferredPrompt ? '📱 Install App' : 'Got It'}
              </Button>
            </div>

            <button
              onClick={handleDismiss}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors w-full text-center"
            >
              Don't show this again
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PWAInstallPrompt;

