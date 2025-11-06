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

    let showTimer: NodeJS.Timeout;
    let hideTimer: NodeJS.Timeout;
    let promptReceived = false;

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('🎉 beforeinstallprompt event fired! PWA is installable!');
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      promptReceived = true;

      // Show notification immediately when event fires
      showTimer = setTimeout(() => {
        setShowNotification(true);
        console.log('✅ Showing install notification');
      }, 1000);

      // Auto-hide after 4 seconds
      hideTimer = setTimeout(() => {
        setShowNotification(false);
      }, 5000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Debug: Check why event might not fire
    setTimeout(() => {
      if (!promptReceived) {
        console.warn('⚠️ beforeinstallprompt has not fired yet.');
        console.log('Possible reasons:');
        console.log('1. Not enough user engagement (need 2+ visits over 5+ minutes)');
        console.log('2. Recently dismissed install prompt (3 month cooldown)');
        console.log('3. Service worker not ready');
        console.log('4. PWA criteria not fully met');
        console.log('\nTo test: Use Incognito mode or visit chrome://flags and enable:');
        console.log('"Bypass user engagement checks" (#bypass-app-banner-engagement-checks)');
      }
    }, 3000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      if (showTimer) clearTimeout(showTimer);
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      console.log('✅ Showing NATIVE browser install dialog...');
      try {
        // Show the NATIVE browser install prompt (like APK install)
        await deferredPrompt.prompt();
        
        const { outcome } = await deferredPrompt.userChoice;
        console.log('📊 User choice:', outcome);
        
        if (outcome === 'accepted') {
          console.log('🎉 User accepted! App is installing...');
          localStorage.setItem('pwa-installed', 'true');
          setShowNotification(false);
          
          // Show success message
          setTimeout(() => {
            alert('✅ App installed successfully! Check your home screen or app drawer.');
          }, 500);
        } else {
          console.log('❌ User dismissed the install dialog');
        }
        
        setDeferredPrompt(null);
      } catch (error) {
        console.error('❌ Installation failed:', error);
        alert('Installation failed. Please try again or install manually from browser menu.');
      }
    } else {
      console.warn('⚠️ No deferred prompt available');
      console.log('This means Chrome has not offered installation yet.');
      console.log('Showing manual instructions...');
      
      // Show detailed instructions
      const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      const message = isMobile
        ? '📱 To install as an app:\n\n1. Tap the menu icon (⋮) in your browser\n2. Select "Add to Home screen" or "Install app"\n3. Tap "Install" or "Add"\n4. The app will appear on your home screen!\n\nNote: You may need to visit this site a few more times before Chrome offers installation.'
        : '💻 To install as an app:\n\n1. Look for the install icon (⊕) in your browser address bar\n2. Or click the menu (⋮) and select "Install app"\n3. Click "Install"\n4. The app will be added to your computer!\n\nNote: You may need to visit this site a few more times before Chrome offers installation.';
      
      alert(message);
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

