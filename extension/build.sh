#!/bin/bash

# Build script for DMflow Chrome Extension
# Creates a production-ready ZIP file

echo "🚀 Building DMflow Chrome Extension..."

# Get version from manifest.json
VERSION=$(grep -o '"version": "[^"]*"' manifest.json | cut -d'"' -f4)

# Create build directory
BUILD_DIR="build"
ZIP_NAME="dmflow-extension-v${VERSION}.zip"

# Clean previous build
rm -rf "$BUILD_DIR"
rm -f "$ZIP_NAME"

# Create build directory
mkdir -p "$BUILD_DIR"

# Copy required files
echo "📦 Copying files..."
cp manifest.json "$BUILD_DIR/"
cp background.js "$BUILD_DIR/"
cp popup.html "$BUILD_DIR/"
cp popup.js "$BUILD_DIR/"
cp -r icons "$BUILD_DIR/"

# Copy config.js if it exists
[ -f config.js ] && cp config.js "$BUILD_DIR/"

# Create ZIP
echo "📦 Creating ZIP package..."
cd "$BUILD_DIR"
zip -r "../$ZIP_NAME" . -x "*.DS_Store" "*.git*"
cd ..

# Clean up
rm -rf "$BUILD_DIR"

echo "✅ Build complete: $ZIP_NAME"
echo "📝 Ready to upload to Chrome Web Store!"
echo ""
echo "Next steps:"
echo "1. Review $ZIP_NAME"
echo "2. Go to https://chrome.google.com/webstore/devconsole"
echo "3. Upload $ZIP_NAME"
echo "4. Fill in store listing details"
echo "5. Submit for review"

