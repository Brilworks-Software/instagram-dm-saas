# 🚀 Deploy to Vercel Now - Step by Step

## Option 1: Deploy via Vercel Dashboard (Easiest)

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin vercel-single-project
```

### Step 2: Create Project on Vercel

1. **Go to Vercel**: https://vercel.com
2. **Sign in** with GitHub
3. **Click "Add New Project"**
4. **Import your repository**: `drdhavaltrivedi/instagram-dm-saas`
5. **Select branch**: `vercel-single-project` (or `main`)

### Step 3: Configure Project

Vercel will auto-detect Next.js. Verify:
- **Framework Preset**: Next.js ✅
- **Root Directory**: `.` (root) ✅
- **Build Command**: `npm run build` ✅
- **Output Directory**: `.next` ✅

### Step 4: Set Environment Variables

**Before deploying**, click **"Environment Variables"** and add:

```env
DATABASE_URL=your-database-url
DIRECT_URL=your-direct-url
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_BACKEND_URL=https://your-project.vercel.app
JWT_SECRET=your-jwt-secret
ENCRYPTION_KEY=your-encryption-key
```

**Note**: Set `NEXT_PUBLIC_BACKEND_URL` after first deployment with your actual Vercel URL.

### Step 5: Deploy

1. Click **"Deploy"**
2. Wait for build to complete (~2-3 minutes)
3. Your app will be live at: `https://your-project.vercel.app`

### Step 6: Update Backend URL

After deployment:
1. Copy your Vercel URL
2. Go to **Settings** → **Environment Variables**
3. Update `NEXT_PUBLIC_BACKEND_URL` to your Vercel URL
4. **Redeploy** (or wait for auto-redeploy)

---

## Option 2: Deploy via Vercel CLI

### Step 1: Install & Login

```bash
# Install Vercel CLI (already in package.json)
npm install

# Login to Vercel
npx vercel login
```

### Step 2: Deploy

```bash
# Deploy to preview
npx vercel

# Or deploy to production
npx vercel --prod
```

### Step 3: Set Environment Variables

```bash
# Add each variable
npx vercel env add DATABASE_URL
npx vercel env add DIRECT_URL
npx vercel env add NEXT_PUBLIC_SUPABASE_URL
npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
npx vercel env add NEXT_PUBLIC_BACKEND_URL
npx vercel env add JWT_SECRET
npx vercel env add ENCRYPTION_KEY

# Pull env vars locally (optional)
npx vercel env pull .env.local
```

---

## 📋 Quick Checklist

Before deploying, make sure you have:

- [ ] Database URL (Vercel Postgres, Supabase, or Railway)
- [ ] Supabase URL and anon key
- [ ] Generated JWT_SECRET (32+ chars)
- [ ] Generated ENCRYPTION_KEY (32 chars)
- [ ] Code pushed to GitHub
- [ ] All changes committed

---

## 🎯 After Deployment

1. **Test the app**: Visit your Vercel URL
2. **Run migrations**: 
   ```bash
   npx vercel env pull .env.local
   npm run prisma:migrate:prod
   ```
3. **Update extension**: Change `APP_URL` in `extension/popup.prod.js`
4. **Test extension**: Load in Chrome and test connection

---

## 🔗 Your Project Info

- **GitHub**: `drdhavaltrivedi/instagram-dm-saas`
- **Branch**: `vercel-single-project`
- **Vercel URL**: Will be assigned after deployment

---

## ✅ Ready to Deploy!

Your project is ready. Choose Option 1 (Dashboard) for easiest deployment, or Option 2 (CLI) for more control.
