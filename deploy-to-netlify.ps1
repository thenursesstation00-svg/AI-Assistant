# Deploy Frontend to Netlify
param(
    [Parameter(Mandatory=$true)]
    [string]$RailwayUrl,
    [Parameter(Mandatory=$false)]
    [string]$SiteName = "ai-assistant"
)

Write-Host "🌐 Deploying frontend to Netlify..." -ForegroundColor Cyan
Write-Host "Railway URL: $RailwayUrl" -ForegroundColor Yellow
Write-Host "Site Name: $SiteName" -ForegroundColor Yellow

# Check if Netlify CLI is installed
if (!(Get-Command netlify -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Netlify CLI not found. Installing..." -ForegroundColor Red
    npm install -g netlify-cli
}

# Update the API URL
Write-Host "`n🔄 Updating API URL..." -ForegroundColor Cyan
$envFile = "frontend\.env.production"
$content = "VITE_API_URL=$RailwayUrl"
$content | Out-File -FilePath $envFile -Encoding UTF8 -Force
Write-Host "✅ Updated $envFile" -ForegroundColor Green

# Build the frontend
Write-Host "`n🔨 Building frontend..." -ForegroundColor Cyan
Set-Location frontend
npm install
npm run build
Set-Location ..

# Deploy to Netlify
Write-Host "`n🚀 Deploying to Netlify..." -ForegroundColor Cyan
netlify deploy --prod --dir frontend/dist --site $SiteName

Write-Host "`n✅ Frontend deployed to Netlify!" -ForegroundColor Green
Write-Host "💡 Don't forget to update CORS_ORIGIN in Railway dashboard:" -ForegroundColor Yellow
Write-Host "   CORS_ORIGIN=https://your-netlify-site.netlify.app" -ForegroundColor White