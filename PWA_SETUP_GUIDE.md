# Complete PWA Setup Guide

A step-by-step guide to transform any web application into a Progressive Web App (PWA) with install capability, offline support, and native-like experience.

---

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Step 1: Create Web App Manifest](#step-1-create-web-app-manifest)
3. [Step 2: Create Service Worker](#step-2-create-service-worker)
4. [Step 3: Register Service Worker](#step-3-register-service-worker)
5. [Step 4: Link Manifest in HTML](#step-4-link-manifest-in-html)
6. [Step 5: Add Install Prompt Component](#step-5-add-install-prompt-component)
7. [Step 6: Add Icons](#step-6-add-icons)
8. [Step 7: Testing & Validation](#step-7-testing--validation)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

✅ Your app must be served over **HTTPS** (or localhost for development)  
✅ Modern browser support (Chrome, Edge, Safari, Firefox)  
✅ Basic understanding of JavaScript/TypeScript  

---

## Step 1: Create Web App Manifest

Create `public/manifest.json` in your project root:

```json
{
  "name": "Your App Name - Full Title",
  "short_name": "App Name",
  "description": "Brief description of your application",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#0f172a",
  "orientation": "portrait-primary",
  "scope": "/",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    }
  ],
  "shortcuts": [
    {
      "name": "Open Dashboard",
      "short_name": "Dashboard",
      "description": "Quick access to dashboard",
      "url": "/dashboard",
      "icons": [
        {
          "src": "/icons/icon-192x192.png",
          "sizes": "192x192"
        }
      ]
    }
  ],
  "categories": ["productivity", "business", "utilities"],
  "screenshots": [
    {
      "src": "/screenshots/screenshot1.png",
      "sizes": "540x720",
      "type": "image/png",
      "form_factor": "narrow"
    }
  ]
}
```

### Key Properties Explained:
- **`name`**: Full app name (shown on splash screen)
- **`short_name`**: Short name (shown under icon, max 12 chars)
- **`start_url`**: URL opened when app launches
- **`display`**: `standalone` (hides browser UI), `fullscreen`, `minimal-ui`, or `browser`
- **`theme_color`**: Browser toolbar color
- **`background_color`**: Splash screen background
- **`icons`**: Must include 192×192 and 512×512 PNG icons
- **`purpose`**: `maskable` for adaptive icons on Android

---

## Step 2: Create Service Worker

Create `public/sw.js`:

```javascript
// Service Worker for PWA
const CACHE_NAME = 'app-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Install Service Worker and cache assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('[Service Worker] Cache failed:', error);
      })
  );
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Activate Service Worker and clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Take control of all pages immediately
  return self.clients.claim();
});

// Fetch Strategy: Network First, fallback to Cache
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // If valid response, clone and cache it
        if (response && response.status === 200 && response.type === 'basic') {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // If network fails, try cache
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Return offline page if available
          return caches.match('/offline.html');
        });
      })
  );
});

// Handle messages from the app (e.g., skip waiting)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Push notification support (optional)
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    vibrate: [200, 100, 200],
    tag: 'notification',
    requireInteraction: false
  };

  event.waitUntil(
    self.registration.showNotification('App Notification', options)
  );
});

// Notification click handler (optional)
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});
```

### Caching Strategies:
- **Network First**: Try network, fallback to cache (good for dynamic content)
- **Cache First**: Try cache, fallback to network (good for static assets)
- **Stale While Revalidate**: Serve from cache, update cache in background

---

## Step 3: Register Service Worker

### For React/Vite Apps

In `src/main.tsx` or `src/index.tsx`:

```typescript
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((registration) => {
        console.log('✅ Service Worker registered:', registration.scope);
        
        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('🔄 New version available!');
                // Optionally prompt user to reload
                if (confirm('New version available! Reload to update?')) {
                  newWorker.postMessage({ type: 'SKIP_WAITING' });
                  window.location.reload();
                }
              }
            });
          }
        });
      })
      .catch((error) => {
        console.error('❌ Service Worker registration failed:', error);
      });
  });
}

createRoot(document.getElementById("root")!).render(<App />);
```

### For Vanilla JavaScript

In your main `index.html` or `main.js`:

```javascript
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('Service Worker registered'))
      .catch(err => console.error('Service Worker registration failed:', err));
  });
}
```

---

## Step 4: Link Manifest in HTML

In `index.html` (inside `<head>`):

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <!-- PWA Manifest -->
  <link rel="manifest" href="/manifest.json" />
  
  <!-- Theme color for browser UI -->
  <meta name="theme-color" content="#0f172a" />
  
  <!-- Apple Touch Icon (iOS) -->
  <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
  
  <!-- Apple Mobile Web App -->
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
  <meta name="apple-mobile-web-app-title" content="App Name" />
  
  <!-- MS Tile (Windows) -->
  <meta name="msapplication-TileImage" content="/icons/icon-192x192.png" />
  <meta name="msapplication-TileColor" content="#0f172a" />
  
  <title>Your App Name</title>
</head>
<body>
  <div id="root"></div>
</body>
</html>
```

---

## Step 5: Add Install Prompt Component

### React/TypeScript Component

Create `src/components/PWAInstallPrompt.tsx`:

```typescript
import { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const PWAInstallPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (isStandalone) {
      return; // Already installed
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
      console.log('✅ PWA install prompt ready');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Auto-hide after 6 seconds
  useEffect(() => {
    if (!showPrompt) return;
    const timer = setTimeout(() => setShowPrompt(false), 6000);
    return () => clearTimeout(timer);
  }, [showPrompt]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      alert(
        'To install:\n\n' +
        'Chrome/Edge: Look for install icon in address bar\n' +
        'iOS Safari: Tap Share → Add to Home Screen\n' +
        'Firefox: Tap Menu → Install'
      );
      setShowPrompt(false);
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`Install prompt: ${outcome}`);
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed top-4 left-4 z-[200] animate-in slide-in-from-left duration-500">
      <div className="w-[360px] max-w-[90vw] bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white shadow-2xl border border-blue-400 rounded-2xl overflow-hidden">
        <div className="px-4 py-4 flex items-start gap-4">
          <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm shadow-lg">
            <Download className="h-7 w-7 animate-bounce" />
          </div>
          <div className="flex-1 space-y-2">
            <div>
              <p className="font-bold text-base">Install Our App</p>
              <p className="text-xs text-blue-100 mt-0.5">
                Get quick access from your home screen
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleInstallClick}
                className="px-4 py-2 text-sm font-bold bg-white text-blue-700 hover:bg-blue-50 rounded-lg transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Install Now
              </button>
              <button
                onClick={() => setShowPrompt(false)}
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
            style={{ animation: 'shrink 6s linear forwards' }}
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

export default PWAInstallPrompt;
```

### Add to Your App

In `App.tsx` or main component:

```typescript
import PWAInstallPrompt from './components/PWAInstallPrompt';

function App() {
  return (
    <>
      <PWAInstallPrompt />
      {/* Your app content */}
    </>
  );
}
```

---

## Step 6: Add Icons

### Required Icon Sizes

Create PNG icons in `public/icons/`:

- **192×192** - Minimum required size
- **512×512** - Recommended for splash screens
- **Optional**: 72×72, 96×96, 128×128, 144×144, 152×152, 384×384

### Icon Requirements:
✅ Must be **PNG format** (not JPG)  
✅ Square aspect ratio  
✅ Transparent or solid background  
✅ Simple, recognizable design  

### Generate Icons Online:
- [PWA Builder Image Generator](https://www.pwabuilder.com/imageGenerator)
- [RealFaviconGenerator](https://realfavicongenerator.net/)
- [Favicon.io](https://favicon.io/)

### Maskable Icons (Android Adaptive)

For best Android experience, create maskable icons with safe zone:

```
┌─────────────────┐
│   Safe Zone     │  ← Keep important content here
│   ┌─────────┐   │
│   │  Logo   │   │  ← 80% of canvas
│   └─────────┘   │
│   Padding 10%   │
└─────────────────┘
```

Use [Maskable.app](https://maskable.app/editor) to test.

---

## Step 7: Testing & Validation

### Chrome DevTools (F12)

1. **Application Tab → Manifest**
   - ✅ Check all fields are populated
   - ✅ Icons show correctly
   - ✅ "Add to home screen" available

2. **Application Tab → Service Workers**
   - ✅ Status: "activated and is running"
   - ✅ Update on reload enabled
   - ✅ No errors in console

3. **Lighthouse Audit**
   - Click Lighthouse tab
   - Select "Progressive Web App"
   - Click "Generate report"
   - ✅ Target: 100/100 score

### Test Install Flow

1. Open app in Chrome
2. Look for install icon in address bar (⊕)
3. Or use Chrome menu → "Install [App Name]"
4. Verify app opens in standalone window
5. Check home screen icon appears

### Test Offline

1. Open DevTools → Network tab
2. Change throttling to "Offline"
3. Refresh page
4. ✅ App should load from cache

### Test on Mobile

**Android (Chrome):**
1. Open app URL
2. Tap "Add to Home Screen" banner
3. Or Chrome menu → "Install app"

**iOS (Safari):**
1. Open app URL
2. Tap Share button
3. Tap "Add to Home Screen"
4. Confirm installation

---

## Troubleshooting

### Install Prompt Not Showing

**Possible causes:**
- ❌ Not served over HTTPS (use localhost or deploy)
- ❌ Service worker not registered
- ❌ Manifest missing required fields
- ❌ Icons wrong format (use PNG, not JPG)
- ❌ Already installed (check standalone mode)

**Solutions:**
```javascript
// Check if already installed
const isInstalled = window.matchMedia('(display-mode: standalone)').matches;
console.log('Is installed:', isInstalled);

// Check service worker
navigator.serviceWorker.getRegistrations().then(regs => {
  console.log('Service workers:', regs.length);
});

// Manually trigger install (for testing)
window.addEventListener('beforeinstallprompt', (e) => {
  console.log('Install prompt available!');
});
```

### Service Worker Not Updating

**Force update:**
```javascript
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(reg => reg.update());
});
```

**Clear cache:**
```javascript
caches.keys().then(names => {
  names.forEach(name => caches.delete(name));
});
```

### Icons Not Showing

**Check manifest:**
```javascript
fetch('/manifest.json')
  .then(r => r.json())
  .then(manifest => console.log('Manifest:', manifest));
```

**Verify icon paths:**
- Icons must be accessible at specified URLs
- Use absolute paths: `/icons/icon-192x192.png`
- Check file exists: `public/icons/icon-192x192.png`

### iOS Safari Issues

iOS has limited PWA support:
- No `beforeinstallprompt` event
- Must manually add via Share → Add to Home Screen
- Limited background functionality
- No push notifications

**iOS-specific meta tags:**
```html
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<link rel="apple-touch-icon" href="/icons/icon-192x192.png">
```

---

## Best Practices

### Performance
- ✅ Minimize service worker cache size
- ✅ Use cache-first for static assets
- ✅ Use network-first for dynamic content
- ✅ Implement background sync for offline actions

### User Experience
- ✅ Show install prompt at appropriate time (not immediately)
- ✅ Provide clear value proposition for installation
- ✅ Don't spam users with repeated prompts
- ✅ Respect user's "dismiss" choice

### Security
- ✅ Always serve over HTTPS in production
- ✅ Validate service worker scope
- ✅ Sanitize cached content
- ✅ Implement Content Security Policy (CSP)

### Maintenance
- ✅ Version your cache names (`v1`, `v2`, etc.)
- ✅ Clean up old caches on activate
- ✅ Test updates before deploying
- ✅ Monitor service worker errors

---

## Advanced Features

### Background Sync

```javascript
// In service worker
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

// In app
navigator.serviceWorker.ready.then(reg => {
  reg.sync.register('sync-data');
});
```

### Push Notifications

```javascript
// Request permission
Notification.requestPermission().then(permission => {
  if (permission === 'granted') {
    // Subscribe to push
    navigator.serviceWorker.ready.then(reg => {
      reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: 'YOUR_PUBLIC_KEY'
      });
    });
  }
});
```

### Share Target API

In `manifest.json`:
```json
{
  "share_target": {
    "action": "/share",
    "method": "POST",
    "enctype": "multipart/form-data",
    "params": {
      "title": "title",
      "text": "text",
      "url": "url"
    }
  }
}
```

---

## Deployment Checklist

Before going live:

- [ ] Manifest.json is valid and accessible
- [ ] Service worker registered and active
- [ ] All icons present (192×192, 512×512 PNG)
- [ ] HTTPS enabled (production)
- [ ] Lighthouse PWA score: 100/100
- [ ] Tested on Chrome, Edge, Safari
- [ ] Tested on Android and iOS devices
- [ ] Install prompt shows correctly
- [ ] Offline mode works
- [ ] App opens in standalone mode
- [ ] Splash screen displays correctly
- [ ] Theme colors match brand

---

## Resources

### Documentation
- [MDN PWA Guide](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [web.dev PWA](https://web.dev/progressive-web-apps/)
- [Google Workbox](https://developers.google.com/web/tools/workbox)

### Tools
- [PWA Builder](https://www.pwabuilder.com/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [Maskable.app](https://maskable.app/)
- [Favicon Generator](https://realfavicongenerator.net/)

### Testing
- [Chrome DevTools](https://developers.google.com/web/tools/chrome-devtools)
- [PWA Tester](https://www.pwabuilder.com/)
- [Webhint](https://webhint.io/)

---

## Quick Start Template

Copy this folder structure for new projects:

```
your-project/
├── public/
│   ├── icons/
│   │   ├── icon-192x192.png
│   │   └── icon-512x512.png
│   ├── manifest.json
│   ├── sw.js
│   └── offline.html (optional)
├── src/
│   ├── components/
│   │   └── PWAInstallPrompt.tsx
│   └── main.tsx (register service worker here)
└── index.html (link manifest here)
```

---

## Summary

To make any web app a PWA:

1. ✅ Create `manifest.json` with app metadata and icons
2. ✅ Create `sw.js` service worker for caching
3. ✅ Register service worker in your app entry point
4. ✅ Link manifest in `index.html`
5. ✅ Add install prompt component
6. ✅ Provide PNG icons (192×192, 512×512)
7. ✅ Deploy over HTTPS
8. ✅ Test with Lighthouse

**That's it!** Your app is now installable as a PWA. 🎉

---

*Last updated: 2025*

