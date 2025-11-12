#!/bin/bash

echo "🚀 NOVA GLITCH ARCADE - RAPID DEPLOYMENT"
echo "========================================="

# Build frontend
echo "📦 Building frontend..."
cd frontend
npm run build

# Check if build succeeded
if [ $? -eq 0 ]; then
    echo "✅ Frontend build successful!"
else
    echo "❌ Frontend build failed!"
    exit 1
fi

# Build backend
echo "📦 Building backend..."
cd ../server
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Backend build successful!"
else
    echo "❌ Backend build failed!"
    exit 1
fi

echo ""
echo "🎉 BUILD COMPLETE!"
echo ""
echo "📋 NEXT STEPS:"
echo "1. Push to GitHub: git push origin main"
echo "2. Deploy frontend to Vercel"
echo "3. Deploy backend to Railway"
echo ""
echo "🔗 Deployment URLs:"
echo "   Vercel: https://vercel.com/new"
echo "   Railway: https://railway.app/new"
echo ""
echo "READY TO LAUNCH! 🚀"
