# Project Synchronization and Organization Script
# Run this script to sync and organize your AI Assistant project

param(
    [switch]$CreateBackup,
    [switch]$GenerateInventory,
    [switch]$CleanupBranches,
    [switch]$OrganizeFiles,
    [switch]$ValidateStructure
)

Write-Host "=== AI Assistant Project Sync Tool ===" -ForegroundColor Cyan

# Function to create backup
function New-ProjectBackup {
    Write-Host "Creating project backup..." -ForegroundColor Yellow
    
    $backupName = "backup-$(Get-Date -Format 'yyyy-MM-dd-HHmmss')"
    git add -A
    git commit -m "Backup: Project state before sync - $backupName"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Backup committed locally" -ForegroundColor Green
        
        # Try to push backup
        git push origin HEAD
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Backup pushed to remote" -ForegroundColor Green
        } else {
            Write-Host "⚠️ Could not push backup to remote" -ForegroundColor Yellow
        }
    }
}

# Function to generate file inventory
function New-FileInventory {
    Write-Host "Generating file inventory..." -ForegroundColor Yellow
    
    $inventoryFile = "file-inventory-$(Get-Date -Format 'yyyy-MM-dd-HHmm').csv"
    
    Get-ChildItem -Recurse -File -Exclude "*.git*", "node_modules", "dist", "release" | 
        Select-Object @{Name='Path';Expression={$_.FullName.Replace($PWD, '.')}}, 
                     Length, 
                     LastWriteTime,
                     @{Name='Extension';Expression={$_.Extension}},
                     @{Name='Directory';Expression={$_.Directory.Name}} |
        Export-Csv $inventoryFile -NoTypeInformation
    
    Write-Host "✅ File inventory created: $inventoryFile" -ForegroundColor Green
    
    # Generate summary
    $files = Import-Csv $inventoryFile
    $summary = $files | Group-Object Extension | Sort-Object Count -Descending
    
    Write-Host "`n📊 File Summary:" -ForegroundColor Cyan
    $summary | ForEach-Object { 
        Write-Host "  $($_.Name): $($_.Count) files" -ForegroundColor White
    }
}

# Function to validate project structure
function Test-ProjectStructure {
    Write-Host "Validating project structure..." -ForegroundColor Yellow
    
    $requiredDirs = @(
        'backend',
        'backend/src',
        'backend/tests',
        'frontend',
        'frontend/src',
        'src',
        '.github',
        '.github/workflows',
        'docs',
        'scripts'
    )
    
    $requiredFiles = @(
        'package.json',
        'backend/package.json',
        'frontend/package.json',
        'src/main.js',
        'src/preload.js',
        'README.md',
        '.github/copilot-instructions.md'
    )
    
    Write-Host "`n📁 Directory Structure:" -ForegroundColor Cyan
    foreach ($dir in $requiredDirs) {
        if (Test-Path $dir) {
            Write-Host "  ✅ $dir" -ForegroundColor Green
        } else {
            Write-Host "  ❌ $dir (missing)" -ForegroundColor Red
        }
    }
    
    Write-Host "`n📄 Required Files:" -ForegroundColor Cyan
    foreach ($file in $requiredFiles) {
        if (Test-Path $file) {
            Write-Host "  ✅ $file" -ForegroundColor Green
        } else {
            Write-Host "  ❌ $file (missing)" -ForegroundColor Red
        }
    }
}

# Function to organize files
function Invoke-FileOrganization {
    Write-Host "Organizing project files..." -ForegroundColor Yellow
    
    # Create missing directories
    $dirs = @(
        'docs/archive',
        'backend/data/backups',
        'scripts/utils',
        'config/environments'
    )
    
    foreach ($dir in $dirs) {
        if (-not (Test-Path $dir)) {
            New-Item -ItemType Directory -Path $dir -Force | Out-Null
            Write-Host "  📁 Created: $dir" -ForegroundColor Green
        }
    }
    
    # Move misplaced files (examples)
    $moves = @(
        @{ From = "*.md"; To = "docs/"; Exclude = @("README.md", "CHANGELOG.md", "LICENSE.md") },
        @{ From = "backend/*.json"; To = "backend/data/"; Exclude = @("package.json", "jest.config.js") }
    )
    
    # Clean up common issues
    Write-Host "  🧹 Cleaning temporary files..." -ForegroundColor Yellow
    Get-ChildItem -Recurse -Name "*.tmp", "*.log", ".DS_Store", "Thumbs.db" | Remove-Item -Force -ErrorAction SilentlyContinue
    
    Write-Host "✅ File organization complete" -ForegroundColor Green
}

# Function to cleanup branches
function Invoke-BranchCleanup {
    Write-Host "Analyzing git branches..." -ForegroundColor Yellow
    
    # Show current branch status
    Write-Host "`n🌿 Current Branch Status:" -ForegroundColor Cyan
    git status --porcelain
    git branch -vv
    
    # Show remote branches
    Write-Host "`n🌐 Remote Branches:" -ForegroundColor Cyan
    git branch -r
    
    # Suggest cleanup actions
    Write-Host "`n💡 Suggested Actions:" -ForegroundColor Yellow
    Write-Host "  1. Merge current branch to main if ready" -ForegroundColor White
    Write-Host "  2. Delete merged feature branches" -ForegroundColor White
    Write-Host "  3. Push latest changes to remote" -ForegroundColor White
}

# Main execution
if ($CreateBackup -or $args.Count -eq 0) {
    New-ProjectBackup
}

if ($GenerateInventory -or $args.Count -eq 0) {
    New-FileInventory
}

if ($ValidateStructure -or $args.Count -eq 0) {
    Test-ProjectStructure
}

if ($OrganizeFiles) {
    Invoke-FileOrganization
}

if ($CleanupBranches) {
    Invoke-BranchCleanup
}

Write-Host "`n=== Sync Tool Complete ===" -ForegroundColor Cyan
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Review the generated inventory file" -ForegroundColor White
Write-Host "2. Commit any changes: git add . && git commit -m 'Sync and organize project'" -ForegroundColor White
Write-Host "3. Push to GitHub: git push origin HEAD" -ForegroundColor White
Write-Host "4. Create fresh Codespace from updated repository" -ForegroundColor White