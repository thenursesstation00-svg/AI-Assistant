# AI Assistant Project Cleanup Script
# This script cleans up node_modules, build artifacts, and organizes the project

param(
    [switch]$Force,
    [switch]$DryRun
)

Write-Host "=== AI Assistant Project Cleanup ===" -ForegroundColor Cyan

if (-not $Force -and -not $DryRun) {
    Write-Host "⚠️  This will remove node_modules and build artifacts!" -ForegroundColor Yellow
    Write-Host "Use -DryRun to see what would be removed, or -Force to proceed" -ForegroundColor Yellow
    exit 1
}

# Function to safely remove items
function Remove-SafelyWithLogging {
    param($Path, $Description)
    
    if (Test-Path $Path) {
        if ($DryRun) {
            Write-Host "  [DRY RUN] Would remove: $Description" -ForegroundColor Yellow
        } else {
            Write-Host "  🗑️  Removing: $Description" -ForegroundColor Red
            Remove-Item $Path -Recurse -Force -ErrorAction SilentlyContinue
            if ($LASTEXITCODE -eq 0 -or -not (Test-Path $Path)) {
                Write-Host "    ✅ Removed successfully" -ForegroundColor Green
            } else {
                Write-Host "    ❌ Failed to remove" -ForegroundColor Red
            }
        }
    } else {
        Write-Host "  ℹ️  Not found: $Description" -ForegroundColor Gray
    }
}

# Get file count before cleanup
$filesBefore = (Get-ChildItem -Recurse -File).Count
Write-Host "📊 Files before cleanup: $filesBefore" -ForegroundColor Cyan

Write-Host "`n🧹 Cleaning Dependencies..." -ForegroundColor Yellow

# Remove node_modules directories
$nodeModules = Get-ChildItem -Recurse -Directory -Name "node_modules" -ErrorAction SilentlyContinue
foreach ($nm in $nodeModules) {
    Remove-SafelyWithLogging $nm "node_modules at $nm"
}

Write-Host "`n🏗️  Cleaning Build Artifacts..." -ForegroundColor Yellow

# Build outputs
Remove-SafelyWithLogging "frontend/dist" "Frontend build output"
Remove-SafelyWithLogging "release" "Electron release artifacts"
Remove-SafelyWithLogging "dist_electron" "Electron dist folder"
Remove-SafelyWithLogging "app" "Electron app folder"

# Database files (keep structure, remove data)
Remove-SafelyWithLogging "backend/data/*.db" "Database files"
Remove-SafelyWithLogging "backend/data/*.db-*" "Database auxiliary files"

Write-Host "`n📝 Cleaning Logs and Temp Files..." -ForegroundColor Yellow

# Log files
$logFiles = Get-ChildItem -Recurse -File -Include "*.log", "npm-debug.log*", "yarn-*.log" -ErrorAction SilentlyContinue
foreach ($log in $logFiles) {
    Remove-SafelyWithLogging $log.FullName "Log file: $($log.Name)"
}

# Temporary files
$tempFiles = Get-ChildItem -Recurse -File -Include "*.tmp", "*.temp", ".DS_Store", "Thumbs.db", ".eslintcache" -ErrorAction SilentlyContinue
foreach ($temp in $tempFiles) {
    Remove-SafelyWithLogging $temp.FullName "Temp file: $($temp.Name)"
}

Write-Host "`n🔧 Cleaning Cache Files..." -ForegroundColor Yellow

# Cache directories
Remove-SafelyWithLogging ".cache" "Parcel cache"
Remove-SafelyWithLogging ".parcel-cache" "Parcel cache"
Remove-SafelyWithLogging ".nyc_output" "NYC coverage cache"
Remove-SafelyWithLogging "coverage" "Coverage reports"

Write-Host "`n📄 Updating .gitignore..." -ForegroundColor Yellow

$gitignoreContent = @"
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Build outputs
frontend/dist/
release/
dist_electron/
app/
*.tsbuildinfo

# Logs
*.log
logs/

# Runtime data
*.pid
*.seed
*.pid.lock

# Coverage
coverage/
*.lcov
.nyc_output

# Database files
*.db
*.db-journal
*.db-shm
*.db-wal

# Environment files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Editor directories
.vscode/
.idea/
*.swp
*.swo
*~

# OS files
.DS_Store
Thumbs.db
ehthumbs.db

# Temporary files
*.tmp
*.temp
temp/
tmp/

# Cache
.cache/
.parcel-cache/
.eslintcache
"@

if ($DryRun) {
    Write-Host "  [DRY RUN] Would update .gitignore" -ForegroundColor Yellow
} else {
    $gitignoreContent | Out-File -FilePath ".gitignore" -Encoding UTF8
    Write-Host "  ✅ Updated .gitignore" -ForegroundColor Green
}

# Get file count after cleanup
if (-not $DryRun) {
    Start-Sleep 2  # Wait for file system to update
    $filesAfter = (Get-ChildItem -Recurse -File).Count
    $filesRemoved = $filesBefore - $filesAfter
    
    Write-Host "`n📊 Cleanup Results:" -ForegroundColor Cyan
    Write-Host "  Before: $filesBefore files" -ForegroundColor White
    Write-Host "  After:  $filesAfter files" -ForegroundColor White
    Write-Host "  Removed: $filesRemoved files" -ForegroundColor Green
    
    if ($filesAfter -lt 1000) {
        Write-Host "  ✅ Project size looks healthy!" -ForegroundColor Green
    } elseif ($filesAfter -lt 5000) {
        Write-Host "  ⚠️  Still quite large, but manageable" -ForegroundColor Yellow
    } else {
        Write-Host "  ❌ Project still very large - manual review needed" -ForegroundColor Red
    }
}

Write-Host "`n🔄 Next Steps:" -ForegroundColor Cyan
if (-not $DryRun) {
    Write-Host "1. Run: npm install" -ForegroundColor White
    Write-Host "2. Run: cd backend && npm install && cd .." -ForegroundColor White
    Write-Host "3. Run: cd frontend && npm install && cd .." -ForegroundColor White
    Write-Host "4. Test builds: npm run build:frontend" -ForegroundColor White
    Write-Host "5. Commit changes: git add . && git commit -m 'Clean up project structure'" -ForegroundColor White
    Write-Host "6. Push to GitHub: git push origin HEAD" -ForegroundColor White
} else {
    Write-Host "Run without -DryRun to perform actual cleanup" -ForegroundColor White
}

Write-Host "`n=== Cleanup Complete ===" -ForegroundColor Cyan