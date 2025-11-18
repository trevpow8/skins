#!/bin/bash

# NFL Skins Tracker - Quick Deployment Script

echo "🏈 NFL Skins Tracker - Deployment Setup"
echo "======================================="

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📦 Initializing Git repository..."
    git init
    git add .
    git commit -m "Initial commit: NFL Skins Tracker with automated updates"
    echo "✅ Git repository initialized"
else
    echo "📦 Git repository already exists"
fi

echo ""
echo "🚀 Ready for deployment!"
echo ""
echo "Next steps:"
echo "1. Create a GitHub repository at: https://github.com/new"
echo "2. Push your code:"
echo "   git remote add origin https://github.com/YOUR_USERNAME/nfl-skins-tracker.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "3. Deploy to Railway:"
echo "   • Go to https://railway.app"
echo "   • Sign up with GitHub"
echo "   • Click 'New Project' → 'Deploy from GitHub repo'"
echo "   • Select your nfl-skins-tracker repository"
echo "   • Railway will automatically deploy!"
echo ""
echo "4. Your app will be live at: https://your-app-name.railway.app"
echo ""
echo "🔄 Automatic Updates:"
echo "• Every hour during NFL game times (Sun/Mon/Thu evenings)"
echo "• Daily backup update at 6 AM UTC"
echo "• Manual updates via: POST /api/update"
echo ""
echo "📊 Monitoring:"
echo "• Health check: GET /api/health"
echo "• View logs in Railway dashboard"
echo ""
echo "For detailed instructions, see DEPLOYMENT.md"
