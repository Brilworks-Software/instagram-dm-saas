# 🚀 Deploy Using Vercel MCP & Git Integration

## Current Status
✅ Branch `vercel-single-project` is pushed to GitHub
✅ Repository: `drdhavaltrivedi/instagram-dm-saas`
✅ Code is ready for deployment

## Method: Enable Git Integration (Auto-Deploy)

Since Vercel MCP works best with git integration, here's how to set it up:

### Step 1: Connect Repository in Vercel

1. Go to: https://vercel.com/dashboard
2. Click **"Add New Project"**
3. Click **"Import Git Repository"**
4. Select: `drdhavaltrivedi/instagram-dm-saas`
5. **Configure**:
   - **Project Name**: `instagram-dm-saas-unified` (or your choice)
   - **Framework**: Next.js (auto-detected)
   - **Root Directory**: `.`
   - **Branch**: Select `vercel-single-project` (important!)
6. Click **"Deploy"**

This will:
- Create a NEW Vercel project
- Enable git integration
- Deploy automatically
- Auto-deploy on future pushes

### Step 2: Set Environment Variables

After first deployment:
1. Go to **Settings** → **Environment Variables**
2. Add all from `VERCEL_ENV_TEMPLATE.txt`
3. Update `NEXT_PUBLIC_BACKEND_URL` with your Vercel URL
4. Vercel will auto-redeploy

### Step 3: Verify Deployment

Check deployment status:
- Go to **Deployments** tab
- See build logs
- Get your live URL

---

## Alternative: Use Vercel CLI via MCP

If you prefer CLI, the MCP tool recommends:
```bash
vercel deploy
```

But this requires the project to be linked first via dashboard.

---

## ✅ Recommended: Git Integration

**Why Git Integration is Best:**
- ✅ Automatic deployments on push
- ✅ Preview deployments for PRs
- ✅ Easy to create new projects
- ✅ Works seamlessly with Vercel MCP
- ✅ No CLI token issues

**Your branch is ready!** Just connect it in Vercel Dashboard.

