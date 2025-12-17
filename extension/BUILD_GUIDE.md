# BulkDM Extension Build Guide

This guide explains how to build the unified BulkDM Chrome Extension.

## Overview

The extension is now **unified** - a single version that works for both LOCAL and PRODUCTION environments. All configuration is centralized in `config.js`.

## Building the Extension

Run the build script to create a ZIP file:

```bash
cd extension
chmod +x build.sh
./build.sh
```

This will create:
- `bulkdm-extension-v1.0.1.zip` - Unified extension (works for both local and production)

## Installation

1. Extract `bulkdm-extension-v1.0.1.zip`
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select the extracted folder

## Configuration

The extension uses `config.js` as the single source of truth for all URLs.

### Default Behavior

- **Default Mode**: `auto` (uses production URLs)
- **Production URLs**: `https://instagram-dm-saas-h94m.vercel.app`
- **Local URLs**: `http://localhost:3000` and `http://localhost:3001`

### Environment Modes

The extension supports three modes (configurable via `chrome.storage.sync`):

1. **`auto`** (default) - Automatically uses production URLs
2. **`production`** - Forces production URLs
3. **`local`** - Forces localhost URLs
4. **`custom`** - Uses manually specified URLs

### Updating URLs

Edit `config.js`:

```javascript
const CONFIG = {
  PRODUCTION: {
    APP_URL: 'https://instagram-dm-saas-h94m.vercel.app',
    BACKEND_URL: 'https://instagram-dm-saas-h94m.vercel.app',
  },
  LOCAL: {
    APP_URL: 'http://localhost:3000',
    BACKEND_URL: 'http://localhost:3001',
  },
  // ...
};
```

Then rebuild:
```bash
./build.sh
```

## File Structure

```
extension/
├── config.js              # Single source of truth for all URLs
├── popup.js               # Unified popup script
├── background.js          # Unified background service worker
├── manifest.json          # Unified manifest
├── popup.html             # Popup HTML
├── icons/                 # Extension icons
├── build.sh               # Build script
└── BUILD_GUIDE.md         # This file
```

## Version Management

To update the version number:
1. Edit `manifest.json`
2. Update the `version` field
3. Run `./build.sh`
4. New ZIP file will be created with the new version number

## For Development

The extension defaults to production. To use local development:

1. Load the extension in Chrome
2. Open Chrome DevTools Console
3. Run:
```javascript
chrome.storage.sync.set({ envMode: 'local' });
```
4. Reload the extension

Or manually set custom URLs:
```javascript
chrome.storage.sync.set({ 
  appUrl: 'http://localhost:3000',
  backendUrl: 'http://localhost:3001'
});
```

## For Production

- No changes needed - extension defaults to production URLs
- All URLs are centralized in `config.js`
- Ready to upload to Chrome Web Store (see `CHROME_STORE_GUIDE.md`)

## Benefits of Unified Structure

✅ **Single Source of Truth**: All URLs in one place (`config.js`)  
✅ **No Duplication**: One set of files instead of separate versions  
✅ **Easy Updates**: Change URLs in one place  
✅ **Flexible**: Supports auto-detection, forced modes, and custom URLs  
✅ **Maintainable**: Less code to maintain

## Notes

- The extension automatically detects and uses the appropriate environment
- Configuration can be overridden via Chrome storage API
- All environment-specific logic is handled dynamically
- No need to maintain separate builds for different environments
