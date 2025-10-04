#!/bin/bash

echo ""
echo "🚀 Starting LinkedIn to CRM System..."
echo "===================================="
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Check for credentials.json
if [ ! -f "credentials.json" ]; then
    echo "⚠️  Warning: credentials.json not found!"
    echo "Please add your Google OAuth credentials."
    echo ""
fi

# Check for .env
if [ ! -f ".env" ]; then
    echo "❌ Error: .env file not found!"
    exit 1
fi

# Start the server
echo "🎆 Starting server..."
echo ""
echo "🌐 Web interface will be available at:"
echo "   http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop"
echo ""

node backend/server.js
EOF && chmod +x start.sh
