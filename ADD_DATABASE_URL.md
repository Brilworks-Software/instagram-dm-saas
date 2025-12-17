# 🔧 Fix: Add DATABASE_URL to .env.local

## The Problem
Prisma requires `DATABASE_URL` and `DIRECT_URL` environment variables to connect to your database. These are currently missing from your `.env.local` file.

## Quick Fix Steps

### 1. Get Your Supabase Database Connection String

1. **Go to Supabase Dashboard:**
   - Visit: https://supabase.com/dashboard/project/gielnjqmgxlxihqmjjre
   - Or: https://supabase.com/dashboard → Select your project

2. **Navigate to Database Settings:**
   - Click **Settings** (gear icon) in the left sidebar
   - Click **Database** in the settings menu

3. **Copy Connection Strings:**
   - Scroll down to **"Connection string"** section
   - You'll see multiple tabs: **URI**, **JDBC**, **Golang**, etc.
   - Click the **URI** tab

4. **Get Two Connection Strings:**

   **For DATABASE_URL (Connection Pooling - Recommended):**
   - Look for **"Connection pooling"** section
   - Copy the connection string (usually port 6543)
   - Format: `postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres`

   **For DIRECT_URL (Direct Connection):**
   - Look for **"Direct connection"** section  
   - Copy the connection string (usually port 5432)
   - Format: `postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

### 2. Add to .env.local

Open your `.env.local` file and add these two lines:

```env
DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
DIRECT_URL=postgresql://postgres:[YOUR-PASSWORD]@db.gielnjqmgxlxihqmjjre.supabase.co:5432/postgres
```

**Replace:**
- `[YOUR-PASSWORD]` with your actual database password
- `[PROJECT-REF]` with `gielnjqmgxlxihqmjjre` (your project reference)
- `[REGION]` with your region (e.g., `us-east-1`, `eu-west-1`)

### 3. Alternative: If You Don't Know Your Password

If you forgot your database password:

1. Go to Supabase Dashboard → **Settings** → **Database**
2. Scroll to **"Database password"** section
3. Click **"Reset database password"**
4. Copy the new password
5. Use it in your connection strings

### 4. Restart Your Development Server

After adding the variables:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

## Example .env.local (with placeholders)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://gielnjqmgxlxihqmjjre.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Database (ADD THESE)
DATABASE_URL=postgresql://postgres.gielnjqmgxlxihqmjjre:YOUR_PASSWORD@aws-0-us-east-1.pooler.supabase.com:6543/postgres
DIRECT_URL=postgresql://postgres:YOUR_PASSWORD@db.gielnjqmgxlxihqmjjre.supabase.co:5432/postgres

# Other variables...
JWT_SECRET=your-jwt-secret
ENCRYPTION_KEY=your-encryption-key
```

## Verify It Works

After adding the variables and restarting, check the terminal. You should **NOT** see:
- ❌ `error: Environment variable not found: DATABASE_URL`
- ❌ `PrismaClientInitializationError`

Instead, you should see:
- ✅ Server running successfully
- ✅ API routes working without Prisma errors

## Still Having Issues?

1. **Check password:** Make sure the password in the connection string matches your Supabase database password
2. **Check format:** Ensure there are no extra spaces or quotes around the connection string
3. **Check file:** Make sure you're editing `.env.local` (not `.env`)
4. **Restart server:** Always restart after changing environment variables

