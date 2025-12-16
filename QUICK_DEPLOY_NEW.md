# ⚡ Quick Deploy to NEW Vercel Project

## 🎯 Fastest Method: Vercel Dashboard

### Step 1: Go to Vercel
👉 **https://vercel.com/new**

### Step 2: Import Repository
1. Click **"Import Git Repository"**
2. Select: `drdhavaltrivedi/instagram-dm-saas`
3. **IMPORTANT**: Select branch `vercel-single-project` (not main!)

### Step 3: Configure
- **Project Name**: `instagram-dm-saas-unified` (or your choice)
- **Framework**: Next.js (auto-detected) ✅
- **Root Directory**: `.` ✅
- **Build Command**: `npm run build` ✅

### Step 4: Deploy
- Click **"Deploy"** (you can add environment variables later)
- Wait ~2-3 minutes
- Your app will be live!

### Step 5: Set Environment Variables
After deployment:
1. Go to **Settings** → **Environment Variables**
2. Add all from `VERCEL_ENV_TEMPLATE.txt`
3. Update `NEXT_PUBLIC_BACKEND_URL` with your Vercel URL
4. **Redeploy**

---

## 🖥️ Alternative: CLI Method

```bash
# Login (first time)
npx vercel login

# Deploy (creates new project)
npx vercel --yes

# When asked "Link to existing project?" → NO
```

Or run:
```bash
./DEPLOY_NEW_PROJECT.sh
```

---

## 📋 Required Environment Variables

**Before or after first deploy**, add these in Vercel Dashboard:

```
DATABASE_URL=...
DIRECT_URL=...
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_BACKEND_URL=https://your-new-project.vercel.app
JWT_SECRET=...
ENCRYPTION_KEY=...
```

See `VERCEL_ENV_TEMPLATE.txt` for complete list and where to get each value.

---

## ✅ That's It!

Your new project will be at: `https://your-new-project.vercel.app`

**Current Status:**
- ✅ Build: Successful
- ✅ Code: Ready
- ✅ Vercel CLI: Installed
- ✅ Config: `vercel.json` ready

**Next**: Go to https://vercel.com/new and import your repo!

