#!/bin/bash

# Autonomous Blog Writer - Setup Script
# One-command setup for new installations

set -e  # Exit on error

echo "🤖 Autonomous Blog Writer - Setup"
echo "=================================="
echo ""

# Check Node.js version
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+ first."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version must be 18 or higher (current: $NODE_VERSION)"
    exit 1
fi

echo "✓ Node.js $(node -v) detected"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env from template..."
    cp .env.example .env
    echo ""
    echo "⚠️  IMPORTANT: Edit .env and add your OpenAI API key!"
    echo ""
    echo "   nano .env"
    echo ""
    echo "   Replace: OPENAI_API_KEY=sk-proj-YOUR-KEY-HERE"
    echo "   With:    OPENAI_API_KEY=sk-proj-YOUR-ACTUAL-KEY"
    echo ""
    exit 0
else
    echo "✓ .env file exists"
fi

# Validate configuration
echo "🔍 Validating configuration..."
npm run validate

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Setup complete!"
    echo ""
    echo "📚 Next steps:"
    echo "   1. View configuration:  npm run config"
    echo "   2. Test with 1 blog:    npm run test"
    echo "   3. Read the README:     cat README.md"
    echo ""
else
    echo ""
    echo "❌ Configuration validation failed"
    echo "   Check your .env file and API key"
    exit 1
fi
