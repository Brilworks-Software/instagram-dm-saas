# 🚀 Deploy New Project via Vercel Dashboard

## ⚡ Quick Steps (5 minutes)

### Step 1: Go to Vercel
👉 **https://vercel.com/new**

### Step 2: Import Repository
1. Click **"Import Git Repository"**
2. Search for: `drdhavaltrivedi/instagram-dm-saas`
3. Click **"Import"**

### Step 3: Configure Project
- **Project Name**: `instagram-dm-saas-unified` (or your choice)
- **Framework**: Next.js (auto-detected) ✅
- **Root Directory**: `.` (leave as root)
- **Build Command**: `npm run build` (auto-detected)
- **Output Directory**: `.next` (auto-detected)
- **Install Command**: `npm install` (auto-detected)

**IMPORTANT**: 
- Select branch: **`vercel-single-project`** (not main!)

### Step 4: Environment Variables (Optional - Can add later)
Click **"Environment Variables"** and add:
- See `VERCEL_ENV_TEMPLATE.txt` for complete list
- You can add these after first deployment too

### Step 5: Deploy
1. Click **"Deploy"**
2. Wait 2-3 minutes for build
3. Your app will be live!

### Step 6: Set Environment Variables
After deployment:
1. Go to **Settings** → **Environment Variables**
2. Add all variables from `VERCEL_ENV_TEMPLATE.txt`
3. Update `NEXT_PUBLIC_BACKEND_URL` with your Vercel URL
4. Go to **Deployments** → Click **"Redeploy"**

---

## 📋 Environment Variables to Add

After first deployment, add these in **Settings → Environment Variables**:

```
DATABASE_URL=your-database-url
DIRECT_URL=your-direct-url
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_BACKEND_URL=https://your-new-project.vercel.app
JWT_SECRET=your-generated-secret
ENCRYPTION_KEY=your-generated-key
```

See `ENV_VARIABLES_GUIDE.md` for where to get each value.

---

## ✅ After Deployment

1. **Copy your Vercel URL** (e.g., `https://instagram-dm-saas-unified.vercel.app`)
2. **Update environment variables** (especially `NEXT_PUBLIC_BACKEND_URL`)
3. **Redeploy** to apply changes
4. **Run database migrations** if needed
5. **Update extension** with new URL

---

## 🎉 Done!

Your new Vercel project is deployed!

**Project URL**: Will be shown after deployment

