# Deploy Frontend to Vercel
param(
    [Parameter(Mandatory=$true)]
    [string]$RailwayUrl,
    [Parameter(Mandatory=$false)]
    [string]$ProjectName = "ai-assistant-frontend"
)

Write-Host "🚀 Deploying frontend to Vercel..." -ForegroundColor Cyan
Write-Host "Railway URL: $RailwayUrl" -ForegroundColor Yellow
Write-Host "Project Name: $ProjectName" -ForegroundColor Yellow

# Check if Vercel CLI is installed
if (!(Get-Command vercel -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Vercel CLI not found. Installing..." -ForegroundColor Red
    npm install -g vercel
}

# Update the API URL
Write-Host "`n🔄 Updating API URL..." -ForegroundColor Cyan
$envFile = "frontend\.env.production"
$content = "VITE_API_URL=$RailwayUrl"
$content | Out-File -FilePath $envFile -Encoding UTF8 -Force
Write-Host "✅ Updated $envFile" -ForegroundColor Green

# Navigate to frontend directory
Set-Location frontend

# Login to Vercel (if not already logged in)
Write-Host "`n🔐 Checking Vercel login..." -ForegroundColor Cyan
vercel login

# Deploy to Vercel
Write-Host "`n🚀 Deploying to Vercel..." -ForegroundColor Cyan
vercel --prod --yes

Write-Host "`n✅ Frontend deployed to Vercel!" -ForegroundColor Green
Write-Host "💡 Don't forget to update CORS_ORIGIN in Railway dashboard:" -ForegroundColor Yellow
Write-Host "   CORS_ORIGIN=https://your-vercel-app.vercel.app" -ForegroundColor White

# Return to root directory
Set-Location ..