#!/bin/bash
# Generate JWT_SECRET and ENCRYPTION_KEY

echo "🔐 Generating Security Secrets"
echo "=============================="
echo ""

echo "1️⃣ JWT_SECRET (minimum 32 characters):"
JWT_SECRET=$(openssl rand -base64 32)
echo "JWT_SECRET=$JWT_SECRET"
echo ""

echo "2️⃣ ENCRYPTION_KEY (32 characters):"
ENCRYPTION_KEY=$(openssl rand -base64 32)
echo "ENCRYPTION_KEY=$ENCRYPTION_KEY"
echo ""

echo "✅ Copy these values to your .env file or Vercel environment variables"
echo ""
echo "📝 Add to .env.local:"
echo "JWT_SECRET=$JWT_SECRET"
echo "ENCRYPTION_KEY=$ENCRYPTION_KEY"

