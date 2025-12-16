#!/bin/bash
# Create New Vercel Project and Deploy

echo "🚀 Creating New Vercel Project"
echo "==============================="
echo ""

# Check if logged in
if ! npx vercel whoami &> /dev/null; then
    echo "🔐 Please login to Vercel first..."
    npx vercel login
    echo ""
fi

echo "📋 Project Info:"
echo "  Repository: drdhavaltrivedi/instagram-dm-saas"
echo "  Branch: $(git branch --show-current)"
echo ""

echo "🚀 Deploying to create NEW project..."
echo ""
echo "When prompted:"
echo "  - Set up and deploy? → Yes"
echo "  - Which scope? → Your team"
echo "  - Link to existing project? → NO (to create new)"
echo "  - Project name? → instagram-dm-saas-unified (or your choice)"
echo "  - Directory? → ./"
echo ""
read -p "Press Enter to continue..."

# Deploy (this will create a new project if not linked)
npx vercel --yes

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📝 Next steps:"
echo "  1. Copy your Vercel URL from above"
echo "  2. Set environment variables in Vercel Dashboard"
echo "  3. See VERCEL_ENV_TEMPLATE.txt for required variables"
echo "  4. Update NEXT_PUBLIC_BACKEND_URL with your new Vercel URL"
echo ""

