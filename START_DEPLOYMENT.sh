#!/bin/bash
# Quick Vercel Deployment Script

echo "🚀 Starting Vercel Deployment"
echo "=============================="
echo ""

# Check if logged in
if ! npx vercel whoami &> /dev/null; then
    echo "🔐 Please login to Vercel first..."
    echo "Running: npx vercel login"
    npx vercel login
    echo ""
fi

echo "📋 Current status:"
echo "  - Branch: $(git branch --show-current)"
echo "  - Remote: $(git remote get-url origin 2>/dev/null || echo 'Not set')"
echo ""

echo "🚀 Deploying to Vercel..."
echo ""
echo "This will:"
echo "  1. Create a new Vercel project (or link existing)"
echo "  2. Deploy your application"
echo "  3. Give you a deployment URL"
echo ""
echo "Press Enter to continue or Ctrl+C to cancel..."
read

# Deploy
npx vercel --yes

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📝 Next steps:"
echo "  1. Set environment variables in Vercel Dashboard"
echo "  2. See VERCEL_ENV_TEMPLATE.txt for required variables"
echo "  3. Update NEXT_PUBLIC_BACKEND_URL with your Vercel URL"
echo "  4. Redeploy or wait for auto-redeploy"
echo ""
echo "🌐 Your project will be available at: https://your-project.vercel.app"
echo ""

