# AI Assistant - Copilot Instructions

## Architecture Overview

**Three-tier Electron desktop application** with multi-provider AI, advanced workspace, and MCP integration.

### Core Components
- **Backend** (`backend/`) — Express.js service on port 3001
  - Entry: `backend/src/server.js` (initializes DB, provider registry, routes)
  - Routes: `backend/src/routes/` (thin controllers with API key auth)
  - Services: `backend/src/services/` (AI providers, search, scraping, database)
  - Database: SQLite via `better-sqlite3` in `backend/src/database/`
  - Tests: `backend/tests/` (Jest with mocked providers)

- **Frontend** (`frontend/`) — React SPA built with Vite
  - Entry: `frontend/src/App.jsx` (classic chat + workspace + futuristic UI modes)
  - Components: Monaco editor, XTerm terminal, multi-panel layout
  - Styling: Tailwind CSS + custom CSS

- **Electron** (`src/`) — Desktop packaging with auto-update
  - Main: `src/main.js` (BrowserWindow, electron-updater, keytar IPC)
  - Preload: `src/preload.js` (contextBridge for secure API access)

- **MCP Integration** (`.mcp/config.json`) — 11 Model Context Protocol servers
  - Filesystem, GitHub, Brave Search, Fetch, Puppeteer, Git, Memory, Sequential Thinking, SQLite, Everything, Shell (disabled)

## Developer Workflows

### Backend Development
```powershell
cd backend
npm ci
npm run dev          # Nodemon on port 3001
npm test             # All Jest tests
npm test -- --testPathPattern=chat.test.js  # Specific test
```

### Frontend Development
```powershell
cd frontend
npm ci
npm run dev          # Vite dev server on port 5173
npm run build        # Production build to frontend/dist
```

### Electron Build
```powershell
# From repo root
npm install
npm run build:frontend  # Build React app first
npm run build           # Creates installer in release/
npm start               # Dev mode
```

### Testing Patterns
```powershell
# Run single test deterministically
cd backend
npx jest tests/chat.test.js -i --runInBand

# Integration tests
node scripts/run_integration_check.js
node scripts/test-phase3.js
```

## Critical Environment Variables

**Backend** (`backend/.env`):
```bash
# Required
ANTHROPIC_API_KEY=sk-ant-...           # Provider API key (server-side only)
BACKEND_API_KEY=your_backend_key       # Frontend-to-backend auth

# Multi-key auth (JSON mapping: key->role)
BACKEND_API_KEYS='{"admin_key":"admin","reader_key":"reader"}'
REQUIRE_API_KEY=false                   # Set to 'false' for local dev

# CORS & Rate Limiting
CORS_ORIGIN=http://localhost:5173
RATE_LIMIT_WINDOW=15                    # minutes
RATE_LIMIT_MAX_REQUESTS=100

# Optional integrations
SEARCH_PROVIDER=serpapi                 # or 'google', 'brave'
SERPAPI_KEY=your_key
GITHUB_TOKEN=ghp_...                    # For GitHub MCP server
REDIS_URL=redis://localhost:6379       # For search caching
```

## Project-Specific Patterns

### 1. Route → Service Architecture
**All business logic belongs in services**, not routes:
```javascript
// backend/src/routes/chat.js (thin controller)
router.post('/', requireAPIKey, async (req, res) => {
  const provider = await providerRegistry.getDefaultProvider();
  const result = await provider.sendMessage(req.body.messages);
  res.json(result);
});
```

Services handle:
- AI provider calls (`services/ai/providers/`)
- Search integration (`services/searchProvider.js`)
- Web scraping (`services/scraper.js`)

### 2. Multi-Provider AI System
**Provider Registry** (`backend/src/services/ai/registry.js`):
- Auto-initializes Anthropic, OpenAI from environment
- Usage: `providerRegistry.get('anthropic').sendMessage(messages)`
- Base class pattern in `services/ai/providers/base.js`

### 3. Secure API Key Flow
**Backend** (`backend/src/server.js` around line 40):
- Uses **constant-time comparison** in `requireAPIKey` middleware
- **Rejects provider keys** if sent as `x-api-key` (security check)
- Supports both single key and role-based multi-key auth

**Frontend** credential storage:
- First-run modal prompts for `BACKEND_API_KEY`
- Stored in OS keychain via keytar (Windows Credential Manager, macOS Keychain)
- Retrieved async via `getBackendApiKeyAsync()` in `frontend/src/config.js`

### 4. Test Fixtures as Source of Truth
- JSON fixtures in `backend/archives_report/` used by integration tests
- Mock external APIs (Anthropic, SerpAPI) to return fixture data
- **Always update fixtures and tests together**
- Example: `backend/tests/chat.test.js` mocks provider registry

### 5. MCP (Model Context Protocol) Servers
AI assistants get enhanced context via 11 MCP servers:
- **SQLite MCP** (`backend/src/database/mcp-server.js`) provides read-only DB access
- **GitHub MCP** requires `GITHUB_TOKEN` for repo integration
- Test: `.\scripts\setup-mcp.ps1 -InstallServers -TestConnection`

## Security & Best Practices

### ⚠️ Critical Security Items
1. **Never expose** `ANTHROPIC_API_KEY` to frontend/renderer
2. **Separate keys**: `BACKEND_API_KEY` ≠ `ANTHROPIC_API_KEY`
3. **Use keytar** for credential storage in packaged apps
4. **Constant-time comparison** prevents timing attacks in API key validation

### API Key Validation Pattern
```javascript
// backend/src/server.js - Security check prevents provider key misuse
if (key && process.env.ANTHROPIC_API_KEY && key === process.env.ANTHROPIC_API_KEY) {
  return res.status(401).json({
    error: 'Provider API keys must not be used as backend authentication'
  });
}
```

## CI/CD & Release

### GitHub Actions
- **`.github/workflows/release.yml`** — Triggered by version tags
- Builds frontend → runs backend tests → packages Electron → publishes to GitHub Releases
- **Required secrets**: `GH_TOKEN` (Personal Access Token with `repo` scope)

### Creating Releases
```powershell
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0
# Actions automatically builds and releases
```

### Auto-Update System
- `src/main.js` integrates `electron-updater` with auto-download
- Frontend shows `UpdateNotification.jsx` when updates available
- IPC events: `update-checking`, `update-available`, `update-downloaded`

## Agent Development Workflows

### Adding New API Routes
1. Create route in `backend/src/routes/newFeature.js`
2. Implement logic in `backend/src/services/newFeatureService.js`
3. Register in `backend/src/server.js`: `app.use('/api/new-feature', requireAPIKey, routes)`
4. Add tests in `backend/tests/newFeature.test.js` with mocked services
5. Run `cd backend && npm test` to validate

### Modifying AI Providers
1. Update provider class in `backend/src/services/ai/providers/`
2. Extend `AIProvider` base class pattern
3. Update registry initialization if needed
4. Mock in tests: `jest.mock('../src/services/ai/providers/anthropic')`

### Frontend Component Updates
1. Components in `frontend/src/` (App.jsx is main orchestrator)
2. Three UI modes: classic chat, workspace, futuristic
3. API calls centralized in `frontend/src/api.js`
4. Test with `npm run dev` in frontend directory

## Local Development Tips

### Quick Setup (No Auth)
```bash
# In backend/.env
REQUIRE_API_KEY=false  # Bypasses all API key checks
```

### Optional Redis Caching
```powershell
docker compose up -d   # Starts Redis container
# Set REDIS_URL=redis://localhost:6379 in backend/.env
```

### MCP Server Debugging
```powershell
npx @modelcontextprotocol/inspector backend\src\database\mcp-server.js
```

## Key Files Reference

| File | Purpose |
|------|---------|
| `backend/src/server.js` | Express app entry, middleware, routes |
| `backend/src/services/ai/registry.js` | Multi-provider AI system |
| `backend/src/database/db.js` | SQLite connection & initialization |
| `frontend/src/App.jsx` | Main UI with chat/workspace/futuristic modes |
| `src/main.js` | Electron main process with auto-updater |
| `.mcp/config.json` | 11 MCP servers configuration |
| `backend/tests/chat.test.js` | Example test with mocked providers |

## Common Pitfalls

### ❌ Don't
- Put business logic in routes (use services)
- Commit `.env` files or real API keys
- Modify fixtures without updating tests
- Expose provider keys to frontend
- Use synchronous operations in routes

### ✅ Do
- Mock external APIs in tests (`jest.mock`)
- Use `requireAPIKey` middleware on protected routes
- Run `npm test` in backend before committing
- Store credentials in OS keychain (keytar)
- Follow Route → Service separation pattern

## Documentation Links
- **[Quick Start](../docs/QUICKSTART.md)** — 5-minute setup
- **[MCP Guide](../docs/MCP_GUIDE.md)** — Model Context Protocol
- **[Backend README](../backend/README.md)** — Backend specifics
- **[Frontend README](../frontend/README.md)** — Frontend specifics
