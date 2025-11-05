# 🔧 PWA Not Showing - Troubleshooting Guide

## 🎯 Problem: Install Prompt Not Appearing on https://help-desk-qmaz-v1-iota.vercel.app/

---

## ✅ Quick Checks (Do These First)

### 1. Clear Browser Cache & Storage
```
Chrome (Desktop):
1. Press F12 (Open DevTools)
2. Go to "Application" tab
3. Click "Storage" in left sidebar
4. Click "Clear site data"
5. Refresh page (Ctrl + Shift + R)

Chrome (Android):
1. Settings → Privacy → Clear browsing data
2. Select "Cached images and files"
3. Clear data
4. Reopen site in new tab
```

### 2. Check LocalStorage
```javascript
// Open browser console (F12) and run:
localStorage.removeItem('pwa-installed');
localStorage.removeItem('pwa-prompt-dismissed');
// Then refresh page
```

### 3. Test in Incognito/Private Mode
- Open site in incognito window
- No cached data or dismissed prompts
- Should see prompt if PWA is working

---

## 🔍 Diagnostic Steps

### Step 1: Check if Service Worker is Registered

**Chrome DevTools:**
```
1. Press F12
2. Go to "Application" tab
3. Click "Service Workers" in left sidebar
4. You should see:
   - Source: https://help-desk-qmaz-v1-iota.vercel.app/sw.js
   - Status: Activated and running
   - Update on reload: ☐ (checkbox)
```

**If Service Worker is NOT there:**
- Service worker registration failed
- Check console for errors

### Step 2: Check Manifest File

**In DevTools:**
```
1. Press F12
2. Go to "Application" tab
3. Click "Manifest" in left sidebar
4. You should see:
   - Name: "QMAZ HOLDINGS INC. - HELP DESK SYSTEM"
   - Short name: "QMAZ Helpdesk"
   - Start URL: /
   - Icons: Should show your logo
```

**Test manifest directly:**
- Visit: https://help-desk-qmaz-v1-iota.vercel.app/manifest.json
- Should show JSON file
- If 404 error → manifest not deployed

### Step 3: Check Console for Errors

**Open Console:**
```
F12 → Console tab

Look for:
✅ "Service Worker registered successfully"
❌ "Service Worker registration failed"
❌ "Manifest: Line X col Y, ..."
❌ Any red error messages
```

---

## 🛠️ Common Issues & Fixes

### Issue 1: Manifest Not Found (404)

**Problem:** 
`GET https://help-desk-qmaz-v1-iota.vercel.app/manifest.json` returns 404

**Fix:**
The `manifest.json` might not be in the right location for Vercel.

**Solution A - Move to public folder (Already done, but verify):**
```bash
# Make sure manifest.json is in public/ folder
ls public/manifest.json

# If not there, create it
```

**Solution B - Add to vercel.json:**
Create/update `vercel.json` in project root:
```json
{
  "headers": [
    {
      "source": "/manifest.json",
      "headers": [
        {
          "key": "Content-Type",
          "value": "application/manifest+json"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/sw.js",
      "destination": "/sw.js"
    }
  ]
}
```

### Issue 2: Service Worker Not Registering

**Problem:**
Service worker registration fails

**Fix - Check sw.js path:**
The service worker is currently registered in `src/main.tsx`. Verify it's working:

**Check current registration:**
```typescript
// In src/main.tsx (lines 7-18)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((registration) => {
        console.log('✅ Service Worker registered:', registration.scope);
      })
      .catch((error) => {
        console.error('❌ Service Worker registration failed:', error);
      });
  });
}
```

**If this fails, check:**
1. Is `sw.js` in `public/` folder?
2. Visit directly: https://help-desk-qmaz-v1-iota.vercel.app/sw.js
3. Should show JavaScript code (not 404)

### Issue 3: PWA Install Criteria Not Met

**Chrome requires ALL of these:**
- [x] Served over HTTPS ✅ (Vercel provides)
- [ ] Has a Web App Manifest ❓
- [ ] Has a Service Worker ❓
- [ ] Has icons (192px and 512px) ❓
- [ ] Works offline ❓

**Check in DevTools:**
```
Application → Manifest → Installability

Should show:
✅ Page is served over HTTPS
✅ Page has a Web App Manifest
✅ Manifest includes name
✅ Manifest includes icons
✅ Service worker registered
✅ Responds with 200 when offline

If any show ❌, fix that issue first!
```

### Issue 4: Browser Already Dismissed

**Problem:**
User previously dismissed the prompt

**Fix:**
```javascript
// Clear dismissal flags
localStorage.clear();
sessionStorage.clear();

// Unregister service workers
navigator.serviceWorker.getRegistrations().then(function(registrations) {
  for(let registration of registrations) {
    registration.unregister();
  }
});

// Refresh page
location.reload();
```

---

## 🚀 Immediate Fixes to Try

### Fix 1: Verify Files Are Deployed

**Check these URLs directly:**

1. **Manifest:**
   https://help-desk-qmaz-v1-iota.vercel.app/manifest.json
   - Should return JSON (not 404)

2. **Service Worker:**
   https://help-desk-qmaz-v1-iota.vercel.app/sw.js
   - Should return JavaScript code

3. **Logo:**
   https://help-desk-qmaz-v1-iota.vercel.app/images/qmaz%20holdings%20logo.jpg
   - Should show your logo image

**If ANY return 404:** Files not deployed correctly

### Fix 2: Add vercel.json Configuration

Create `vercel.json` in project root:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "headers": [
    {
      "source": "/manifest.json",
      "headers": [
        {
          "key": "Content-Type",
          "value": "application/manifest+json"
        }
      ]
    },
    {
      "source": "/sw.js",
      "headers": [
        {
          "key": "Content-Type",
          "value": "application/javascript"
        },
        {
          "key": "Service-Worker-Allowed",
          "value": "/"
        }
      ]
    }
  ],
  "routes": [
    {
      "src": "/manifest.json",
      "dest": "/manifest.json"
    },
    {
      "src": "/sw.js",
      "dest": "/sw.js"
    }
  ]
}
```

**Then redeploy:**
```bash
git add vercel.json
git commit -m "Add Vercel PWA configuration"
git push
```

### Fix 3: Update Vite Configuration

Add to `vite.config.ts`:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // ADD THIS:
  publicDir: 'public',
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
      }
    }
  }
})
```

---

## 📱 Testing Methods

### Method 1: Chrome DevTools (Desktop)

```
1. Open https://help-desk-qmaz-v1-iota.vercel.app/
2. Press F12
3. Go to Application tab
4. Look at "Service Workers" section
5. Look at "Manifest" section
6. Check "Installability" status
```

### Method 2: Chrome Flags (Force Install Button)

```
1. Open chrome://flags
2. Search for "PWA"
3. Enable "Desktop PWA Install button"
4. Restart Chrome
5. Visit your site
6. Look for install icon in address bar
```

### Method 3: Lighthouse Audit

```
1. Press F12
2. Go to "Lighthouse" tab
3. Select "Progressive Web App"
4. Click "Generate report"
5. See what's failing
```

### Method 4: Android Testing

```
1. Open Chrome on Android
2. Visit site
3. Menu → Add to Home screen
   - If available: PWA is working!
   - If grayed out: PWA criteria not met
```

---

## 🔍 Debug Console Commands

**Run these in browser console (F12):**

```javascript
// Check if service worker is supported
console.log('Service Worker support:', 'serviceWorker' in navigator);

// Check current service workers
navigator.serviceWorker.getRegistrations().then(regs => {
  console.log('Registered service workers:', regs);
});

// Check manifest
fetch('/manifest.json')
  .then(r => r.json())
  .then(data => console.log('Manifest:', data))
  .catch(e => console.error('Manifest error:', e));

// Check localStorage flags
console.log('PWA installed flag:', localStorage.getItem('pwa-installed'));
console.log('PWA dismissed flag:', localStorage.getItem('pwa-prompt-dismissed'));

// Check if running in standalone mode
console.log('Is standalone:', window.matchMedia('(display-mode: standalone)').matches);
```

---

## ✅ Step-by-Step Resolution

### STEP 1: Clear Everything

```bash
# In browser console:
localStorage.clear();
sessionStorage.clear();
navigator.serviceWorker.getRegistrations().then(r => r.forEach(reg => reg.unregister()));

# Then:
Ctrl + Shift + R (hard refresh)
```

### STEP 2: Check Files Exist

Visit these URLs:
1. https://help-desk-qmaz-v1-iota.vercel.app/manifest.json ✅ or ❌
2. https://help-desk-qmaz-v1-iota.vercel.app/sw.js ✅ or ❌
3. https://help-desk-qmaz-v1-iota.vercel.app/images/qmaz%20holdings%20logo.jpg ✅ or ❌

**If any show 404:** Files not deployed!

### STEP 3: Check DevTools

```
F12 → Application → Manifest
Should show:
- Name: QMAZ HOLDINGS INC...
- Icons: Your logo
- Start URL: /

F12 → Application → Service Workers
Should show:
- Status: Activated and running
- Source: /sw.js
```

### STEP 4: Wait and Test

```
1. Open site in new incognito window
2. Wait exactly 2 seconds
3. Prompt should slide up from bottom

If not showing:
- Check console for errors
- Check if PWAInstallPrompt component is rendering
```

---

## 🐛 Most Likely Issues

### Issue #1: Manifest.json Not Served

**Symptom:** 
- Visit /manifest.json → 404 error
- DevTools Application → Manifest shows "No manifest"

**Solution:**
```bash
# Make sure public/manifest.json exists
# Then ensure it's copied during build

# Check vite.config.ts has:
publicDir: 'public'

# Redeploy
```

### Issue #2: Service Worker Blocked

**Symptom:**
- Console error: "Service Worker registration failed"
- DevTools shows no service worker

**Solution:**
```bash
# Check sw.js is in public/ folder
# Check browser console for specific error
# Ensure HTTPS (Vercel provides this)
```

### Issue #3: Component Not Rendering

**Symptom:**
- No errors in console
- Service worker + manifest working
- Prompt still not showing

**Solution:**
Check if PWAInstallPrompt is being rendered:

```javascript
// In browser console:
document.querySelector('[class*="PWA"]') // Should find element
// or search for "Install QMAZ" text in page
```

---

## 🚀 Quick Fix Script

**Run this in project root:**

```bash
# 1. Ensure files are in correct location
ls public/manifest.json public/sw.js

# 2. Create vercel.json if doesn't exist
cat > vercel.json << 'EOF'
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist"
}
EOF

# 3. Commit and push
git add .
git commit -m "Fix PWA deployment configuration"
git push

# Wait for Vercel to deploy (30-60 seconds)
```

---

## 📞 Still Not Working?

### Check These:

1. **Browser Support:**
   - Chrome/Edge: ✅
   - Firefox: ⚠️ (limited PWA support)
   - Safari Desktop: ❌ (no install prompt)

2. **Already Installed:**
   - Check if app is in Applications
   - Uninstall and try again

3. **Wrong Page:**
   - Must be on actual domain
   - Not localhost
   - Not iframe

---

## 🎯 Expected Behavior

**When Working Correctly:**

```
1. User visits https://help-desk-qmaz-v1-iota.vercel.app/
2. Page loads normally
3. After 2 seconds:
   └─ Slide-up animation from bottom
   └─ Card appears with "Install QMAZ Helpdesk"
   └─ Shows benefits and install button

4. User clicks "Install Now"
   └─ Browser shows native install dialog
   └─ App installs to home screen/apps
```

**Console Should Show:**
```
✅ Service Worker registered successfully: /
✅ PWA: Checking installability...
```

---

## 💡 Next Steps

1. **Visit your site:** https://help-desk-qmaz-v1-iota.vercel.app/
2. **Open DevTools:** Press F12
3. **Check Application tab:** Service Workers + Manifest
4. **Check Console:** Look for errors
5. **Report back:** What do you see?

I can help debug based on what errors you're seeing!

---

**Most common fix: Clear cache + localStorage, then hard refresh!** 🔄

