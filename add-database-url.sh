#!/bin/bash

# Script to add DATABASE_URL and DIRECT_URL to .env.local
# This fixes the Prisma "Environment variable not found: DATABASE_URL" error

echo "=========================================="
echo "Adding DATABASE_URL to .env.local"
echo "=========================================="
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ .env.local file not found. Creating it..."
    touch .env.local
fi

# Check if DATABASE_URL already exists
if grep -q "^DATABASE_URL=" .env.local; then
    echo "⚠️  DATABASE_URL already exists in .env.local"
    echo "   Current value:"
    grep "^DATABASE_URL=" .env.local
    echo ""
    read -p "Do you want to update it? (y/n): " update
    if [ "$update" != "y" ]; then
        echo "Skipping DATABASE_URL..."
    else
        # Remove old DATABASE_URL
        sed -i '/^DATABASE_URL=/d' .env.local
    fi
fi

# Check if DIRECT_URL already exists
if grep -q "^DIRECT_URL=" .env.local; then
    echo "⚠️  DIRECT_URL already exists in .env.local"
    echo "   Current value:"
    grep "^DIRECT_URL=" .env.local
    echo ""
    read -p "Do you want to update it? (y/n): " update
    if [ "$update" != "y" ]; then
        echo "Skipping DIRECT_URL..."
    else
        # Remove old DIRECT_URL
        sed -i '/^DIRECT_URL=/d' .env.local
    fi
fi

echo ""
echo "=========================================="
echo "Get your Supabase Database Connection String"
echo "=========================================="
echo ""
echo "1. Go to: https://supabase.com/dashboard/project/gielnjqmgxlxihqmjjre/settings/database"
echo "2. Scroll to 'Connection string' section"
echo "3. Copy the connection strings:"
echo ""
echo "   For DATABASE_URL (Connection Pooling - port 6543):"
echo "   postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres"
echo ""
echo "   For DIRECT_URL (Direct Connection - port 5432):"
echo "   postgresql://postgres:[PASSWORD]@db.gielnjqmgxlxihqmjjre.supabase.co:5432/postgres"
echo ""
echo "=========================================="
echo ""

# Prompt for DATABASE_URL
if ! grep -q "^DATABASE_URL=" .env.local; then
    echo "Enter DATABASE_URL (Connection Pooling - port 6543):"
    read -p "DATABASE_URL: " db_url
    if [ ! -z "$db_url" ]; then
        echo "DATABASE_URL=$db_url" >> .env.local
        echo "✅ Added DATABASE_URL"
    fi
fi

# Prompt for DIRECT_URL
if ! grep -q "^DIRECT_URL=" .env.local; then
    echo ""
    echo "Enter DIRECT_URL (Direct Connection - port 5432):"
    read -p "DIRECT_URL: " direct_url
    if [ ! -z "$direct_url" ]; then
        echo "DIRECT_URL=$direct_url" >> .env.local
        echo "✅ Added DIRECT_URL"
    fi
fi

echo ""
echo "=========================================="
echo "✅ Done! Restart your dev server:"
echo "   npm run dev"
echo "=========================================="

