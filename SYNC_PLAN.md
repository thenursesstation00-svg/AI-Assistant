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

Run `scripts/sync-project.ps1` from the repository root whenever you want an automated pass through the backup, inventory, and validation steps:

```powershell
cd AI-Assistant
pwsh ./scripts/sync-project.ps1 -CreateBackup -GenerateInventory -ValidateStructure
```

The script avoids destructive git operations so you can inspect the generated CSV inventory and structural report before force-syncing anything.

## Platform Sync Checklist (December 2025)

Follow this loop whenever you need every surface (VS Code, GitHub, additional local machines, and Codespaces) back in alignment:

### 1. VS Code / Current Workspace
- `git status -sb` to confirm only intentional edits remain.
- `npm install`, `cd backend && npm ci`, `cd ../frontend && npm ci` to keep lockfiles deterministic.
- Run targeted Jest suites (`npm test -- neuralNetwork.test.js -i --runInBand`, `npm test -- tools.test.js`) before pushing.

### 2. GitHub Repository
- `git fetch origin` then `git status -sb --ahead-behind` to inspect divergence.
- `git push origin <branch>` once tests pass; if history was rewritten, follow with `git push --force-with-lease`.
- Monitor GitHub Actions after each push and rerun failing jobs via the Actions UI or `gh workflow run`.

### 3. Additional Local Machines
- Backup stale folders (`Rename-Item AI-Assistant AI-Assistant-OLD-$(Get-Date -Format 'yyyy-MM-dd')`).
- Fresh clone (`git clone https://github.com/thenursesstation00-svg/AI-Assistant.git`) and repeat dependency install/test cycle.

### 4. GitHub Codespaces
- Delete outdated codespaces tied to older commits.
- Create a new codespace from `main`, run installs/tests, and store secrets via the Codespaces secrets UI.

Document completion of each surface in `SYNC_COMPLETE_YYYY-MM-DD.md` so audits know which environment is authoritative.

## GitHub Issue Remediation Playbook

1. **Triage** – Label open issues/PRs (`sync`, `bug`, `docs`) and capture reproduction notes.
2. **Reproduce Locally** – Follow the checklist above to replicate the problem in VS Code.
3. **Fix + Reference** – Patch code/tests and commit with the issue number (e.g., `fix: resolve sync regression (#123)`).
4. **Verify CI** – Push, watch GitHub Actions, and rerun failed workflows if necessary.
5. **Close Out** – Merge, close the issue, and summarize the fix with links to the resolving PR/commit.

Running this loop every time you push keeps GitHub the canonical record of project health.
