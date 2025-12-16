# 🔑 Environment Variables Guide

## Where to Get Each Environment Variable

### 1. DATABASE_URL & DIRECT_URL

**Source: Your Database Provider**

#### Option A: Vercel Postgres (Recommended for Vercel)
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Your Project → **Storage** tab
3. Click **Create Database** → **Postgres**
4. Copy:
   - `POSTGRES_URL` → Use as `DATABASE_URL`
   - `POSTGRES_PRISMA_URL` → Use as `DIRECT_URL` (or same as DATABASE_URL)

#### Option B: Supabase (Free Tier Available)
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Your Project → **Settings** → **Database**
3. Copy:
   - **Connection string** → `DATABASE_URL`
   - **Connection pooling** → `DIRECT_URL` (or use same as DATABASE_URL)
4. Format: `postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

#### Option C: Railway
1. Go to [Railway Dashboard](https://railway.app)
2. Your PostgreSQL Service → **Variables** tab
3. Copy `DATABASE_URL`
4. Use same for `DIRECT_URL` (or get direct connection if available)

#### Option D: Neon, PlanetScale, or Other
- Get connection string from your provider's dashboard
- Format: `postgresql://user:password@host:port/database`

---

### 2. NEXT_PUBLIC_SUPABASE_URL

**Source: Supabase Dashboard**

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Your Project → **Settings** → **API**
3. Copy **Project URL**
4. Format: `https://xxxxxxxxxxxxx.supabase.co`

---

### 3. NEXT_PUBLIC_SUPABASE_ANON_KEY

**Source: Supabase Dashboard**

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Your Project → **Settings** → **API**
3. Copy **anon public** key (under "Project API keys")
4. Format: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (long JWT token)

---

### 4. JWT_SECRET

**Generate Your Own (DO NOT use example values!)**

**Method 1: OpenSSL (Recommended)**
```bash
openssl rand -base64 32
```

**Method 2: Node.js**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Method 3: Online Generator**
- Visit: https://generate-secret.vercel.app/32
- Generate a 32+ character secret

**Requirements:**
- Minimum 32 characters
- Keep it secret!
- Use different values for development and production

---

### 5. ENCRYPTION_KEY

**Generate Your Own (DO NOT use example values!)**

**Method 1: OpenSSL (Recommended)**
```bash
openssl rand -base64 32
```

**Method 2: Node.js**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Requirements:**
- Exactly 32 characters (or 32 bytes base64 encoded)
- Keep it secret!
- Use different values for development and production

---

### 6. NEXT_PUBLIC_BACKEND_URL

**Source: Your Vercel Deployment URL**

1. After deploying to Vercel, you'll get a URL like:
   - `https://instagram-dm-saas-h94m.vercel.app`
2. Use this as `NEXT_PUBLIC_BACKEND_URL`
3. **Note**: Since frontend and backend are in the same project, this is your Vercel URL

---

### 7. NEXT_PUBLIC_POSTHOG_KEY (Optional)

**Source: PostHog Dashboard**

1. Go to [PostHog](https://posthog.com)
2. Create account and project
3. Go to **Settings** → **Project API Key**
4. Copy the key

---

### 8. NEXT_PUBLIC_POSTHOG_HOST (Optional)

**Default Value:**
```
https://us.i.posthog.com
```

Or use your self-hosted PostHog URL if applicable.

---

## 📋 Quick Reference

### Required Variables

| Variable | Where to Get | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Database provider dashboard | `postgresql://user:pass@host:5432/db` |
| `DIRECT_URL` | Same as DATABASE_URL (usually) | `postgresql://user:pass@host:5432/db` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API | `eyJhbGciOiJIUzI1NiIs...` |
| `NEXT_PUBLIC_BACKEND_URL` | Your Vercel URL | `https://your-project.vercel.app` |
| `JWT_SECRET` | Generate (see above) | `wAJUUr7GPFADRrdbze9UetTAYJJpd+CunPrpAYJBweA=` |
| `ENCRYPTION_KEY` | Generate (see above) | `OvO0hpeBBumWMKpptlpxZZxjt3deakjeRXpjInpdN2Y=` |

### Optional Variables

| Variable | Where to Get | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_POSTHOG_KEY` | PostHog dashboard | (empty) |
| `NEXT_PUBLIC_POSTHOG_HOST` | PostHog dashboard | `https://us.i.posthog.com` |

---

## 🚨 Security Notes

1. **Never commit `.env` files to Git**
   - Already in `.gitignore`
   - Use `.env.local` for local development

2. **Use different secrets for production**
   - Generate new `JWT_SECRET` and `ENCRYPTION_KEY` for production
   - Don't reuse development secrets

3. **Keep secrets secure**
   - Don't share in screenshots
   - Don't post in public channels
   - Rotate if compromised

---

## ✅ Verification

After setting all variables, verify:

1. **Database Connection**:
   ```bash
   npm run prisma:generate
   npm run prisma:migrate:dev
   ```

2. **Supabase Connection**:
   - Try logging in to your app
   - Check Supabase dashboard for auth logs

3. **Build Test**:
   ```bash
   npm run build
   ```
   - Should complete without errors

---

## 📝 Example .env.local File

Create `.env.local` in the root directory:

```env
# Database
DATABASE_URL="postgresql://postgres:password@db.xxx.supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:password@db.xxx.supabase.co:5432/postgres"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Backend URL (local development)
NEXT_PUBLIC_BACKEND_URL="http://localhost:3000"

# Security (Generate your own!)
JWT_SECRET="your-generated-secret-min-32-chars"
ENCRYPTION_KEY="your-generated-key-32-chars"

# Optional: Analytics
NEXT_PUBLIC_POSTHOG_KEY=""
NEXT_PUBLIC_POSTHOG_HOST="https://us.i.posthog.com"
```

**Remember**: Replace all placeholder values with your actual values!

