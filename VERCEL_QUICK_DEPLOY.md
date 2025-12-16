# ⚡ Quick Deploy to Vercel

## 🎯 Fastest Way: Vercel Dashboard

### 1. Push to GitHub
```bash
git add .
git commit -m "Ready for Vercel"
git push origin vercel-single-project
```

### 2. Deploy on Vercel
1. Go to: https://vercel.com/new
2. Click **"Import Git Repository"**
3. Select: `drdhavaltrivedi/instagram-dm-saas`
4. Select branch: `vercel-single-project`
5. Click **"Deploy"**

### 3. Set Environment Variables
After deployment, go to **Settings → Environment Variables** and add all from `VERCEL_ENV_TEMPLATE.txt`

---

## 🖥️ Or Use CLI

### Quick Deploy
```bash
# Login (first time only)
npx vercel login

# Deploy
npx vercel --prod
```

### Or Use Script
```bash
./START_DEPLOYMENT.sh
```

---

## 📋 Required Environment Variables

See `VERCEL_ENV_TEMPLATE.txt` for complete list.

**Minimum required:**
- `DATABASE_URL`
- `DIRECT_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `JWT_SECRET`
- `ENCRYPTION_KEY`

**After first deploy:**
- `NEXT_PUBLIC_BACKEND_URL` = your Vercel URL

---

## ✅ That's It!

Your app will be live in ~2 minutes!

