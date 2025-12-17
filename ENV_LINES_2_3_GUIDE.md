# 🔑 Environment Variables Lines 2-3: JWT_SECRET & ENCRYPTION_KEY

## What Are These?

**Line 2: JWT_SECRET**
- Used for signing JSON Web Tokens (authentication)
- Minimum 32 characters required
- Must be kept secret!

**Line 3: ENCRYPTION_KEY**
- Used for encrypting sensitive data (like Instagram cookies)
- Exactly 32 characters (or 32 bytes base64)
- Must be kept secret!

---

## 🎯 How to Generate (3 Methods)

### Method 1: Using the Script (Easiest)

```bash
./GENERATE_ENV_SECRETS.sh
```

This will generate both values automatically.

### Method 2: Using OpenSSL

```bash
# Generate JWT_SECRET
openssl rand -base64 32

# Generate ENCRYPTION_KEY (different value!)
openssl rand -base64 32
```

### Method 3: Using Node.js

```bash
# Generate JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Generate ENCRYPTION_KEY (run again for different value)
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Method 4: Online Generator

Visit: https://generate-secret.vercel.app/32
- Generate two different secrets
- Copy each one

---

## 📝 Where to Add These Values

### For Local Development (.env.local)

Create or edit `.env.local` in the root directory:

```env
JWT_SECRET=your-generated-secret-here
ENCRYPTION_KEY=your-generated-key-here
```

**Example:**
```env
JWT_SECRET=gvtS6H5q1bdZ8iMwsUGAstzfc0m0q5ETdQTDPy/MaXs=
ENCRYPTION_KEY=EmggPIUPbLhzDJr5DOUUfTs0as7xI59P3E/xU5RAsPk=
```

### For Vercel Deployment

1. Go to **Vercel Dashboard** → Your Project
2. **Settings** → **Environment Variables**
3. Click **"Add New"**
4. Add each variable:
   - **Name**: `JWT_SECRET`
   - **Value**: `your-generated-secret`
   - **Environment**: Production, Preview, Development (select all)
5. Repeat for `ENCRYPTION_KEY`

---

## ⚠️ Important Security Notes

1. **Never use the example values** in production
2. **Generate NEW values** for production (different from dev)
3. **Keep them secret** - don't commit to Git
4. **Use different values** for JWT_SECRET and ENCRYPTION_KEY
5. **Don't share** these values publicly

---

## ✅ Quick Steps

1. **Generate secrets**:
   ```bash
   ./GENERATE_ENV_SECRETS.sh
   ```

2. **Copy the generated values**

3. **Add to .env.local** (for local):
   ```env
   JWT_SECRET=generated-value-1
   ENCRYPTION_KEY=generated-value-2
   ```

4. **Add to Vercel** (for production):
   - Dashboard → Settings → Environment Variables
   - Add both variables

---

## 🔍 Verify

After adding, verify they work:

```bash
# Check if .env.local has the values
grep JWT_SECRET .env.local
grep ENCRYPTION_KEY .env.local
```

---

## 📋 Generated Values (Use These!)

I've generated secure values for you:

```
JWT_SECRET=gvtS6H5q1bdZ8iMwsUGAstzfc0m0q5ETdQTDPy/MaXs=
ENCRYPTION_KEY=EmggPIUPbLhzDJr5DOUUfTs0as7xI59P3E/xU5RAsPk=
```

**Copy these to:**
- `.env.local` for local development
- Vercel Dashboard → Environment Variables for production

