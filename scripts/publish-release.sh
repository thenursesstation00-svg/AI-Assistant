#!/bin/bash
# Build and publish script for AI Assistant releases

set -e

echo "==================================="
echo "AI Assistant - Build & Publish"
echo "==================================="
echo ""

# Check if we're on the main branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "❌ Must be on main branch to publish. Currently on: $CURRENT_BRANCH"
    exit 1
fi

# Check for uncommitted changes
if ! git diff --quiet || ! git diff --cached --quiet; then
    echo "❌ Uncommitted changes detected. Commit or stash changes first."
    exit 1
fi

# Get version from package.json
VERSION=$(node -p "require('./package.json').version")
echo "📦 Current version: $VERSION"

# Ask for confirmation
echo ""
read -p "🤔 Do you want to create release v$VERSION? (y/N): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Release cancelled"
    exit 1
fi

echo ""
echo "🏗️  Building frontend..."
cd frontend
npm ci
npm run build
cd ..

echo ""
echo "⚡ Installing dependencies..."
npm ci

echo ""
echo "🔨 Building Electron app..."
npm run build

echo ""
echo "🏷️  Creating git tag..."
git tag -a "v$VERSION" -m "Release v$VERSION"
git push origin "v$VERSION"

echo ""
echo "🚀 Publishing to GitHub..."
electron-builder --publish always

echo ""
echo "✅ Release v$VERSION published successfully!"
echo "🔗 View at: https://github.com/thenursesstation00-svg/AI-Assistant/releases/tag/v$VERSION"

echo ""
echo "📋 Post-release checklist:"
echo "   - Test auto-update functionality"
echo "   - Update documentation if needed"
echo "   - Announce release to users"