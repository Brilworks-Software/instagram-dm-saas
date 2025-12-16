# 🆕 Create New Vercel Project & Deploy

## Step 1: Prepare Code

Make sure all changes are committed:
```bash
git add .
git commit -m "Ready for new Vercel deployment"
git push origin vercel-single-project
```

## Step 2: Create New Project on Vercel

### Option A: Via Vercel Dashboard (Recommended)

1. **Go to Vercel**: https://vercel.com/new
2. **Sign in** with your GitHub account
3. **Click "Add New Project"**
4. **Import Repository**:
   - Select: `drdhavaltrivedi/instagram-dm-saas`
   - **Important**: Select branch `vercel-single-project` (not main)
5. **Configure Project**:
   - **Project Name**: `instagram-dm-saas-unified` (or your choice)
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `.` (root)
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)
6. **Environment Variables**: 
   - Click "Environment Variables" to add them (see below)
   - Or add after first deployment
7. **Click "Deploy"**

### Option B: Via Vercel CLI

```bash
# Login first (if not already)
npx vercel login

# Create new project and deploy
npx vercel --yes

# When prompted:
# - Set up and deploy? Yes
# - Which scope? Your team
# - Link to existing project? NO (to create new)
# - Project name? instagram-dm-saas-unified
# - Directory? ./
```

## Step 3: Set Environment Variables

After deployment, go to **Vercel Dashboard → Your Project → Settings → Environment Variables**

Add these variables (see `VERCEL_ENV_TEMPLATE.txt` for details):

```env
DATABASE_URL=your-database-url
DIRECT_URL=your-direct-url
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_BACKEND_URL=https://your-new-project.vercel.app
JWT_SECRET=your-generated-secret
ENCRYPTION_KEY=your-generated-key
```

**Important**: Update `NEXT_PUBLIC_BACKEND_URL` with your actual Vercel URL after deployment.

## Step 4: Redeploy

After setting environment variables:
1. Go to **Deployments** tab
2. Click **"Redeploy"** on the latest deployment
3. Or push a new commit to trigger auto-deploy

## Step 5: Run Database Migrations

After deployment, run migrations:

```bash
# Pull environment variables
npx vercel env pull .env.local

# Run migrations
npm run prisma:migrate:prod
```

Or run migrations via Supabase SQL Editor if using Supabase.

## Step 6: Update Extension

Edit `extension/popup.prod.js`:
```javascript
const APP_URL = 'https://your-new-project.vercel.app';
```

Rebuild:
```bash
cd extension && ./build.sh
```

## ✅ Done!

Your new Vercel project is deployed and ready!

**Project URL**: `https://your-new-project.vercel.app`

