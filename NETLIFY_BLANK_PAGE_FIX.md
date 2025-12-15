# Netlify Blank Page Issue - Root Cause & Fix

## Problem
The site shows a blank page because all `/_next/static/*` requests return HTML instead of the actual static files (CSS/JS).

## Root Cause
The `@netlify/plugin-nextjs` plugin is installed but not properly handling static file routing. This is a known issue with Next.js 14 on Netlify.

## Solution Options

### Option 1: Check Netlify Dashboard Settings (RECOMMENDED)

1. Go to https://app.netlify.com/projects/bulkdm-saas
2. Go to **Site settings** → **Build & deploy** → **Build settings**
3. Verify:
   - **Base directory**: `frontend` (or leave empty if deploying from root)
   - **Build command**: `npm run build`
   - **Publish directory**: Leave EMPTY (plugin handles this)
4. Go to **Plugins** section
5. Ensure `@netlify/plugin-nextjs` is listed and enabled
6. If not, click **Add plugin** and search for `@netlify/plugin-nextjs`
7. **Trigger a new deploy** from the Deploys tab

### Option 2: Manual Redirect Rules (If plugin doesn't work)

Add to `netlify.toml`:
```toml
[[redirects]]
  from = "/_next/static/*"
  to = "/.netlify/builders/_next/static/:splat"
  status = 200
  force = true
```

### Option 3: Use Netlify's Next.js Runtime

The plugin should automatically use Netlify's Next.js Runtime. Check the build logs to see:
- `Using Next.js Runtime - v5.x.x`

If you see this, the plugin is working but there might be a CDN cache issue.

### Option 4: Clear Netlify CDN Cache

1. Go to Netlify Dashboard → **Site settings** → **Build & deploy** → **Post processing**
2. Click **Clear cache and deploy site**
3. Wait for redeploy

## Current Status

- ✅ Plugin installed: `@netlify/plugin-nextjs` in `package.json`
- ✅ Plugin configured: Listed in `netlify.toml`
- ✅ Build succeeds: All files generated correctly
- ❌ Static files not served: Returning HTML instead of actual files

## Next Steps

1. **Check Netlify Dashboard** - Verify plugin is enabled
2. **Clear CDN Cache** - May be a caching issue
3. **Check Build Logs** - Verify plugin is running during build
4. **Try Manual Redirects** - If plugin still doesn't work

## Verification

After fix, check browser console - should see:
- ✅ CSS files loading (no MIME type errors)
- ✅ JS files loading (no MIME type errors)
- ✅ Page renders correctly

