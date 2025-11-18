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
echo "3. Choose a hosting platform:"
echo ""
echo "   🥇 RENDER (Recommended - 750 free hours/month):"
echo "   • Go to https://render.com"
echo "   • Sign up with GitHub"
echo "   • 'New +' → 'Web Service' → Connect your repo"
echo "   • Build: npm install | Start: npm start"
echo ""
echo "   🥈 VERCEL (Unlimited free hosting):"
echo "   • Go to https://vercel.com" 
echo "   • Sign up with GitHub"
echo "   • 'New Project' → Import your repo"
echo "   • GitHub Actions will handle updates"
echo ""
echo "   🥉 NETLIFY (Free hosting):"
echo "   • Go to https://netlify.com"
echo "   • Sign up with GitHub"
echo "   • 'Add new site' → 'Import from Git'"
echo ""
echo "4. Your app will be live at your chosen platform's URL"
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
