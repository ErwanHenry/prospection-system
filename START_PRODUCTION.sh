#!/bin/bash

# 🚀 PROSPECTION SYSTEM - QUICK START SCRIPT

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "   🚀 PROSPECTION SYSTEM - PRODUCTION SERVER"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found!"
    echo "📝 Copy .env.example to .env and configure it first"
    echo ""
    exit 1
fi

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not installed"
    echo "📦 Install from: https://nodejs.org"
    exit 1
fi

echo "✅ Node.js: $(node --version)"
echo ""

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Start the server
echo "🚀 Starting production server..."
echo ""
echo "📍 Dashboard: http://localhost:3000/campaign-dashboard.html"
echo "📊 API Status: http://localhost:3000/api/status"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

node api/production-server.js
