#!/bin/bash
# Vercel Deployment Script

echo "🚀 Vercel Deployment Script"
echo "=========================="
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Check if logged in
if ! vercel whoami &> /dev/null; then
    echo "🔐 Please login to Vercel..."
    vercel login
fi

echo ""
echo "📦 Current project status:"
vercel ls 2>/dev/null || echo "No projects found"

echo ""
echo "🚀 Starting deployment..."
echo ""
echo "This will:"
echo "1. Create a new Vercel project (or link to existing)"
echo "2. Deploy to Vercel"
echo ""
echo "Press Enter to continue or Ctrl+C to cancel..."
read

# Deploy
vercel --yes

echo ""
echo "✅ Deployment initiated!"
echo ""
echo "Next steps:"
echo "1. Set environment variables in Vercel Dashboard"
echo "2. Run: vercel env pull .env.local (to get env vars locally)"
echo "3. Run database migrations if needed"
echo ""

