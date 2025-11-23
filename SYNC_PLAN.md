# Project Synchronization Plan

## Current State Analysis
- **VS Code Workspace**: Up-to-date files (current working location)
- **GitHub Repository**: May have outdated or conflicting files
- **Local Machine**: Disorganized and not up-to-date
- **GitHub Codespace**: Unknown state

## Step-by-Step Synchronization Process

### Phase 1: Establish Source of Truth (Current VS Code)
1. **Create comprehensive backup**
   ```powershell
   # Create backup of current state
   git add -A
   git commit -m "Backup: Current VS Code state before sync"
   git push origin fix/workflow-use-gh-token
   ```

2. **Document current file structure**
   ```powershell
   # Generate complete file listing
   Get-ChildItem -Recurse -File | Select-Object FullName, Length, LastWriteTime | Export-Csv "file-inventory-$(Get-Date -Format 'yyyy-MM-dd-HHmm').csv"
   ```

### Phase 2: GitHub Repository Cleanup
1. **Review all branches on GitHub**
   - Check main branch status
   - Identify outdated branches
   - Review open PRs

2. **Merge current changes**
   ```powershell
   # Switch to main and merge current fixes
   git checkout main
   git merge fix/workflow-use-gh-token
   git push origin main
   ```

### Phase 3: Local Machine Sync
1. **Fresh clone approach (Recommended)**
   ```powershell
   # On local machine, backup old folder
   Rename-Item "AI-Assistant" "AI-Assistant-OLD-$(Get-Date -Format 'yyyy-MM-dd')"
   
   # Fresh clone from GitHub
   git clone https://github.com/thenursesstation00-svg/AI-Assistant.git
   cd AI-Assistant
   ```

2. **Selective file recovery**
   - Compare old folder with fresh clone
   - Copy any unique local files to appropriate locations
   - Commit and push updates

### Phase 4: Codespace Alignment
1. **Delete current Codespace**
   - Go to GitHub Codespaces dashboard
   - Delete the reimagined-space-trout Codespace

2. **Create fresh Codespace**
   - Create new Codespace from updated main branch
   - Will automatically have latest synchronized files

## File Organization Standards

### Directory Structure
```
AI-Assistant/
├── .github/                 # GitHub workflows, templates, configs
│   ├── workflows/          # Actions workflows
│   └── copilot-instructions.md
├── backend/                # Express.js backend
│   ├── src/               # Source code
│   ├── tests/             # Jest tests
│   ├── data/              # Runtime data
│   └── package.json
├── frontend/              # React frontend
│   ├── src/              # Source code
│   ├── dist/             # Build output (gitignored)
│   └── package.json
├── src/                   # Electron main process
│   ├── main.js
│   └── preload.js
├── docs/                  # Documentation
├── scripts/               # Utility scripts
├── config/                # Configuration files
├── .mcp/                  # MCP server configs
└── package.json          # Root package.json
```

### File Naming Conventions
- Use kebab-case for directories: `multi-provider-guide`
- Use camelCase for JS files: `providerRegistry.js`
- Use UPPERCASE for constants: `README.md`, `LICENSE`
- Use descriptive names: `chat.test.js` not `test1.js`

## Automated Sync Script