import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Smartphone } from 'lucide-react';

/**
 * Debug button to manually trigger PWA install prompt
 * This helps test the PWA functionality
 */
const PWADebugButton = () => {
  const [showDebug, setShowDebug] = useState(true);

  const handleForceShow = () => {
    console.log('🔧 DEBUG: Forcing PWA prompt to show');
    
    // Clear all PWA flags
    localStorage.removeItem('pwa-installed');
    localStorage.removeItem('pwa-prompt-dismissed');
    
    console.log('✅ Cleared PWA flags');
    
    // Reload page to trigger prompt
    window.location.reload();
  };

  const handleCheckStatus = () => {
    const installed = localStorage.getItem('pwa-installed');
    const dismissed = localStorage.getItem('pwa-prompt-dismissed');
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    
    console.log('📊 PWA Status Check:');
    console.log('- Installed flag:', installed);
    console.log('- Dismissed flag:', dismissed);
    console.log('- Running standalone:', isStandalone);
    console.log('- User agent:', navigator.userAgent);
    
    alert(`PWA Status:
- Installed: ${installed || 'false'}
- Dismissed: ${dismissed || 'false'}  
- Standalone: ${isStandalone}

Check console for details.`);
  };

  if (!showDebug) return null;

  return (
    <div className="fixed bottom-20 left-4 z-[101] flex flex-col gap-2">
      <Button
        onClick={handleForceShow}
        size="sm"
        variant="outline"
        className="bg-yellow-100 hover:bg-yellow-200 border-yellow-400 text-yellow-900"
      >
        <Smartphone className="w-4 h-4 mr-2" />
        Force PWA Prompt
      </Button>
      <Button
        onClick={handleCheckStatus}
        size="sm"
        variant="outline"
        className="bg-blue-100 hover:bg-blue-200 border-blue-400 text-blue-900"
      >
        Check PWA Status
      </Button>
      <Button
        onClick={() => setShowDebug(false)}
        size="sm"
        variant="ghost"
        className="text-xs"
      >
        Hide Debug
      </Button>
    </div>
  );
};

export default PWADebugButton;

