# Vercel Deployment - Single Project

This project has been migrated to a single Next.js project structure for Vercel deployment.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create `.env.local` file:

```env
# Database (Vercel Postgres or external)
DATABASE_URL="postgresql://user:password@host:5432/database"
DIRECT_URL="postgresql://user:password@host:5432/database"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"

# Backend URL (your Vercel deployment)
NEXT_PUBLIC_BACKEND_URL="https://instagram-dm-saas-h94m.vercel.app"

# Optional: Analytics
NEXT_PUBLIC_POSTHOG_KEY=""
NEXT_PUBLIC_POSTHOG_HOST="https://us.i.posthog.com"

# Security (generate secure values)
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
ENCRYPTION_KEY="your-32-character-encryption-key"
```

### 3. Generate Prisma Client

```bash
npm run prisma:generate
```

### 4. Run Database Migrations

```bash
npm run prisma:migrate:dev
```

### 5. Start Development Server

```bash
npm run dev
```

## 📁 Project Structure

```
instagram-dm-saas/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── api/                # API routes (backend)
│   │   └── (dashboard)/        # Frontend pages
│   ├── lib/                    # Shared libraries
│   │   └── backend/            # Backend services
│   └── components/             # React components
├── prisma/                     # Database schema
├── public/                     # Static files
├── package.json                # Dependencies
└── vercel.json                 # Vercel config
```

## 🔌 API Endpoints

### Instagram Cookie API

- `POST /api/instagram/cookie/verify` - Verify Instagram cookies
- `POST /api/instagram/cookie/connect` - Connect Instagram account

More endpoints can be added as needed.

## 🚢 Deploy to Vercel

1. **Connect Repository**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - Import your GitHub repository

2. **Configure Project**:
   - Framework Preset: Next.js
   - Root Directory: `.` (root)
   - Build Command: `npm run build`
   - Output Directory: `.next`

3. **Set Environment Variables**:
   - Add all variables from `.env.local`
   - Make sure `NEXT_PUBLIC_BACKEND_URL` points to your Vercel URL

4. **Deploy**:
   - Click "Deploy"
   - Vercel will automatically deploy on every push

## 📝 Notes

- All API routes are in `src/app/api/`
- Backend services are in `src/lib/backend/`
- Prisma is at root level
- Single `package.json` for all dependencies

## 🔄 Migration Status

✅ Core structure migrated
✅ Essential API routes converted
✅ Extension updated for Vercel
⏳ Additional API routes can be converted as needed

See `MIGRATION_SUMMARY.md` for detailed migration status.

