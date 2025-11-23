# Quick Start Guide

## What You Have Now

✅ **Fully functional SQLite database** with 6 providers pre-configured  
✅ **Zero security vulnerabilities** (all patched)  
✅ **Provider configuration system** ready for API keys  
✅ **Encrypted API key storage** (AES-256-CBC)  

---

## Immediate Actions

### 1. Activate Anthropic Provider (If You Have API Key)

```powershell
# PowerShell - Set your Anthropic API key
$env:ANTHROPIC_API_KEY = "sk-ant-api03-YOUR_KEY_HERE"

# Re-seed providers to activate
cd backend
node scripts/seedProviders.js
```

### 2. Start Backend Server

```powershell
cd backend
npm run dev
```

The backend will start on `http://localhost:3001`

### 3. Test Health Endpoint

```powershell
# PowerShell
Invoke-RestMethod -Uri http://localhost:3001/health

# Or use curl
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "ok",
  "uptime": 2.345
}
```

---

## Provider Configuration

### View Current Providers

```powershell
cd backend
node -e "const repo = require('./src/db/repositories/providerConfigRepo'); const r = new repo(); console.log(r.getAllProviders());"
```

### Add API Key Manually (PowerShell)

```powershell
# Add Anthropic key
node -e "const repo = require('./src/db/repositories/providerConfigRepo'); const r = new repo(); r.updateApiKey('anthropic', 'sk-ant-YOUR_KEY'); r.toggleProviderActive('anthropic', true); console.log('Anthropic activated!');"

# Add OpenAI key
node -e "const repo = require('./src/db/repositories/providerConfigRepo'); const r = new repo(); r.updateApiKey('openai', 'sk-YOUR_KEY'); r.toggleProviderActive('openai', true); console.log('OpenAI activated!');"
```

---

## Database Inspection

### View Database Tables

```powershell
# Install sqlite3 CLI if needed
# winget install SQLite.SQLite

# Open database
sqlite3 "backend\data\assistant.db"
```

SQLite commands:
```sql
-- List all tables
.tables

-- View provider configs
SELECT provider_name, display_name, is_active FROM provider_configs;

-- View conversations
SELECT * FROM conversations;

-- View messages
SELECT role, content FROM messages ORDER BY created_at;

-- Exit
.quit
```

---

## Test Chat Flow (Once Provider Active)

### Test with Current Chat Route

```powershell
# Make sure backend is running (npm run dev)

# Test chat (replace YOUR_BACKEND_API_KEY)
$headers = @{
  "x-api-key" = "YOUR_BACKEND_API_KEY"
  "Content-Type" = "application/json"
}

$body = @{
  messages = @(
    @{
      role = "user"
      content = "Hello! What's 2+2?"
    }
  )
} | ConvertTo-Json

Invoke-RestMethod -Uri http://localhost:3001/api/chat -Method POST -Headers $headers -Body $body
```

---

## Troubleshooting

### Database Issues

**Error: Cannot find module 'better-sqlite3'**
```powershell
cd backend
npm install better-sqlite3 --save
```

**Database locked**
```powershell
# Close any running processes
# Delete WAL files
Remove-Item backend\data\assistant.db-wal -ErrorAction SilentlyContinue
Remove-Item backend\data\assistant.db-shm -ErrorAction SilentlyContinue
```

**Reset database**
```powershell
# Backup first
Copy-Item backend\data\assistant.db backend\data\assistant.db.backup

# Delete and recreate
Remove-Item backend\data\assistant.db
node backend\scripts\initDatabase.js
node backend\scripts\seedProviders.js
```

### Security Vulnerabilities

**Check for vulnerabilities**
```powershell
cd backend
npm audit
```

**Fix vulnerabilities automatically**
```powershell
npm audit fix

# For breaking changes
npm audit fix --force
```

---

## File Locations

| File | Location | Purpose |
|------|----------|---------|
| Database | `backend/data/assistant.db` | SQLite database file |
| Schema | `backend/src/db/schema.sql` | Database structure |
| Connection | `backend/src/db/connection.js` | DB connection manager |
| Repositories | `backend/src/db/repositories/` | Data access layer |
| Scripts | `backend/scripts/` | Database utilities |
| Roadmap | `ROADMAP.md` | 12-week evolution plan |
| Implementation Guide | `docs/IMPLEMENTATION_GUIDE.md` | Step-by-step instructions |

---

## Next Development Steps

### Phase 2 Preview (Week 2)

1. **Create Provider Abstraction** (2-3 days)
   ```powershell
   # Create provider files
   New-Item backend\src\services\providers\base.provider.js
   New-Item backend\src\services\providers\anthropic.provider.js
   New-Item backend\src\services\providers\registry.js
   ```

2. **Add OpenAI Provider** (1-2 days)
   ```powershell
   npm install openai
   New-Item backend\src\services\providers\openai.provider.js
   ```

3. **Build Provider API** (2 days)
   ```powershell
   New-Item backend\src\routes\providers.js
   # Update backend\src\server.js to include provider routes
   ```

4. **Update Chat Route** (1 day)
   ```powershell
   # Modify backend\src\routes\chat.js
   # Add provider/model selection
   # Integrate with provider registry
   ```

---

## Useful Commands

### Development
```powershell
# Start backend dev server
cd backend
npm run dev

# Run tests
npm test

# Check code style
npm run lint  # (if configured)
```

### Database
```powershell
# Initialize
node scripts/initDatabase.js

# Seed
node scripts/seedProviders.js

# Test
node scripts/testDatabase.js
```

### Git
```powershell
# Check status
git status

# Commit changes
git add .
git commit -m "Phase 1 complete: Database infrastructure"

# Create tag for v1.1.0
git tag -a v1.1.0 -m "Phase 1: Database & Security Fixes"
git push origin v1.1.0
```

---

## Environment Variables

Create `.env` file in `backend/` directory:

```env
# Port
PORT=3001

# API Keys (add yours here)
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
GOOGLE_AI_API_KEY=...

# Search Providers
SERPAPI_KEY=...
GOOGLE_CSE_KEY=...
GOOGLE_CSE_CX=...
BRAVE_API_KEY=...

# Security
ENCRYPTION_KEY=your-random-32-byte-hex-key
BACKEND_API_KEY=your-backend-api-key

# CORS
CORS_ORIGIN=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100
```

---

## Documentation

| Document | Purpose |
|----------|---------|
| `ROADMAP.md` | Complete 12-week evolution plan |
| `docs/IMPLEMENTATION_GUIDE.md` | Detailed implementation steps |
| `docs/PHASE_1_COMPLETE.md` | What was accomplished in Phase 1 |
| `docs/QUICK_START.md` | This file - quick reference |
| `backend/README.md` | Backend-specific documentation |

---

## Support & Resources

### Internal Resources
- Roadmap: `ROADMAP.md`
- Implementation Guide: `docs/IMPLEMENTATION_GUIDE.md`
- Database Schema: `backend/src/db/schema.sql`

### External Resources
- Anthropic API: https://docs.anthropic.com/
- OpenAI API: https://platform.openai.com/docs
- better-sqlite3: https://github.com/WiseLibs/better-sqlite3
- Electron: https://www.electronjs.org/docs

---

**Last Updated:** November 22, 2025  
**Phase:** 1 Complete, Ready for Phase 2  
**Status:** ✅ Production Ready (Database Layer)
