# 🔌 Extension Update Guide for Vercel

After deploying to Vercel, update the Chrome extension to use your new Vercel URL.

## 📝 Step 1: Update Extension Files

### 1. Update `extension/popup.prod.js`

Find this line (around line 5):
```javascript
const APP_URL = 'https://bulkdm-saas.netlify.app';
```

Change to:
```javascript
const APP_URL = 'https://your-project.vercel.app';
```

Replace `your-project.vercel.app` with your actual Vercel URL.

### 2. Update `extension/manifest.prod.json`

Find the `host_permissions` section:
```json
"host_permissions": [
  "https://www.instagram.com/*",
  "https://instagram.com/*",
  "https://bulkdm-saas.netlify.app/*"
]
```

Change to:
```json
"host_permissions": [
  "https://www.instagram.com/*",
  "https://instagram.com/*",
  "https://your-project.vercel.app/*",
  "https://*.vercel.app/*"
]
```

### 3. Update `extension/background.prod.js` (if exists)

Find:
```javascript
const APP_URL = 'https://bulkdm-saas.netlify.app';
```

Change to:
```javascript
const APP_URL = 'https://your-project.vercel.app';
```

---

## 🔨 Step 2: Rebuild Extension

```bash
cd extension
./build.sh
```

This will create:
- `bulkdm-extension-prod-v1.0.1.zip` - For Chrome Web Store
- `bulkdm-extension-prod-v1.0.1/` - For local testing

---

## 🧪 Step 3: Test Extension Locally

1. **Load Extension in Chrome**:
   - Open Chrome
   - Go to `chrome://extensions/`
   - Enable **Developer mode** (toggle in top right)
   - Click **Load unpacked**
   - Select the folder: `extension/bulkdm-extension-prod-v1.0.1/`

2. **Test Connection**:
   - Go to Instagram and log in
   - Click the extension icon
   - Click "Grab Instagram Session"
   - Should connect to your Vercel app

---

## 📦 Step 4: Update Chrome Web Store (If Published)

1. **Go to Chrome Web Store Developer Dashboard**:
   - https://chrome.google.com/webstore/devconsole

2. **Select Your Extension**:
   - Click on "BulkDM - Instagram Session Grabber"

3. **Upload New Version**:
   - Click **Package** tab
   - Upload `bulkdm-extension-prod-v1.0.1.zip`
   - Update version number if needed
   - Submit for review

---

## ✅ Verification Checklist

- [ ] Updated `APP_URL` in `popup.prod.js`
- [ ] Updated `host_permissions` in `manifest.prod.json`
- [ ] Updated `background.prod.js` (if exists)
- [ ] Rebuilt extension with `./build.sh`
- [ ] Tested extension locally
- [ ] Extension connects to Vercel URL successfully
- [ ] Updated Chrome Web Store (if published)

---

## 🔍 Troubleshooting

### Extension Shows "Cannot connect to backend"

**Check:**
1. Vercel URL is correct in extension files
2. Vercel deployment is live and working
3. Extension has correct host permissions
4. CORS is enabled (should be automatic with Next.js)

### Extension Works But Can't Save Account

**Check:**
1. `NEXT_PUBLIC_BACKEND_URL` is set correctly in Vercel
2. API routes are working: `https://your-project.vercel.app/api/instagram/cookie/verify`
3. Database is connected and migrations are run

---

## 📝 Quick Update Script

Create a script to quickly update the extension URL:

```bash
#!/bin/bash
# update-extension-url.sh

NEW_URL="https://your-project.vercel.app"

# Update popup.prod.js
sed -i "s|const APP_URL = '.*';|const APP_URL = '${NEW_URL}';|g" extension/popup.prod.js

# Update manifest.prod.json (if needed)
# sed -i "s|https://.*\.netlify\.app|${NEW_URL}|g" extension/manifest.prod.json

echo "Extension URL updated to: ${NEW_URL}"
echo "Now run: cd extension && ./build.sh"
```

Make it executable:
```bash
chmod +x update-extension-url.sh
./update-extension-url.sh
```

---

## 🎉 Done!

Your extension is now configured to work with your Vercel deployment!

