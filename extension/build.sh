#!/bin/bash

# Build script for Socialora Chrome Extension
# Creates a unified ZIP file that works for both LOCAL and PRODUCTION

echo "🚀 Building Socialora Chrome Extension..."

# Get version from manifest.json
VERSION=$(grep -o '"version": "[^"]*"' manifest.json | cut -d'"' -f4)

# Clean previous builds
rm -rf build
rm -f socialora-extension-v*.zip

echo ""
echo "📦 Building unified extension..."
echo "================================"

# Create build directory
mkdir -p build

# Copy all necessary files
cp manifest.json build/
cp popup.html build/
cp popup.js build/
cp background.js build/
cp config.js build/
cp content-script.js build/
cp inject-cookies.js build/ 2>/dev/null || true  # Optional file
cp -r icons build/

# Create unified ZIP
cd build
ZIP_NAME="socialora-extension-v${VERSION}.zip"
zip -r "../$ZIP_NAME" . -x "*.DS_Store" "*.git*"
cd ..

# Clean up build directory
rm -rf build

echo "✅ Build complete: $ZIP_NAME"
echo ""
echo "🎉 Build Summary:"
echo "================================"
echo "📦 Extension: $ZIP_NAME"
echo ""
echo "📝 Next steps:"
echo "  1. Extract $ZIP_NAME"
echo "  2. Load unpacked extension in Chrome (chrome://extensions)"
echo "  3. Extension works for both local and production:"
echo "     - Defaults to production (Vercel)"
echo "     - Can be configured via chrome.storage API"
echo ""
echo "  For Chrome Web Store:"
echo "  1. Review $ZIP_NAME"
echo "  2. Go to https://chrome.google.com/webstore/devconsole"
echo "  3. Upload $ZIP_NAME"
echo "  4. Fill in store listing details"
echo "  5. Submit for review"
echo ""
