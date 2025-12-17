# Extension Configuration Consolidation

## Overview
All configuration has been consolidated into a single `config.js` file. The extension now uses unified files instead of separate production/local versions.

## Changes Made

### ✅ Unified Files
- **`config.js`** - Single source of truth for all URLs and settings
- **`popup.js`** - Unified popup script (works for both prod and local)
- **`background.js`** - Unified background service worker
- **`manifest.json`** - Unified manifest with all necessary permissions

### 🗑️ Files to Remove (No Longer Needed)
- `popup.prod.js` - Merged into `popup.js`
- `popup.local.js` - Merged into `popup.js`
- `background.prod.js` - Merged into `background.js`
- `background.local.js` - Merged into `background.js`
- `manifest.prod.json` - Merged into `manifest.json`
- `manifest.local.json` - Merged into `manifest.json`

## Configuration System

### Environment Modes
The extension supports three modes:

1. **`auto`** (default) - Automatically uses production URLs
2. **`production`** - Forces production URLs
3. **`local`** - Forces localhost URLs
4. **`custom`** - Uses manually specified URLs

### How It Works

1. **Configuration Loading**: `config.js` is loaded first in both `popup.html` and `background.js`
2. **Environment Detection**: The extension checks `chrome.storage.sync` for:
   - `envMode`: 'auto', 'production', or 'local'
   - `appUrl`: Custom app URL (optional)
   - `backendUrl`: Custom backend URL (optional)
3. **Dynamic Updates**: Configuration updates automatically when storage changes

### Default URLs

**Production:**
- App URL: `https://instagram-dm-saas-h94m.vercel.app`
- Backend URL: `https://instagram-dm-saas-h94m.vercel.app` (same domain, Next.js API routes)

**Local:**
- App URL: `http://localhost:3000`
- Backend URL: `http://localhost:3001`

## Usage

### For Development
1. Load the extension in Chrome
2. The extension defaults to production
3. To switch to local, you can:
   - Manually set `envMode: 'local'` in `chrome.storage.sync`
   - Or set custom URLs via `appUrl` and `backendUrl`

### For Production
- No changes needed - extension defaults to production URLs
- All URLs are centralized in `config.js`

## Benefits

1. **Single Source of Truth**: All URLs in one place (`config.js`)
2. **No Duplication**: One set of files instead of prod/local versions
3. **Easy Updates**: Change URLs in one place
4. **Flexible**: Supports auto-detection, forced modes, and custom URLs
5. **Maintainable**: Less code to maintain

## Migration Notes

If you have existing builds or scripts that reference the old files:
- Update build scripts to use unified files
- Remove references to `*.prod.js` and `*.local.js`
- Use `manifest.json` instead of `manifest.prod.json` or `manifest.local.json`

