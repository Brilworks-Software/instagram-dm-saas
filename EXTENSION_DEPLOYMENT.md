# Chrome Extension Deployment Guide

Complete guide to deploy and publish the DMflow Chrome Extension.

## 🎯 Quick Start

1. **Update URLs** for production (see `extension/UPDATE_URLS.md`)
2. **Build extension** using `extension/build.sh`
3. **Publish to Chrome Web Store** (see `extension/CHROME_STORE_GUIDE.md`)

## 📋 Pre-Deployment Checklist

### 1. Update Extension URLs

Before building, update these files with your Netlify URLs:

- ✅ `extension/popup.js` - Update `APP_URL` and `BACKEND_URL`
- ✅ `extension/background.js` - Update `BACKEND_URL`
- ✅ `extension/manifest.json` - Add Netlify domains to `host_permissions`

### 2. Test Locally

```bash
cd extension

# Load in Chrome:
# 1. Open chrome://extensions/
# 2. Enable "Developer mode"
# 3. Click "Load unpacked"
# 4. Select the extension/ folder
```

### 3. Build Package

```bash
cd extension
./build.sh
# Or manually:
zip -r dmflow-extension-v1.0.0.zip . -x "*.git*" "*.md" "*.DS_Store" "build.sh"
```

## 🚀 Publishing Steps

### Step 1: Chrome Web Store Developer Account

1. Go to https://chrome.google.com/webstore/devconsole
2. Pay $5 one-time registration fee (if needed)
3. Complete developer account setup

### Step 2: Upload Extension

1. Click "New Item" in Developer Dashboard
2. Upload your ZIP file (`dmflow-extension-v1.0.0.zip`)
3. Wait for upload to complete

### Step 3: Fill Store Listing

**Required Information:**

- **Name**: `DMflow - Instagram Session Grabber`
- **Summary**: `One-click Instagram account connection for DMflow`
- **Description**: See `extension/CHROME_STORE_GUIDE.md` for template
- **Category**: `Productivity`
- **Language**: `English (United States)`

**Graphics Needed:**

- Small tile: 128x128 (use `icons/icon128.png`)
- Large tile: 440x280 (create promotional image)
- Screenshots: At least 1 (1280x800 or 640x400)
  - Show extension popup
  - Show connection process

**Privacy Policy:**

- Required URL: `https://your-app.netlify.app/privacy`
- Must explain cookie usage and data collection

### Step 4: Submit for Review

- Review takes 1-3 business days
- You'll receive email notifications
- Check dashboard for status updates

## 🔄 Updating Extension

When you need to update:

1. **Increment version** in `manifest.json`:
   ```json
   "version": "1.0.1"
   ```

2. **Rebuild package**:
   ```bash
   cd extension
   ./build.sh
   ```

3. **Upload new version**:
   - Go to extension in Developer Dashboard
   - Click "Package" → "Upload New Package"
   - Upload new ZIP
   - Submit for review

## 🔗 Integration with Frontend

### Add "Install Extension" Button

In your frontend settings page, add:

```tsx
<Button onClick={() => {
  window.open('https://chrome.google.com/webstore/detail/YOUR_EXTENSION_ID', '_blank');
}}>
  <Download className="h-4 w-4" />
  Install Chrome Extension
</Button>
```

### Auto-Configure Extension URLs

When users visit settings page, configure extension:

```typescript
// In settings/instagram/page.tsx
useEffect(() => {
  // Send URLs to extension if installed
  if (typeof chrome !== 'undefined' && chrome.runtime) {
    chrome.runtime.sendMessage({
      type: 'CONFIGURE_URLS',
      appUrl: window.location.origin,
      backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL
    });
  }
}, []);
```

## 📝 Files Reference

- `extension/CHROME_STORE_GUIDE.md` - Detailed Chrome Web Store guide
- `extension/UPDATE_URLS.md` - How to update URLs for production
- `extension/build.sh` - Build script for creating ZIP package
- `extension/manifest.json` - Extension configuration
- `extension/popup.js` - Main extension logic
- `extension/background.js` - Background service worker

## 🎨 Creating Screenshots

You'll need screenshots for the Chrome Web Store:

1. **Extension Popup Screenshot**:
   - Take screenshot of extension popup
   - Show "Grab Instagram Session" button
   - Size: 1280x800 or 640x400

2. **Connection Flow Screenshot**:
   - Show success state
   - Show user info display
   - Size: 1280x800 or 640x400

3. **Promotional Images** (Optional):
   - Small: 440x280
   - Large: 920x680
   - Marquee: 1400x560

## 🔒 Privacy Policy Template

Create `/privacy` page on your frontend:

```tsx
// frontend/src/app/privacy/page.tsx
export default function PrivacyPage() {
  return (
    <div>
      <h1>Privacy Policy - DMflow Extension</h1>
      
      <section>
        <h2>1. Data Collection</h2>
        <p>We collect Instagram session cookies only for authentication purposes.</p>
      </section>
      
      <section>
        <h2>2. Cookie Usage</h2>
        <p>Cookies are used solely for Instagram API authentication and are encrypted before transmission.</p>
      </section>
      
      <section>
        <h2>3. Data Storage</h2>
        <p>The extension does not store any user data. All data is stored securely in your DMflow account.</p>
      </section>
      
      <section>
        <h2>4. User Rights</h2>
        <p>You can disconnect your account or delete all data at any time.</p>
      </section>
    </div>
  );
}
```

## ✅ Post-Publishing Checklist

- [ ] Extension published and live
- [ ] Test extension with production URLs
- [ ] Add "Install Extension" button to frontend
- [ ] Create privacy policy page
- [ ] Update documentation with extension link
- [ ] Monitor user reviews and feedback
- [ ] Set up analytics (optional)

## 🆘 Troubleshooting

**Extension rejected?**
- Check review notes in Developer Dashboard
- Ensure privacy policy is accessible
- Verify all permissions are explained

**Extension not working?**
- Check that production URLs are correct
- Verify backend is accessible
- Check browser console for errors
- Test with Chrome Developer Tools

**Users can't configure URLs?**
- Add settings UI to extension popup
- Or hardcode production URLs before publishing
- Or auto-configure from frontend

---

**Need Help?**
- Chrome Web Store Developer Support
- Chrome Extension Documentation
- Test in Developer Mode first before publishing

