#!/bin/bash
set -e

echo "🚀 Setting up AI Assistant development environment..."

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Create backend .env from example if it doesn't exist
if [ ! -f backend/.env ]; then
    echo "📝 Creating backend/.env from example..."
    cp backend/.env.example backend/.env
    echo ""
    echo "⚠️  IMPORTANT: Please update backend/.env with your API keys:"
    echo "   - ANTHROPIC_API_KEY: Get from https://console.anthropic.com/"
    echo "   - BACKEND_API_KEY: Generate a random string for API authentication"
    echo ""
fi

echo ""
echo "✅ Development environment setup complete!"
echo ""
echo "🎯 Quick Start:"
echo "   Terminal 1: cd backend && npm run dev    # Starts backend on port 3001"
echo "   Terminal 2: cd frontend && npm run dev   # Starts frontend on port 5173"
echo ""
echo "📖 Documentation: See README.md and docs/ folder for more information"
echo ""
