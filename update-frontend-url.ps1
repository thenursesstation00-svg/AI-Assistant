# Update Frontend API URL for Railway Deployment
param(
    [Parameter(Mandatory=$true)]
    [string]$RailwayUrl
)

Write-Host "🔄 Updating frontend API URL to: $RailwayUrl" -ForegroundColor Cyan

# Update .env.production file
$envFile = "frontend\.env.production"
$content = "VITE_API_URL=$RailwayUrl"
$content | Out-File -FilePath $envFile -Encoding UTF8 -Force

Write-Host "✅ Updated $envFile" -ForegroundColor Green

# Show the updated content
Write-Host "`n📄 Updated file content:" -ForegroundColor Yellow
Get-Content $envFile

Write-Host "`n💡 Next steps:" -ForegroundColor Cyan
Write-Host "1. Commit and push these changes: git add . && git commit -m 'Update frontend API URL for Railway'" -ForegroundColor White
Write-Host "2. Rebuild frontend: cd frontend && npm run build" -ForegroundColor White
Write-Host "3. Deploy frontend to your hosting service" -ForegroundColor White

Write-Host "`n🎉 Frontend configured for Railway deployment!" -ForegroundColor Green