# 🆓 Free Backend Deployment Options for BulkDM

This guide covers the best **FREE** platforms to deploy your NestJS backend API.

## 🏆 Top Recommendations

### 1. **Railway** ⭐ (Best Overall)

**Free Tier:**
- ✅ $5 free credit monthly (enough for small apps)
- ✅ Automatic deployments from GitHub
- ✅ PostgreSQL database included
- ✅ Custom domains
- ✅ No credit card required initially

**Steps:**

1. **Sign Up**
   - Go to https://railway.app
   - Sign up with GitHub (free)

2. **Create Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your `instagram-dm-saas` repository

3. **Add Service**
   - Click "New" → "GitHub Repo"
   - Select your repository
   - Railway will auto-detect it's a Node.js app

4. **Configure Settings** ⚠️ IMPORTANT
   - Click on the service → Settings
   - **Root Directory**: `backend` (This is CRITICAL!)
   - **Build Command**: Leave empty (Railway will auto-detect from package.json)
   - **Start Command**: Leave empty (Railway will use `npm run start:prod` from package.json)
   
   **OR** if Railway doesn't auto-detect:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start:prod`

5. **Add Environment Variables**
   - Go to Variables tab
   - Add these variables:
   ```
   DATABASE_URL=your_supabase_postgres_url
   DIRECT_URL=your_supabase_direct_url
   JWT_SECRET=your_jwt_secret_min_32_chars
   ENCRYPTION_KEY=your_32_character_encryption_key
   NODE_ENV=production
   PORT=3001
   ```

6. **Get Your URL**
   - Railway provides: `https://your-app.up.railway.app`
   - Update `NEXT_PUBLIC_BACKEND_URL` in Netlify

**Note:** After $5 credit runs out, you'll need to add a payment method, but it's very affordable (~$5-10/month for small apps).

---

### 2. **Render** ⭐ (Best for Always-On)

**Free Tier:**
- ✅ Free tier available (spins down after 15 min inactivity)
- ✅ Automatic deployments
- ✅ PostgreSQL database (free tier)
- ✅ Custom domains
- ⚠️ Cold starts (first request after inactivity takes ~30s)

**Steps:**

1. **Sign Up**
   - Go to https://render.com
   - Sign up with GitHub

2. **Create Web Service**
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Select `instagram-dm-saas`

3. **Configure**
   - **Name**: `bulkdm-backend` (or any name)
   - **Environment**: `Node`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start:prod`
   - **Plan**: Free

4. **Add Environment Variables**
   - Scroll to "Environment Variables"
   - Add the same variables as Railway

5. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (~5-10 minutes)
   - Get URL: `https://your-app.onrender.com`

**Note:** Free tier spins down after 15 minutes of inactivity. First request after spin-down takes ~30 seconds.

---

### 3. **Fly.io** ⭐ (Best Performance)

**Free Tier:**
- ✅ 3 shared-cpu VMs (256MB RAM each)
- ✅ 3GB persistent volume storage
- ✅ 160GB outbound data transfer
- ✅ No cold starts
- ✅ Global edge network

**Steps:**

1. **Install Fly CLI**
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Login**
   ```bash
   fly auth login
   ```

3. **Create App**
   ```bash
   cd backend
   fly launch
   ```
   - Choose app name
   - Select region
   - Don't deploy PostgreSQL (use Supabase)

4. **Create fly.toml** (if not auto-generated)
   ```toml
   app = "your-app-name"
   primary_region = "iad"

   [build]
     builder = "paketobuildpacks/builder:base"

   [http_service]
     internal_port = 3001
     force_https = true
     auto_stop_machines = false
     auto_start_machines = true
     min_machines_running = 1
     processes = ["app"]

   [[vm]]
     cpu_kind = "shared"
     cpus = 1
     memory_mb = 256
   ```

5. **Set Secrets**
   ```bash
   fly secrets set DATABASE_URL="your_supabase_url"
   fly secrets set DIRECT_URL="your_supabase_direct_url"
   fly secrets set JWT_SECRET="your_jwt_secret"
   fly secrets set ENCRYPTION_KEY="your_encryption_key"
   fly secrets set NODE_ENV="production"
   fly secrets set PORT="3001"
   ```

6. **Deploy**
   ```bash
   fly deploy
   ```

7. **Get URL**
   - Your app will be at: `https://your-app-name.fly.dev`

---

### 4. **Cyclic** (Simplest)

**Free Tier:**
- ✅ Always-on free tier
- ✅ Automatic deployments
- ✅ No configuration needed
- ⚠️ Limited to serverless functions

**Steps:**

1. **Sign Up**
   - Go to https://cyclic.sh
   - Sign up with GitHub

2. **Deploy**
   - Click "Deploy Now"
   - Select your repository
   - Cyclic auto-detects and deploys

3. **Configure**
   - Add environment variables in dashboard
   - Get URL: `https://your-app.cyclic.app`

**Note:** May require some adjustments for NestJS (better for Express/Serverless).

---

### 5. **Koyeb** (Good Alternative)

**Free Tier:**
- ✅ Always-on free tier
- ✅ Automatic deployments
- ✅ Global edge network
- ✅ 256MB RAM, 0.25 vCPU

**Steps:**

1. **Sign Up**
   - Go to https://www.koyeb.com
   - Sign up with GitHub

2. **Create App**
   - Click "Create App"
   - Select "GitHub"
   - Choose repository

3. **Configure**
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build`
   - **Run Command**: `npm run start:prod`

4. **Add Environment Variables**
   - Add all required variables

5. **Deploy**
   - Click "Deploy"
   - Get URL: `https://your-app.koyeb.app`

---

## 📊 Comparison Table

| Platform | Free Tier | Always-On | Cold Starts | Database | Best For |
|----------|-----------|-----------|-------------|----------|----------|
| **Railway** | $5/month credit | ✅ Yes | ❌ No | ✅ Included | Best overall |
| **Render** | Free | ⚠️ Spins down | ✅ Yes (~30s) | ✅ Included | Development/testing |
| **Fly.io** | 3 VMs free | ✅ Yes | ❌ No | ❌ No | Production apps |
| **Cyclic** | Free | ✅ Yes | ⚠️ Minimal | ❌ No | Simple apps |
| **Koyeb** | Free | ✅ Yes | ⚠️ Minimal | ❌ No | Global apps |

---

## 🎯 Recommended Setup

### For Development/Testing:
**Use Render** - Free tier is perfect for testing, spins down when not in use.

### For Production:
**Use Railway** - Best balance of features and cost. $5/month credit is usually enough for small apps.

### For High Performance:
**Use Fly.io** - Best performance, no cold starts, global network.

---

## 📝 Quick Start (Railway - Recommended)

```bash
# 1. Go to Railway
https://railway.app

# 2. Sign up with GitHub

# 3. New Project → Deploy from GitHub

# 4. Select your repo

# 5. Configure:
#    - Root Directory: backend
#    - Build: npm install && npm run build
#    - Start: npm run start:prod

# 6. Add environment variables

# 7. Deploy!

# 8. Get URL and update Netlify
```

---

## 🔧 After Deployment

1. **Update Netlify Environment Variable**
   - Go to Netlify Dashboard
   - Site Settings → Environment Variables
   - Update `NEXT_PUBLIC_BACKEND_URL` with your backend URL
   - Trigger redeploy

2. **Update Extension** (if published)
   - Update `extension/popup.prod.js` and `extension/background.prod.js`
   - Change `BACKEND_URL` to your new backend URL
   - Rebuild and republish

3. **Test Backend**
   ```bash
   curl https://your-backend-url.com/api/health
   ```

4. **Run Database Migrations**
   ```bash
   cd backend
   npx prisma migrate deploy
   ```

---

## ⚠️ Important Notes

1. **Database**: All platforms support connecting to Supabase PostgreSQL. Use your Supabase connection string.

2. **CORS**: Make sure your backend allows requests from `https://bulkdm-saas.netlify.app`

3. **Environment Variables**: Never commit `.env` files. Always use platform's environment variable settings.

4. **Build Time**: First deployment may take 5-10 minutes. Subsequent deployments are faster.

5. **Monitoring**: Most platforms provide logs and monitoring in their dashboards.

---

## 🆘 Troubleshooting

**Build Fails?**
- Check build logs in platform dashboard
- Verify Node version (should be 18+)
- Check environment variables are set

**API Not Responding?**
- Check if service is running
- Verify PORT environment variable
- Check logs for errors

**Database Connection Issues?**
- Verify DATABASE_URL is correct
- Check if Supabase allows connections from platform IPs
- Verify DIRECT_URL for migrations

**CORS Errors?**
- Update CORS settings in `backend/src/main.ts`
- Add your frontend URL to allowed origins

---

## 💰 Cost After Free Tier

- **Railway**: ~$5-10/month (very affordable)
- **Render**: $7/month for always-on
- **Fly.io**: ~$2-5/month (pay as you go)
- **Koyeb**: ~$5-10/month
- **Cyclic**: Free tier is generous

---

## ✅ Recommended: Railway

**Why Railway?**
- ✅ Easiest setup
- ✅ $5 free credit monthly
- ✅ Best developer experience
- ✅ Automatic deployments
- ✅ Great documentation
- ✅ PostgreSQL included

**Get Started:** https://railway.app

---

Need help? Check the platform's documentation or open an issue on GitHub.

