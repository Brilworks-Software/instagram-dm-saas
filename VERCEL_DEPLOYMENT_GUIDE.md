# 🚀 Complete Vercel Deployment Guide

## 📋 Step 1: Get Environment Variables

### 1. Database (DATABASE_URL & DIRECT_URL)

**Option A: Use Vercel Postgres (Recommended)**
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Create a new project or go to your project
3. Go to **Storage** tab
4. Click **Create Database** → Select **Postgres**
5. Copy the connection strings:
   - `DATABASE_URL` - Connection pooler URL
   - `DIRECT_URL` - Direct connection URL (usually same as DATABASE_URL)

**Option B: Use Supabase (Free Tier Available)**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project
3. Go to **Settings** → **Database**
4. Copy:
   - `Connection string` → Use for `DATABASE_URL`
   - `Connection pooling` → Use for `DIRECT_URL` (or same as DATABASE_URL)

**Option C: Use Railway/Neon/Other**
- Get connection string from your database provider
- Format: `postgresql://user:password@host:port/database`

### 2. Supabase (NEXT_PUBLIC_SUPABASE_URL & NEXT_PUBLIC_SUPABASE_ANON_KEY)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project (if you don't have one)
3. Go to **Settings** → **API**
4. Copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. Generate Security Keys

**JWT_SECRET** (Minimum 32 characters):
```bash
# Option 1: Using OpenSSL
openssl rand -base64 32

# Option 2: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Option 3: Online generator
# Visit: https://generate-secret.vercel.app/32
```

**ENCRYPTION_KEY** (Exactly 32 characters):
```bash
# Option 1: Using OpenSSL
openssl rand -base64 32

# Option 2: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 4. Backend URL (NEXT_PUBLIC_BACKEND_URL)

- **For Vercel**: This will be your Vercel deployment URL
- Example: `https://instagram-dm-saas-h94m.vercel.app`
- You'll set this after deployment

### 5. Optional: PostHog Analytics

1. Go to [PostHog](https://posthog.com)
2. Create account and project
3. Get your API key from Settings
4. Set `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST`

---

## 🚀 Step 2: Deploy to Vercel

### Method 1: Deploy via Vercel Dashboard (Recommended)

1. **Push to GitHub** (if not already):
   ```bash
   git add .
   git commit -m "Ready for Vercel deployment"
   git push origin main
   ```

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click **Add New Project**
   - Import your GitHub repository
   - Select the repository

3. **Configure Project**:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `.` (root)
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)
   - **Install Command**: `npm install` (auto-detected)

4. **Set Environment Variables**:
   Click **Environment Variables** and add:
   
   ```
   DATABASE_URL=your-database-connection-string
   DIRECT_URL=your-direct-connection-string
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   NEXT_PUBLIC_BACKEND_URL=https://your-project.vercel.app
   JWT_SECRET=your-generated-jwt-secret-min-32-chars
   ENCRYPTION_KEY=your-generated-encryption-key-32-chars
   NEXT_PUBLIC_POSTHOG_KEY=your-posthog-key (optional)
   NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com (optional)
   ```

5. **Deploy**:
   - Click **Deploy**
   - Wait for build to complete
   - Your app will be live at `https://your-project.vercel.app`

6. **Update Backend URL**:
   - After deployment, copy your Vercel URL
   - Go to **Settings** → **Environment Variables**
   - Update `NEXT_PUBLIC_BACKEND_URL` to your Vercel URL
   - Redeploy (or it will auto-redeploy on next push)

### Method 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? instagram-dm-saas (or your choice)
# - Directory? ./
# - Override settings? No

# Set environment variables
vercel env add DATABASE_URL
vercel env add DIRECT_URL
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# ... (add all variables)

# Deploy to production
vercel --prod
```

---

## 📦 Step 3: Run Database Migrations

After deployment, run Prisma migrations:

**Option 1: Via Vercel CLI**
```bash
vercel env pull .env.local
npx prisma migrate deploy
```

**Option 2: Via Supabase SQL Editor**
1. Go to Supabase Dashboard → SQL Editor
2. Run migrations from `prisma/migrations/` folder
3. Or run: `prisma/migrations/add_cookies_column.sql` if needed

**Option 3: Via Prisma Studio (Local)**
```bash
# Pull environment variables
vercel env pull .env.local

# Run migrations
npm run prisma:migrate:prod
```

---

## 🔌 Step 4: Update Extension

After deployment, update the extension to use your Vercel URL:

1. **Edit `extension/popup.prod.js`**:
   ```javascript
   const APP_URL = 'https://your-project.vercel.app';
   ```

2. **Edit `extension/manifest.prod.json`**:
   ```json
   "host_permissions": [
     "https://www.instagram.com/*",
     "https://instagram.com/*",
     "https://your-project.vercel.app/*"
   ]
   ```

3. **Rebuild Extension**:
   ```bash
   cd extension
   ./build.sh
   ```

4. **Load in Chrome**:
   - Go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select `extension/bulkdm-extension-prod-v1.0.1/` folder

---

## ✅ Step 5: Verify Deployment

1. **Check Vercel Dashboard**:
   - Go to your project
   - Check **Deployments** tab
   - Ensure build succeeded

2. **Test Application**:
   - Visit your Vercel URL
   - Try logging in
   - Connect an Instagram account
   - Test sending a DM

3. **Check Logs**:
   - Go to **Deployments** → Click on deployment → **Functions** tab
   - Check for any errors

---

## 🔧 Troubleshooting

### Build Fails

**Error: "Module not found"**
- Ensure all dependencies are in `package.json`
- Run `npm install` locally to verify

**Error: "Prisma Client not generated"**
- Add to `package.json` scripts:
  ```json
  "postinstall": "prisma generate"
  ```

**Error: "Environment variable not found"**
- Check all variables are set in Vercel
- Ensure `NEXT_PUBLIC_*` variables are set correctly

### Database Connection Issues

**Error: "Can't reach database"**
- Check `DATABASE_URL` is correct
- Verify database allows connections from Vercel IPs
- For Supabase: Check connection pooling settings

### Extension Not Working

**Error: "Cannot connect to backend"**
- Update `APP_URL` in extension to your Vercel URL
- Check CORS settings (should be automatic with Next.js)
- Verify extension has correct host permissions

---

## 📝 Complete Environment Variables Checklist

Copy this checklist and fill in your values:

```env
# Database (Required)
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Backend URL (Update after deployment)
NEXT_PUBLIC_BACKEND_URL=https://your-project.vercel.app

# Security (Required - Generate new values!)
JWT_SECRET=your-32-char-min-secret
ENCRYPTION_KEY=your-32-char-key

# Analytics (Optional)
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

---

## 🎉 You're Done!

Your application is now deployed on Vercel with:
- ✅ Frontend and Backend in one project
- ✅ Single `package.json` for all dependencies
- ✅ API routes working
- ✅ Database connected
- ✅ Extension ready to use

**Next Steps:**
1. Test the application
2. Update extension with Vercel URL
3. Share with users!

