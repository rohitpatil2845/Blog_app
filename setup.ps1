# Quick Setup Script for Enhanced Blog App

Write-Host "🚀 Setting up Enhanced Blog App..." -ForegroundColor Cyan

# Navigate to frontend
Write-Host "`n📦 Installing frontend dependencies..." -ForegroundColor Yellow
cd frontend
npm install lucide-react

Write-Host "`n✅ Dependencies installed!" -ForegroundColor Green

Write-Host "`n📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Update your database schema (see NEW_FEATURES_GUIDE.md)" -ForegroundColor White
Write-Host "2. Update import paths in your code:" -ForegroundColor White
Write-Host "   - Use AppNew instead of App" -ForegroundColor Gray
Write-Host "   - Use PublishNew instead of Publish" -ForegroundColor Gray
Write-Host "   - Use FullBlogNew instead of FullBlog" -ForegroundColor Gray
Write-Host "   - Use AppbarNew instead of Appbar" -ForegroundColor Gray
Write-Host "   - Use hooks from indexNew.ts" -ForegroundColor Gray
Write-Host "3. Start backend: cd backend && npm start" -ForegroundColor White
Write-Host "4. Start frontend: cd frontend && npm run dev" -ForegroundColor White

Write-Host "`n📖 See NEW_FEATURES_GUIDE.md for detailed documentation" -ForegroundColor Cyan
Write-Host "✨ Happy coding!" -ForegroundColor Green
