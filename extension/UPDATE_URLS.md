# Update Extension URLs for Production

Quick guide to update extension URLs when deploying to Netlify.

## 🔧 Method 1: Update Before Publishing (Recommended)

### Update popup.js

Replace the URL variables at the top:

```javascript
// Production URLs
let APP_URL = 'https://your-app.netlify.app';
let BACKEND_URL = 'https://your-backend.netlify.app';
```

### Update background.js

Replace the BACKEND_URL:

```javascript
let BACKEND_URL = 'https://your-backend.netlify.app';
```

### Update manifest.json

Add your Netlify domains to host_permissions:

```json
"host_permissions": [
  "https://www.instagram.com/*",
  "https://instagram.com/*",
  "https://your-app.netlify.app/*",
  "https://your-backend.netlify.app/*"
]
```

## 🔧 Method 2: Dynamic Configuration (Advanced)

### Add URL Configuration to Extension

1. **Update popup.html** - Add settings section:

```html
<div id="settings" class="settings hidden">
  <h3>Settings</h3>
  <input type="text" id="app-url" placeholder="Frontend URL">
  <input type="text" id="backend-url" placeholder="Backend URL">
  <button id="save-settings">Save</button>
</div>
```

2. **Update popup.js** - Add settings handler:

```javascript
// Load settings
chrome.storage.sync.get(['appUrl', 'backendUrl'], (result) => {
  if (result.appUrl) APP_URL = result.appUrl;
  if (result.backendUrl) BACKEND_URL = result.backendUrl;
});

// Save settings
document.getElementById('save-settings').addEventListener('click', () => {
  const appUrl = document.getElementById('app-url').value;
  const backendUrl = document.getElementById('backend-url').value;
  
  chrome.storage.sync.set({
    appUrl: appUrl || APP_URL,
    backendUrl: backendUrl || BACKEND_URL
  }, () => {
    APP_URL = appUrl || APP_URL;
    BACKEND_URL = backendUrl || BACKEND_URL;
    alert('Settings saved!');
  });
});
```

## 🔧 Method 3: Auto-Configure from Frontend

### Add to Frontend Settings Page

When users visit `/settings/instagram`, automatically configure extension:

```javascript
// In frontend/src/app/(dashboard)/settings/instagram/page.tsx

useEffect(() => {
  // Configure extension URLs
  if (typeof window !== 'undefined') {
    const message = {
      type: 'CONFIGURE_URLS',
      appUrl: window.location.origin,
      backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL
    };
    
    // Send message to extension (if installed)
    chrome?.runtime?.sendMessage(message);
  }
}, []);
```

### Update Extension to Listen

In `background.js`:

```javascript
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'CONFIGURE_URLS') {
    chrome.storage.sync.set({
      appUrl: message.appUrl,
      backendUrl: message.backendUrl
    });
    sendResponse({ success: true });
  }
});
```

## 📝 Quick Checklist

Before publishing extension:

- [ ] Update APP_URL in popup.js
- [ ] Update BACKEND_URL in popup.js and background.js
- [ ] Update host_permissions in manifest.json
- [ ] Test extension with production URLs
- [ ] Verify extension works end-to-end
- [ ] Create ZIP package
- [ ] Upload to Chrome Web Store

## 🧪 Testing

1. Load extension in Chrome (Developer mode)
2. Test with production URLs
3. Verify cookie extraction works
4. Verify backend connection works
5. Test error handling (offline, wrong URLs)

## 🔄 After Netlify Deployment

Once your frontend and backend are deployed:

1. Get your Netlify URLs:
   - Frontend: `https://your-app-name.netlify.app`
   - Backend: `https://your-backend-name.netlify.app` (or API routes)

2. Update extension files with these URLs

3. Test extension with production URLs

4. Create new ZIP package

5. Update extension in Chrome Web Store (if already published)

