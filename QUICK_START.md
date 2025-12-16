# 🚀 Quick Start: Deploy to Vercel

## 1️⃣ Get Environment Variables

### Database (Choose one):
- **Vercel Postgres**: Dashboard → Storage → Create Postgres
- **Supabase**: supabase.com → New Project → Settings → Database
- **Railway**: railway.app → New PostgreSQL → Variables

### Supabase Auth:
- supabase.com → Settings → API → Copy URL & anon key

### Generate Secrets:
```bash
# JWT_SECRET
openssl rand -base64 32

# ENCRYPTION_KEY  
openssl rand -base64 32
```

## 2️⃣ Deploy to Vercel

1. Push to GitHub:
   ```bash
   git add .
   git commit -m "Ready for Vercel"
   git push
   ```

2. Go to vercel.com → Add New Project → Import GitHub repo

3. Set Environment Variables:
   - DATABASE_URL
   - DIRECT_URL
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - NEXT_PUBLIC_BACKEND_URL (set after deployment)
   - JWT_SECRET
   - ENCRYPTION_KEY

4. Deploy!

## 3️⃣ Update Extension

Edit `extension/popup.prod.js`:
```javascript
const APP_URL = 'https://your-project.vercel.app';
```

Rebuild:
```bash
cd extension && ./build.sh
```

## ✅ Done!

See detailed guides:
- `VERCEL_DEPLOYMENT_GUIDE.md` - Full deployment steps
- `ENV_VARIABLES_GUIDE.md` - Where to get each variable
- `EXTENSION_UPDATE_GUIDE.md` - Extension setup
