# Project Cleanup and Sync Strategy

## CRITICAL FINDINGS
Your project currently has **30,889 files** including many that shouldn't be in version control:
- 13,772 .js files (likely includes node_modules)
- 5,579 .ts files (TypeScript definitions from dependencies)
- 4,511 .map files (source maps from node_modules)

## IMMEDIATE ACTIONS NEEDED

### 1. Clean Node Modules and Build Artifacts
```powershell
# Remove all node_modules directories
Get-ChildItem -Recurse -Directory -Name "node_modules" | Remove-Item -Recurse -Force

# Remove build artifacts
Remove-Item -Recurse -Force -ErrorAction SilentlyContinue @(
    "frontend/dist",
    "release",
    "backend/data/*.db*",
    "*.log",
    ".eslintcache"
)

# Clean up any cached files
npm cache clean --force
```

### 2. Update .gitignore
```gitignore
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Build outputs
frontend/dist/
release/
*.tsbuildinfo

# Logs
*.log
logs/

# Runtime data
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/
*.lcov

# nyc test coverage
.nyc_output

# Electron build artifacts
app/
release/
dist_electron/

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

# Editor directories and files
.vscode/
.idea/
*.swp
*.swo
*~

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Temporary files
*.tmp
*.temp
temp/
tmp/

# Cache
.cache/
.parcel-cache/
.eslintcache
```

### 3. Reinstall Dependencies Cleanly
```powershell
# Root dependencies
npm install

# Backend dependencies
cd backend
npm install
cd ..

# Frontend dependencies  
cd frontend
npm install
cd ..
```

## SYNC WORKFLOW

### Phase 1: Local Cleanup (Current VS Code)
1. **Clean project** (run commands above)
2. **Verify .gitignore** is comprehensive
3. **Test builds** to ensure everything works
4. **Commit clean state**

### Phase 2: Repository Sync
1. **Push cleaned project** to GitHub
2. **Update main branch** with clean version
3. **Delete old branches** that are no longer needed

### Phase 3: Fresh Start Strategy
For your other locations:

#### Local Machine
```powershell
# Backup old project
Move-Item "AI-Assistant" "AI-Assistant-OLD-$(Get-Date -Format 'MM-dd')"

# Fresh clone
git clone https://github.com/thenursesstation00-svg/AI-Assistant.git
cd AI-Assistant
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

#### GitHub Codespace
1. **Delete current Codespace** (reimagined-space-trout)
2. **Create new Codespace** from updated repository
3. Dependencies will install automatically

## FILE COUNT TARGETS
After cleanup, you should have approximately:
- **~200-500 files** total (excluding node_modules)
- **~50-100 .js/.ts files** (your actual source code)
- **~20-30 .json files** (package.json, configs, etc.)
- **~10-20 .md files** (documentation)

## AUTOMATED CLEANUP SCRIPT
Would you like me to create a script that automates the cleanup process?