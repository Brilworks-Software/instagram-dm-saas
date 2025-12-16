# Railway Environment Variables - Copy & Paste Ready

## 📋 Complete Environment Variables for Railway

Copy and paste these into Railway Dashboard → Your Service → Variables tab:

```env
DATABASE_URL=YOUR_RAILWAY_POSTGRES_CONNECTION_STRING
DIRECT_URL=YOUR_RAILWAY_POSTGRES_DIRECT_CONNECTION_STRING
JWT_SECRET=CHANGE_THIS_TO_A_SECURE_32_CHAR_MIN_STRING
ENCRYPTION_KEY=CHANGE_THIS_TO_A_SECURE_32_CHAR_STRING
FRONTEND_URL=https://bulkdm-saas.netlify.app
NODE_ENV=production
PORT=3001
```

---

## 🔧 How to Fill Each Variable

### 1. DATABASE_URL
**Where to get it:**
- In Railway Dashboard, go to your **PostgreSQL** service
- Click on the **Variables** tab
- Copy the `DATABASE_URL` value
- OR click **Connect** → **Postgres Connection URL**

**Format:**
```
postgresql://postgres:PASSWORD@HOST:PORT/railway
```

**Example:**
```
postgresql://postgres:abc123xyz@containers-us-west-123.railway.app:5432/railway
```

---

### 2. DIRECT_URL
**Where to get it:**
- Same as DATABASE_URL (usually the same value)
- If using a connection pooler, use the direct connection string
- In Railway PostgreSQL, look for "Direct Connection" or use the same as DATABASE_URL

**Format:**
```
postgresql://postgres:PASSWORD@HOST:PORT/railway
```

**Note:** If you're using Railway's PostgreSQL, DIRECT_URL is usually the same as DATABASE_URL.

---

### 3. JWT_SECRET
**Generate a secure value:**
```bash
# Option 1: Using OpenSSL (recommended)
openssl rand -base64 32

# Option 2: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Option 3: Online generator
# Visit: https://generate-secret.vercel.app/32
```

**Requirements:**
- Minimum 32 characters
- Use a strong, random string
- Keep it secret!

**Example (DO NOT USE THIS - Generate your own!):**
```
JWT_SECRET=K8mN2pQ5rS7tU9vW1xY3zA5bC7dE9fG1hI3jK5lM7nO9pQ1rS3tU5vW7xY9z
```

---

### 4. ENCRYPTION_KEY
**Generate a secure value:**
```bash
# Option 1: Using OpenSSL (recommended)
openssl rand -base64 32

# Option 2: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Requirements:**
- Exactly 32 characters (or 32 bytes when base64 encoded)
- Use a strong, random string
- Different from JWT_SECRET!

**Example (DO NOT USE THIS - Generate your own!):**
```
ENCRYPTION_KEY=aB3cD5eF7gH9iJ1kL3mN5oP7qR9sT1uV3wX5yZ7aB9cD1eF3gH5iJ7kL9mN
```

---

### 5. FRONTEND_URL
**Fixed value (copy as-is):**
```
FRONTEND_URL=https://bulkdm-saas.netlify.app
```

**Important:** This is used for CORS configuration. Must match your Netlify URL exactly.

---

### 6. NODE_ENV
**Fixed value (copy as-is):**
```
NODE_ENV=production
```

---

### 7. PORT
**Fixed value (copy as-is):**
```
PORT=3001
```

**Note:** Railway may override this with `$PORT`. If so, the app will use Railway's assigned port automatically.

---

## 🚀 Quick Setup Steps

### Step 1: Get Database URLs
1. Go to Railway Dashboard
2. Find your **PostgreSQL** service
3. Click on it → **Variables** tab
4. Copy `DATABASE_URL` value
5. Use the same value for `DIRECT_URL` (unless you have a direct connection string)

### Step 2: Generate Secrets
Run these commands locally to generate secure secrets:

```bash
# Generate JWT_SECRET
echo "JWT_SECRET=$(openssl rand -base64 32)"

# Generate ENCRYPTION_KEY
echo "ENCRYPTION_KEY=$(openssl rand -base64 32)"
```

### Step 3: Add to Railway
1. Go to Railway Dashboard
2. Select your **Backend** service
3. Click **Variables** tab
4. Click **+ New Variable** for each variable
5. Paste the values

### Step 4: Verify
After adding all variables:
1. Click **Deploy** or trigger a new deployment
2. Check the **Logs** tab
3. You should see: `🚀 Backend running on http://localhost:3001`
4. No database connection errors

---

## 📝 Complete Example (Replace with YOUR values)

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@containers-us-west-123.railway.app:5432/railway
DIRECT_URL=postgresql://postgres:YOUR_PASSWORD@containers-us-west-123.railway.app:5432/railway
JWT_SECRET=YOUR_GENERATED_JWT_SECRET_32_CHARS_MIN
ENCRYPTION_KEY=YOUR_GENERATED_ENCRYPTION_KEY_32_CHARS
FRONTEND_URL=https://bulkdm-saas.netlify.app
NODE_ENV=production
PORT=3001
```

---

## ⚠️ Important Notes

1. **Never commit secrets to Git** - These are sensitive values
2. **Use different secrets for production** - Don't reuse development secrets
3. **Keep secrets secure** - Store them safely, don't share publicly
4. **DATABASE_URL and DIRECT_URL** - Usually the same in Railway, but DIRECT_URL bypasses connection poolers
5. **FRONTEND_URL** - Must match your Netlify URL exactly for CORS to work

---

## 🔍 Troubleshooting

### Database Connection Errors
- Verify `DATABASE_URL` is correct
- Check PostgreSQL service is running in Railway
- Ensure database exists and is accessible

### CORS Errors
- Verify `FRONTEND_URL` matches your Netlify URL exactly
- Check backend logs for CORS rejection messages

### Authentication Errors
- Verify `JWT_SECRET` is at least 32 characters
- Ensure `ENCRYPTION_KEY` is exactly 32 characters

---

## ✅ Verification Checklist

After setting all variables:
- [ ] DATABASE_URL is set and correct
- [ ] DIRECT_URL is set (same as DATABASE_URL usually)
- [ ] JWT_SECRET is set (32+ characters)
- [ ] ENCRYPTION_KEY is set (32 characters)
- [ ] FRONTEND_URL is set to `https://bulkdm-saas.netlify.app`
- [ ] NODE_ENV is set to `production`
- [ ] PORT is set to `3001`
- [ ] Backend service restarted/redeployed
- [ ] Logs show successful startup
- [ ] No database connection errors

---

## 🆘 Need Help?

If you're still having issues:
1. Check Railway deployment logs
2. Verify all environment variables are set correctly
3. Ensure PostgreSQL service is running
4. Check Railway status: https://status.railway.app

