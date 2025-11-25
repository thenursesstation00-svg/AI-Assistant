# AI Assistant - Copilot Instructions

## Architecture Overview

**Three-tier Electron desktop application** with multi-provider AI, workspace UI, and MCP integration.

- **Backend** (`backend/`) — Express.js Node service (port 3001)
  - Entry: `backend/src/server.js` (includes inline middleware for API key auth)
  - Routes: `backend/src/routes/` (thin controllers delegate to services)
  - Business logic: `backend/src/services/` (AI providers, search, scraping)
  - Database: SQLite via `better-sqlite3` in `backend/src/database/`
  - Auth: Inline `requireAPIKey` middleware in `server.js` (constant-time comparison)
  - Tests: `backend/tests/` (Jest with mocked providers via `jest.mock`)

- **Frontend** (`frontend/`) — Vite + React SPA (ES modules)
  - Entry: `frontend/src/main.jsx`
  - Main component: `frontend/src/App.jsx` (classic chat + workspace mode)
  - Panels: `frontend/src/panels/` (ChatPanel, EditorPanel, TerminalPanel, FileBrowser)
  - API layer: `frontend/src/api.js` (centralized fetch wrappers with auth headers)
  - Styling: Component-specific CSS (`Chat.css`, `PluginManager.css`)

- **Electron** (`src/`) — Desktop packaging layer
  - Main process: `src/main.js` (BrowserWindow, auto-updater, IPC, menu)
  - Preload: `src/preload.js` (contextBridge for secure IPC, exposes backend API key)
  - Keytar integration: OS-level credential storage (Windows Credential Manager, macOS Keychain)

- **MCP Servers** (`.mcp/config.json`) — 11 Model Context Protocol servers
  - Filesystem, GitHub, Brave Search, Fetch, Puppeteer, Git, Memory, Sequential Thinking, SQLite, Everything, Shell (disabled by default)

## Developer Workflows

### Backend Development
```bash
cd backend
npm ci
npm run dev          # Starts nodemon on port 3001
npm test             # Run all Jest tests
npm test -- chat.test.js  # Run specific test
```

### Frontend Development
```bash
cd frontend
npm ci
npm run dev          # Vite dev server on port 5173
npm run build        # Production build to frontend/dist
```

### Electron Desktop Build
```bash
# From repo root
npm install
npm run build:frontend  # Build React app
npm run build           # Create installer (release/ directory)
npm start               # Run in dev mode
```

### Testing & Validation
```bash
# Backend tests (with fixtures)
cd backend
npx jest backend/tests/chat.test.js -i --runInBand  # Single test, no parallelism

# Integration tests
node scripts/run_integration_check.js
node scripts/test-phase3.js
```

## Critical Environment Variables

**Backend** (`backend/.env`):
```bash
# Required
ANTHROPIC_API_KEY=sk-ant-...           # Provider API key (NEVER expose to client)
BACKEND_API_KEY=your_backend_key       # Separate key for frontend-to-backend auth

# Multi-key support (JSON mapping: key->role)
BACKEND_API_KEYS='{"admin_key":"admin","reader_key":"reader"}'
REQUIRE_API_KEY=false                   # Set to 'false' for local dev (no auth)

# CORS
CORS_ORIGIN=http://localhost:5173      # Must match frontend dev server

# Search providers (optional)
SEARCH_PROVIDER=serpapi                 # or 'google', 'brave'
SERPAPI_KEY=your_key
BRAVE_API_KEY=your_key

# MCP integration
GITHUB_TOKEN=ghp_...                    # For GitHub MCP server

# Caching (optional)
REDIS_URL=redis://localhost:6379
SEARCH_CACHE_TTL_MS=300000
```

**Electron** (build-time or runtime):
```bash
BACKEND_API_KEY=your_key  # Exposed via preload.js as window.__APP_CONFIG__.BACKEND_API_KEY
```

## Project-Specific Patterns

### 1. Route → Service Separation
Routes (`backend/src/routes/`) are **thin controllers** that delegate to services:
```javascript
// backend/src/routes/chat.js
router.post('/', requireAPIKey, async (req, res) => {
  const result = await providerRegistry.getDefaultProvider().sendMessage(req.body.messages);
  res.json(result);
});
```
**Never put business logic in routes.** Use `backend/src/services/` for:
- AI provider calls (`services/ai/providers/`)
- Search integration (`services/searchProvider.js`)
- Web scraping (`services/scraper.js`)

### 2. Multi-Provider AI System
**Provider Registry** (`backend/src/services/ai/registry.js`):
- Manages Anthropic, OpenAI, Google Gemini, Ollama
- Auto-initializes from environment variables
- Usage: `providerRegistry.get('anthropic').sendMessage(messages)`

**Database-backed Provider Management** (`backend/src/database/providers.js`):
- Stores provider configs in SQLite (`ai_providers` table)
- Tracks API key rotation, usage limits, rate limits

### 3. Secure API Key Handling
**Backend auth** (inline in `backend/src/server.js`, not separate middleware file):
- Uses **constant-time comparison** via `requireAPIKey` function to prevent timing attacks
- Supports single key (`BACKEND_API_KEY`) or multi-key JSON mapping (`BACKEND_API_KEYS='{"key":"role"}'`)
- Attaches `req.apiKeyRole` and `req.apiKey` for downstream role-based access control
- **Rejects provider keys** if `ANTHROPIC_API_KEY` is accidentally sent as `x-api-key` (returns 401)
- Can bypass auth for local dev with `REQUIRE_API_KEY=false` (never use in production)

**Frontend credential flow**:
1. First-run modal (`FirstRunModal.jsx`) prompts user for `BACKEND_API_KEY`
2. Stored in OS keychain via `window.backendKeyStore.setKey()` (IPC to main process → keytar)
3. Retrieved via `getBackendApiKeyAsync()` in `frontend/src/config.js`
4. All API calls in `frontend/src/api.js` attach `x-api-key` header automatically

### 4. Test Fixtures as Truth
JSON files in `backend/archives_report/` and `backend/tmp_archive_response.json` are **canonical fixtures** for integration tests:
- Tests mock external APIs (Anthropic, SerpAPI) and load these fixtures
- **When changing fixtures, update tests in the same commit**
- Example: `backend/tests/archive.integration.test.js` mocks `githubCrawler` to return fixture data

### 5. MCP (Model Context Protocol) Integration
AI assistants access 11 MCP servers for enhanced capabilities:
- **SQLite server** (`backend/src/database/mcp-server.js`) provides **read-only** database access
- **Brave Search** enables internet search via MCP
- **Puppeteer** allows web scraping
- **GitHub** integrates with repos using `GITHUB_TOKEN`

Test MCP setup:
```bash
.\scripts\setup-mcp.ps1 -InstallServers -TestConnection
node backend\src\database\mcp-server.js  # Test SQLite MCP
```

## Security Checklist

### ⚠️ Immediate Action Items
1. **Never commit** real API keys - `.env` files are gitignored but check `.env.example` has placeholders only
2. **Rotate any exposed keys** immediately if accidentally committed (especially `ANTHROPIC_API_KEY`)
3. **Use keytar** for credential storage in packaged apps (not localStorage or plain files)

### Best Practices
- **Secrets**: Load from environment variables via `dotenv`, never hardcode in source
- **API keys**: Separate `BACKEND_API_KEY` (frontend→backend auth) from provider keys (backend→AI services)
- **Constant-time comparison**: Auth middleware prevents timing attacks (`requireAPIKey` in `server.js`)
- **Rate limiting**: Configure `RATE_LIMIT_WINDOW` and `RATE_LIMIT_MAX_REQUESTS` in production `.env`
- **CORS**: Set `CORS_ORIGIN` to match frontend origin (e.g., `http://localhost:5173` dev, specific domain prod)
- **Provider key protection**: Backend rejects requests using `ANTHROPIC_API_KEY` as `x-api-key`

## CI/CD & Release Process

### GitHub Actions Workflows
- **`.github/workflows/build.yml`** — Runs on PRs, tests backend
- **`.github/workflows/release.yml`** — Triggered by version tags (e.g., `v1.0.0`)
  - Builds frontend
  - Runs backend tests
  - Packages Electron app (Windows NSIS installer)
  - Publishes to GitHub Releases
- **`.github/workflows/build-all-platforms.yml`** — Multi-platform builds (Windows, macOS, Linux)

### Required GitHub Secrets
- `GH_TOKEN` — Personal Access Token with `repo` scope (for private repos)
- `CSC_LINK` (optional) — Code signing certificate URL
- `CSC_KEY_PASSWORD` (optional) — Certificate password

### Creating a Release
```bash
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0
# GitHub Actions will build and create release automatically
```

### Build Targets (via electron-builder)
**Windows**: NSIS installer (.exe) + Portable, supports x64 and ARM64  
**macOS**: DMG + ZIP for Intel and Apple Silicon (arm64)  
**Linux**: AppImage, DEB, RPM, Snap for x64 and ARM64

Build configuration in root `package.json` under `build` key.

### Auto-Update System
**Electron app** (`src/main.js`) integrates `electron-updater`:
- Auto-downloads updates from GitHub Releases
- Sends IPC events to renderer (via `preload.js`)
- Frontend displays `UpdateNotification.jsx` when update available

## Agent Workflow Guide

### Adding a New API Route
1. Create route file in `backend/src/routes/` (e.g., `newFeature.js`)
2. Implement business logic in `backend/src/services/` (keep routes thin)
3. Register route in `backend/src/server.js`:
   ```javascript
   const newFeatureRoutes = require('./routes/newFeature');
   app.use('/api/new-feature', requireAPIKey, newFeatureRoutes);
   ```
4. Write tests in `backend/tests/newFeature.test.js`:
   - Use `jest.mock()` for external services
   - Use `supertest` with Express app for HTTP testing
   - Mock provider with `mockProvider.sendMessage.mockResolvedValue(...)`
5. Run `npm test` from `backend/` to validate
6. Update `frontend/src/api.js` if frontend needs to call this endpoint

### Modifying AI Provider Behavior
1. Locate provider in `backend/src/services/ai/providers/` (e.g., `anthropic.js`)
2. Update provider class (extends `AIProvider` base class)
3. Update provider registry (`backend/src/services/ai/registry.js`) if adding new provider
4. Mock provider in tests using `jest.mock('../src/services/ai/providers/...')`
5. Test with `npm test -- chat.test.js`

### Updating Frontend UI
1. Identify component in `frontend/src/` or `frontend/src/panels/`
2. Update JSX and co-located CSS (e.g., `Chat.css`, `PluginManager.css`)
3. Sync API calls with `frontend/src/api.js` (centralized fetch wrappers)
4. Ensure credentials retrieved via `getBackendApiKeyAsync()` before API calls
5. Test with `npm run dev` in `frontend/` directory (Vite dev server on port 5173)
6. Rebuild with `npm run build` before packaging Electron app
7. For workspace panels, use `react-grid-layout` with saved layouts in SQLite

### Running Background Workers
Example: AV scanner worker (`backend/src/workers/avWorker.js`):
```javascript
// Requires AV_SCAN_CMD environment variable
const { startAvWorker } = require('./workers/avWorker');
if (process.env.AV_SCAN_CMD) startAvWorker();
```

## Common Pitfalls

### ❌ Don't Do This
- **Don't** modify JSON fixtures (`backend/archives_report/`) without updating tests
- **Don't** put AI provider logic in routes (use services)
- **Don't** commit `.env` files or real API keys
- **Don't** use synchronous FS operations in routes (blocks event loop)
- **Don't** expose `ANTHROPIC_API_KEY` to frontend/renderer

### ✅ Do This Instead
- **Do** run `npm test` in `backend/` before committing
- **Do** use `requireAPIKey` middleware on protected routes
- **Do** store user credentials in OS keychain (keytar) for packaged apps
- **Do** mock external API calls in tests (`jest.mock`)
- **Do** use constant-time comparison for API key validation

## Local Development Tips

### Quick Dev Setup (No Auth)
```bash
# backend/.env
REQUIRE_API_KEY=false  # Bypass API key checks for local testing
```

### Redis Caching (Optional)
```bash
docker compose up -d   # Start Redis container
# Set REDIS_URL=redis://localhost:6379 in backend/.env
docker compose down    # Stop Redis
```

### Debugging MCP Servers
```bash
npx @modelcontextprotocol/inspector backend\src\database\mcp-server.js
```

### Running Single Test with Fixtures
```bash
cd backend
npx jest tests/archive.integration.test.js -i --runInBand
```

## Key Files Reference

| File | Purpose |
|------|---------|
| `backend/src/server.js` | Express app entry, route registration |
| `backend/src/server.js` (inline) | API key validation middleware (`requireAPIKey`, `requireRole`) |
| `backend/src/services/ai/registry.js` | Multi-provider AI management |
| `backend/src/database/db.js` | SQLite connection & schema init |
| `frontend/src/App.jsx` | Main UI component (chat + workspace) |
| `frontend/src/api.js` | Centralized API client with auth headers |
| `frontend/src/config.js` | Backend API key retrieval via IPC |
| `src/main.js` | Electron main process (IPC, auto-update) |
| `src/preload.js` | Secure IPC bridge (contextBridge) |
| `.mcp/config.json` | MCP server configuration |
| `.github/workflows/release.yml` | CI/CD release pipeline |
| `backend/tests/chat.test.js` | Example test with mocked providers |
| `backend/.env.example` | Environment variable template (includes example API key - replace before use) |

## Documentation Index

- **[Quick Start](docs/QUICKSTART.md)** — 5-minute setup guide
- **[MCP Guide](docs/MCP_GUIDE.md)** — Model Context Protocol configuration
- **[Backend README](backend/README.md)** — Backend-specific notes
- **[Frontend README](frontend/README.md)** — Frontend-specific notes
- **[Phase Roadmap](docs/PHASE_ROADMAP.md)** — Development progress

## Questions or Unclear Sections?

This document covers the essential patterns for AI agents working in this codebase. If you need clarification on:
- **Database migrations** or schema changes
- **MCP server customization** or debugging
- **Provider key rotation** workflows
- **Electron packaging** for macOS/Linux
- **CI/CD optimization** or code signing

...please ask for specific guidance!
