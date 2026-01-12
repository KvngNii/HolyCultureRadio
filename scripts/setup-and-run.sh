#!/bin/bash

# Holy Culture Radio - Setup and Run Script
# Usage: ./scripts/setup-and-run.sh

set -e

echo "🙏 Holy Culture Radio - Setup Script"
echo "======================================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
echo ""
echo "📋 Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "   Install with: brew install node"
    exit 1
else
    echo -e "${GREEN}✓ Node.js $(node --version)${NC}"
fi

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
else
    echo -e "${GREEN}✓ npm $(npm --version)${NC}"
fi

# Check Xcode
if ! command -v xcodebuild &> /dev/null; then
    echo -e "${RED}❌ Xcode is not installed${NC}"
    echo "   Install from the App Store"
    exit 1
else
    echo -e "${GREEN}✓ Xcode $(xcodebuild -version | head -1)${NC}"
fi

# Check CocoaPods
if ! command -v pod &> /dev/null; then
    echo -e "${YELLOW}⚠ CocoaPods not found. Installing...${NC}"
    sudo gem install cocoapods
else
    echo -e "${GREEN}✓ CocoaPods $(pod --version)${NC}"
fi

# Install Node dependencies
echo ""
echo "📦 Installing Node dependencies..."
npm install

# Install iOS pods
echo ""
echo "🍎 Installing iOS pods..."
cd ios
pod install --repo-update
cd ..

echo ""
echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "======================================"
echo "To run the app:"
echo ""
echo "  1. Start Metro bundler:"
echo "     npm start"
echo ""
echo "  2. In another terminal, run:"
echo "     npm run ios"
echo ""
echo "  Or open in Xcode:"
echo "     open ios/HolyCultureRadio.xcworkspace"
echo "======================================"
