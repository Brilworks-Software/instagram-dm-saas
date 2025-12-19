# Extension Cookie Transfer Troubleshooting Guide

## Issue: "Cookies not found" Error

If you're seeing the error "Cookies not found. Please try connecting again using the extension", follow these steps:

### Step 1: Reload the Extension

1. Open Chrome and go to `chrome://extensions/`
2. Find "Socialora - Instagram Session Grabber"
3. Click the **Reload** button (circular arrow icon)
4. Make sure the extension is **Enabled**

### Step 2: Check Extension Permissions

1. In `chrome://extensions/`, click **Details** on the Socialora extension
2. Under **Site access**, make sure it has access to:
   - `https://www.socialora.app/*`
   - `https://www.instagram.com/*`
3. If not, click **Manage extension site access** and add the domains

### Step 3: Clear Browser Cache (if needed)

1. Open Chrome DevTools (F12)
2. Go to **Application** tab
3. Under **Storage**, click **Clear site data**
4. Refresh the page

### Step 4: Reconnect Using Extension

1. **Make sure you're logged into Instagram** in the same browser
2. Go to Instagram.com and stay logged in
3. Click the **Socialora extension icon** in your browser toolbar
4. Click **"Grab Instagram Session"** button
5. Wait for the success message: "✅ Connected!"
6. The extension will automatically open the Socialora app
7. The cookies should transfer automatically

### Step 5: Check Browser Console

If it still doesn't work, check the browser console for errors:

1. Open Chrome DevTools (F12)
2. Go to **Console** tab
3. Look for messages like:
   - `✓ Cookies saved to page localStorage`
   - `Cookies found in localStorage after X retries`
   - Any error messages in red

### Step 6: Manual Cookie Check

To verify cookies are being saved:

1. Open Chrome DevTools (F12)
2. Go to **Application** tab
3. Under **Local Storage**, click on your domain (e.g., `https://www.socialora.app`)
4. Look for keys starting with `socialora_cookies_`
5. If you see them, the cookies are saved correctly

### Common Issues and Solutions

#### Issue: Extension icon not showing
- **Solution**: Pin the extension to your toolbar (click the puzzle icon, then pin Socialora)

#### Issue: "Content script not ready"
- **Solution**: Wait a few seconds after the page loads, then try again. The extension retries automatically.

#### Issue: Cookies saved but not detected
- **Solution**: The page now polls for cookies up to 15 times (7.5 seconds). If it still fails, try:
  1. Close and reopen the Socialora tab
  2. Make sure you're on the correct domain (`www.socialora.app`)
  3. Check that the extension has the latest version

#### Issue: Extension not working on localhost
- **Solution**: Make sure `http://localhost:3000/*` is in the extension's host_permissions in manifest.json

### Debug Mode

To enable more detailed logging:

1. Open Chrome DevTools (F12)
2. Go to **Console** tab
3. You should see messages like:
   - `Socialora content script loaded`
   - `✓ Cookies saved to page localStorage`
   - `Received cookies via postMessage`

### Still Having Issues?

1. **Check extension version**: Make sure you have the latest version (1.0.3)
2. **Reinstall extension**: Remove and re-add the extension
3. **Check Instagram login**: Make sure you're logged into Instagram in the same browser
4. **Try different browser**: Test in a fresh Chrome profile

### Technical Details

The extension uses multiple methods to transfer cookies:
1. **Content Script** (primary): Runs on page load
2. **Script Injection** (fallback): Injects script directly
3. **PostMessage** (fallback): Uses window.postMessage
4. **Storage Events** (fallback): Dispatches storage events

The page polls localStorage for up to 15 seconds (30 attempts at 500ms intervals) to find the cookies.

