# Railway Backend "Application failed to respond" Fix

## Problem
Railway backend is showing "Application failed to respond" error when accessing:
`https://instagram-dm-saas-production.up.railway.app/api/instagram/cookie/verify`

## Root Causes

1. **Backend service crashed or not running**
2. **Missing or incorrect environment variables**
3. **Database connection issues**
4. **Build/deployment errors**

## Solution Steps

### Step 1: Check Railway Deployment Status

1. Go to https://railway.app
2. Login to your account
3. Select your project: `instagram-dm-saas-production`
4. Check the **Deployments** tab for recent builds
5. Look for any failed deployments (red status)

### Step 2: Check Deployment Logs

1. Click on the latest deployment
2. Review the **Build Logs** for errors:
   - Look for `npm install` failures
   - Check for Prisma generation errors
   - Verify build completion

3. Review the **Runtime Logs**:
   - Check if the app started successfully
   - Look for database connection errors
   - Check for missing environment variables

### Step 3: Verify Environment Variables

In Railway dashboard, go to **Variables** tab and ensure these are set:

```env
DATABASE_URL=postgresql://user:password@host:port/database
DIRECT_URL=postgresql://user:password@host:port/database
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
ENCRYPTION_KEY=your-32-character-encryption-key
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://bulkdm-saas.netlify.app
```

**Important**: Make sure `FRONTEND_URL` is set to your Netlify URL for CORS!

### Step 4: Check Database Connection

1. In Railway, go to your PostgreSQL service
2. Verify it's running (green status)
3. Check the connection string matches `DATABASE_URL`
4. Test connection if possible

### Step 5: Restart the Service

1. In Railway, go to your backend service
2. Click the **three dots** menu (⋯)
3. Select **Restart**
4. Wait for the service to restart
5. Check logs to verify it started successfully

### Step 6: Verify Service is Running

1. Check the **Metrics** tab for:
   - CPU usage
   - Memory usage
   - Request count

2. Test the endpoint:
   ```bash
   curl https://instagram-dm-saas-production.up.railway.app/api/instagram/cookie/verify \
     -X POST \
     -H "Content-Type: application/json" \
     -d '{"cookies": {}}'
   ```

### Step 7: Common Fixes

#### Fix 1: Database Migrations Not Run
```bash
# In Railway, add a one-off command or use Railway CLI:
railway run npx prisma migrate deploy
```

#### Fix 2: Prisma Client Not Generated
The Dockerfile should handle this, but if it fails:
```bash
railway run npx prisma generate
```

#### Fix 3: Port Configuration
Ensure Railway is using port `3001` or the port Railway assigns:
- Check `PORT` environment variable
- Railway may assign a different port - check `$PORT` in logs

#### Fix 4: CORS Issues
The backend CORS is now configured to allow:
- `https://bulkdm-saas.netlify.app`
- All `*.netlify.app` domains
- Requests with no origin (for proxy requests)

Make sure `FRONTEND_URL` is set correctly.

### Step 8: Redeploy if Needed

If the service won't start:

1. **Trigger a new deployment**:
   - Go to **Settings** → **Source**
   - Click **Redeploy** or push a new commit

2. **Check build configuration**:
   - Root Directory: `backend` (if using monorepo)
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run start:prod`

### Step 9: Check Railway Status

Sometimes Railway itself has issues:
- Check https://status.railway.app
- Check Railway Discord/community for outages

## Verification

After fixing, verify the backend is working:

1. **Check Railway logs** - should see:
   ```
   🚀 Backend running on http://localhost:3001
   [Nest] LOG [NestApplication] Nest application successfully started
   ```

2. **Test the endpoint**:
   ```bash
   curl https://instagram-dm-saas-production.up.railway.app/api/instagram/cookie/verify \
     -X POST \
     -H "Content-Type: application/json" \
     -d '{"cookies": {"sessionid": "test"}}'
   ```

3. **Test via Netlify proxy**:
   ```bash
   curl https://bulkdm-saas.netlify.app/api/proxy/instagram/cookie/verify \
     -X POST \
     -H "Content-Type: application/json" \
     -d '{"cookies": {"sessionid": "test"}}'
   ```

## Prevention

1. **Set up Railway health checks** (if available)
2. **Monitor Railway metrics** regularly
3. **Set up alerts** for deployment failures
4. **Keep environment variables updated**
5. **Test deployments** before marking as production

## Need Help?

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Check deployment logs for specific error messages

