# 🚂 Railway Deployment Setup Guide

## ⚠️ Important: Root Directory Configuration

Railway needs to know which directory contains your backend code. Follow these steps carefully:

## Step-by-Step Setup

### 1. Create New Project in Railway

1. Go to https://railway.app
2. Sign up/login with GitHub
3. Click **"New Project"**
4. Select **"Deploy from GitHub repo"**
5. Choose your `instagram-dm-saas` repository

### 2. Configure Service Settings ⚠️ CRITICAL

After Railway creates the service, you **MUST** configure the root directory:

1. Click on the service (it will have a random name)
2. Go to **Settings** tab
3. Scroll to **"Root Directory"** section
4. **Set Root Directory to**: `backend`
5. Click **"Save"**

### 3. Configure Build Settings

Railway should auto-detect Node.js, but verify:

1. In **Settings** → **Build & Deploy**
2. **Build Command**: Leave empty (auto-detects from `package.json`)
   - OR manually set: `npm install && npm run build`
3. **Start Command**: Leave empty (auto-detects from `package.json`)
   - OR manually set: `npm run start:prod`

### 4. Add Environment Variables

Go to **Variables** tab and add:

```
DATABASE_URL=your_supabase_postgres_url
DIRECT_URL=your_supabase_direct_url
JWT_SECRET=your_jwt_secret_min_32_chars
ENCRYPTION_KEY=your_32_character_encryption_key
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://bulkdm-saas.netlify.app
```

### 5. Deploy

1. Railway will automatically start building
2. Watch the build logs
3. Once deployed, Railway will provide a URL like: `https://your-app.up.railway.app`

### 6. Get Your Backend URL

1. Go to **Settings** → **Networking**
2. Click **"Generate Domain"** (if not auto-generated)
3. Copy the URL (e.g., `https://your-app.up.railway.app`)

### 7. Update Netlify

1. Go to Netlify Dashboard
2. Site Settings → Environment Variables
3. Update `NEXT_PUBLIC_BACKEND_URL` with your Railway URL
4. Trigger a redeploy

## 🔧 Troubleshooting

### Error: "Railpack could not determine how to build"

**Solution:**
- Make sure **Root Directory** is set to `backend` in Railway settings
- The root directory setting is in: Service → Settings → Root Directory

### Error: "Script start.sh not found"

**Solution:**
- Railway auto-detects from `package.json` scripts
- Make sure `start:prod` script exists in `backend/package.json`
- Or set Start Command manually: `npm run start:prod`

### Build Fails

**Check:**
1. Build logs in Railway dashboard
2. Verify Node version (should be 18+)
3. Check if all dependencies install correctly
4. Verify environment variables are set

### API Not Responding

**Check:**
1. Service is running (green status)
2. PORT environment variable is set
3. CORS allows your frontend URL
4. Check logs for errors

### Database Connection Issues

**Check:**
1. DATABASE_URL is correct (Supabase connection string)
2. DIRECT_URL is set (for migrations)
3. Supabase allows connections from Railway IPs
4. Run migrations: Add a one-time command or use Railway's CLI

## 📝 Running Migrations

After deployment, run database migrations:

**Option 1: Railway CLI**
```bash
railway run npx prisma migrate deploy
```

**Option 2: One-time Command in Railway**
1. Go to service → Deployments
2. Click "..." → "Run Command"
3. Run: `npx prisma migrate deploy`

## ✅ Verification Checklist

- [ ] Root Directory set to `backend`
- [ ] Environment variables added
- [ ] Build completes successfully
- [ ] Service is running (green status)
- [ ] Backend URL is accessible
- [ ] Database migrations run
- [ ] CORS configured correctly
- [ ] Netlify updated with backend URL

## 🎯 Quick Reference

**Root Directory**: `backend` (MUST be set!)

**Build Command**: `npm install && npm run build` (or auto-detect)

**Start Command**: `npm run start:prod` (or auto-detect)

**Port**: `3001` (set via PORT env var)

**Required Env Vars**:
- DATABASE_URL
- DIRECT_URL
- JWT_SECRET
- ENCRYPTION_KEY
- NODE_ENV=production
- PORT=3001
- FRONTEND_URL

## 🆘 Still Having Issues?

1. Check Railway build logs
2. Verify Root Directory is `backend`
3. Check that `backend/package.json` exists
4. Verify Node.js version (18+)
5. Check environment variables are set correctly

---

**Most Common Issue**: Forgetting to set Root Directory to `backend`!

Make sure you set it in: Service → Settings → Root Directory → `backend`

