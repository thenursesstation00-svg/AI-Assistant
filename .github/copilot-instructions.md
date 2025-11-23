<<<<<<< HEAD
# AI Assistant - Copilot Instructions

## Architecture Overview

**Three-tier Electron desktop application** with multi-provider AI, workspace UI, and MCP integration.

- **Backend** (`backend/`) — Express.js Node service (port 3001)
  - Entry: `backend/src/server.js`
  - Routes: `backend/src/routes/` (thin controllers)
  - Business logic: `backend/src/services/` (AI providers, search, scraping)
  - Database: SQLite via `better-sqlite3` in `backend/src/database/`
  - Auth: `backend/src/middleware/apiKeyAuth.js` (constant-time comparison)
  - Tests: `backend/tests/` (Jest with mocked providers)

- **Frontend** (`frontend/`) — Vite + React SPA
  - Entry: `frontend/src/main.jsx`
  - Main component: `frontend/src/App.jsx` (classic chat + workspace mode)
  - Panels: `frontend/src/panels/` (ChatPanel, EditorPanel, TerminalPanel)
  - Styling: `frontend/src/Chat.css`, `frontend/src/PluginManager.css`

- **Electron** (`src/`) — Desktop packaging layer
  - Main process: `src/main.js` (BrowserWindow, auto-updater, IPC)
  - Preload: `src/preload.js` (contextBridge for secure IPC)
  - Keytar integration: OS-level credential storage (Windows Credential Manager, macOS Keychain)

- **MCP Servers** (`.mcp/config.json`) — 11 Model Context Protocol servers
  - Filesystem, GitHub, Brave Search, Fetch, Puppeteer, Git, Memory, Sequential Thinking, SQLite, Everything, Shell (disabled)

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

### Backend Development
  - `cd backend`
  - `npm ci`
  - `npm test` (runs Jest using `backend/jest.config.cjs`)
  - Dev server: `npm run dev` (uses `nodemon src/server.js`)

### Frontend Development
  - `cd frontend`
  - `npm ci`
  - `npm run dev` (Vite dev server)
  - `npm run build` (produces `frontend/dist` used by Electron build)

### Desktop Build
  - From repo root: `npm run build` (runs `build:frontend` then `electron-builder` — see root `package.json`)

### Archive & Integration Testing
  - `node scripts/run_archive.js`
  - `node scripts/run_integration_check.js`

## Important Environment Variables
- `ANTHROPIC_API_KEY` — used by `backend/src/services/anthropic.js` (preferred way to pass Anthropic credentials).
- NOTE: `backend/src/server.js` contains a hardcoded Anthropic key in a test endpoint — this is a secret and should be removed or rotated immediately.
- `BACKEND_API_KEY` / `MY_API_KEY` — legacy single API key for `middleware/apiKeyAuth.js`.
- `BACKEND_API_KEYS` — optional JSON mapping of `key->role` (e.g. `{"key1":"admin"}`) used by `apiKeyAuth` to support role-based access.
- `REQUIRE_API_KEY` — set to `'false'` to disable API key enforcement for local testing.
- `CORS_ORIGIN` — controls allowed origin for CORS in `server.js` (default `http://localhost:5173`).
- Rate limiting: `RATE_LIMIT_WINDOW` (minutes) and `RATE_LIMIT_MAX_REQUESTS` (max) are used to configure `express-rate-limit`.
- AV worker: `AV_SCAN_CMD` (required to enable `startAvWorker`) and optional `AV_SCAN_INTERVAL_MS`.

## Critical Files
- `backend/src/server.js` — entrypoint and a short test chat endpoint (contains a hardcoded Anthropic key; must be fixed).
- `backend/src/services/anthropic.js` — production pathway for Anthropic calls (expects `ANTHROPIC_API_KEY`).
- `backend/src/services/anthropicWrapper.js` — normalizes provider responses for routes.
- `backend/src/routes/chat.js` — demonstrates message validation, simple moderation, and uses `sendToAnthropic`.
- `backend/src/middleware/apiKeyAuth.js` — explains API key handling and role attachment to `req`.
- `backend/src/workers/avWorker.js` — background worker pattern that scans `uploads/meta/*.json` and executes `AV_SCAN_CMD`.
- Tests: `backend/tests/*.test.js` — most tests mock `src/services/anthropic.js` (see `chat.test.js`) and rely on fixtures.

## Project-Specific Conventions & Patterns
- Route → Service: Routes are thin and delegate to `services/` for business logic and external API calls (follow this separation).
- Fixtures-as-truth: JSON files under `backend/archives_report/` and `backend/tmp_archive_response.json` are used by integration tests — update tests when changing these fixtures.
- Env-first secrets: runtime credentials should come from environment variables; remove any hardcoded keys from source.

## Integration Points & Local-Only Behavior
- The backend often consumes local archive directories (`backend/backend_archives/`, `backend/archives_report/`) for offline testing.
- CI and tests mock network calls; `backend/tests` uses `jest` + `supertest` for route testing and `jest.mock` for provider stubs.

## Search Provider Integration
- A new `backend/src/services/searchProvider.js` adapter supports external web search providers. Configure via env vars:
  - `SEARCH_PROVIDER`: `serpapi` (default) or `google`.
  - `SERPAPI_KEY`: API key for SerpApi (if using `serpapi`).
  - `GOOGLE_CSE_KEY` and `GOOGLE_CSE_CX`: API key and search engine ID for Google Custom Search (if using `google`).
- A new protected route `/api/search?q=...` proxies queries through the adapter and requires the app `x-api-key` header.

## Security & Immediate Action Items
- Remove or rotate the hardcoded Anthropic key found in `backend/src/server.js` before running the app publicly.
- Prefer `ANTHROPIC_API_KEY` in the environment and ensure `backend/data/api_keys.json` (if used) does not contain real secrets in the repository.
- Application API key options: The app supports two ways to provide `BACKEND_API_KEY` to the renderer:
   1. Packaged app environment: set `BACKEND_API_KEY` as an environment variable at runtime/build time. The Electron `preload.js` exposes it to the renderer as `window.__APP_CONFIG__.BACKEND_API_KEY` (read-only).
   2. In-app settings: users can set the `BACKEND_API_KEY` via the Settings UI; this value is stored in `localStorage` and used to send the `x-api-key` header.

  Prefer option (1) for production installs (no secret persisted in user-visible storage).

## How to Approach Changes
- Small change that touches runtime behavior:
  1. Update code in `backend/src/services/` or `routes/`.
  2. Add/update unit tests in `backend/tests/` and run `cd backend; npm test` locally.
  3. If fixtures change, update JSON under `backend/archives_report/` in the same PR.
- Adding an API route:
  - Wire endpoint in `backend/src/routes/` → implement logic in `backend/src/services/` → secure with `apiKeyAuth` if needed → add tests in `backend/tests/`.

## Examples
- Run a single test deterministically:
  - `cd backend`
  - `npx jest backend/tests/chat.test.js -i --runInBand`
- Start backend dev server with nodemon:
  - `cd backend; npm run dev`

## What Not to Change Without Human Review
- Do not modify JSON fixtures under `backend/archives_report/` or `backend/tmp_archive_response.json` without updating tests.
- Do not modify `release/` artifacts — those are build outputs.

## Additional Context & Credentials
- Read `backend/README.md` and `frontend/README.md` for additional notes.
- Request `backend/data/api_keys.json` or `ANTHROPIC_API_KEY` from the repository owner if you must run full integrations; do not accept secrets via commits.

## Release & Auto-Update
- CI workflow: `.github/workflows/release.yml` is added to build the frontend, run backend tests, and run `npm run build` to produce Electron artifacts on tag pushes (tags like `v1.2.3`).
- GitHub token: The workflow uses `GITHUB_TOKEN` (automatically provided) or a personal `GH_TOKEN` if you need broader permissions. Add any needed secrets under repository Settings → Secrets.
- electron-updater: `main.js` now integrates `electron-updater` and the app exposes a minimal updater IPC via `preload.js` (renderer: `window.electronUpdater`). To publish updates automatically you must publish the built artifacts (nsis/inno) to GitHub Releases or another provider supported by `electron-updater`.
- How to create a release from a tag locally:
  - Create annotated tag: `git tag -a v1.0.0 -m "release v1.0.0"`
  - Push the tag: `git push origin v1.0.0`
  - The workflow will run and create artifacts; GitHub Releases will contain the packaged installer if `GITHUB_TOKEN` has write access.

## CI Secrets and Code-Signing
- **Required secret**: `GH_TOKEN` — a Personal Access Token (PAT) with `repo` scope for private repos (or `public_repo` for public-only). Store it in **Repository Settings → Secrets and variables → Actions**. Use `secrets.GH_TOKEN` in workflows.
- **Optional secret**: `CODE_SIGN_CERT` / `CSC_LINK` & `CSC_KEY_PASSWORD` — for Windows/macOS code-signing. `electron-builder` supports using `CSC_LINK` (URL to a PFX) and `CSC_KEY_PASSWORD` environment variables. If you use GitHub Actions, add these as secrets and ensure your runner has network access to download the certificate during build.
- **Keytar / native modules**: CI runners must be able to compile native modules (e.g., `keytar`). Use the platform matching your target (Windows runners for Windows builds). Ensure `npm ci` runs on the build runner and that `node-gyp` build dependencies are available.

### Provisioning Checklist
- Create the PAT in GitHub (Settings → Developer settings → Personal access tokens). Choose `repo` or `public_repo` as required and set an expiration.
- Add the PAT to the repository secrets as `GH_TOKEN`.
- Add code-signing secrets (`CSC_LINK` and `CSC_KEY_PASSWORD`) if you plan to sign Windows installers. Upload the PFX to a secure location and reference it via `CSC_LINK`.
- Verify by running a test tag and checking the Actions build logs and Releases page.

### CI Troubleshooting
- If the release publish fails with permission errors, check that the token used in `secrets.GH_TOKEN` has the right scopes and that it hasn't expired.
- If native modules fail to build on CI, ensure the runner OS matches the targeted platform and install any required build tools (e.g., Windows: Visual Studio Build Tools).

### Sample `electron-builder` Publish Configuration
- In `package.json` -> `build.publish` you can specify the owner/repo and release type. Example:

```json
"publish": [
  {
    "provider": "github",
    "owner": "your-github-username-or-org",
    "repo": "your-repo-name",
    "releaseType": "draft"
  }
]
```

When using this, ensure `GH_TOKEN` has `repo` (or `public_repo`) scope and is stored in repository secrets as `GH_TOKEN`.

## Redis Caching for Search Provider
- To enable cross-instance caching for `/api/search`, set `REDIS_URL` (for example `redis://:password@host:6379/0`) in backend environment. The `searchProvider` will use Redis when `REDIS_URL` is present; otherwise it falls back to the in-memory cache.
- Configurable TTL and size via env:
  - `SEARCH_CACHE_TTL_MS` (default `300000`, 5 minutes)
  - `SEARCH_CACHE_MAX` (default `100`)

### Local Redis for Development
- A `docker-compose.yml` file is provided at the repo root to run Redis for local testing:

```powershell
docker compose up -d
# stop: docker compose down
```

### CI Notes for Redis
- If you want CI to run integration tests against Redis, you can enable a GitHub Actions `services` container for Redis in the job. Example (partial job snippet):

```yaml
services:
  redis:
    image: redis:7
    ports:
      - 6379:6379
    options: >-
      --health-cmd "redis-cli ping" --health-interval 10s --health-timeout 5s --health-retries 5
env:
  REDIS_URL: redis://localhost:6379
```

## Build-time Injection of `BACKEND_API_KEY`
- Two common options:
  1. CI injects `BACKEND_API_KEY` into the build environment so the packaged app can expose it at runtime (less secure; only use for internal builds). Example using the included `scripts/build_with_key.ps1` (PowerShell):
>>>>>>> origin/copilot/setup-copilot-instructions

# Integration tests
node scripts/run_integration_check.js
node scripts/test-phase3.js
```

## Critical Environment Variables

<<<<<<< HEAD
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
**Backend auth** (`backend/src/middleware/apiKeyAuth.js`):
- Uses **constant-time comparison** to prevent timing attacks
- Supports single key (`BACKEND_API_KEY`) or multi-key mapping (`BACKEND_API_KEYS`)
- Attaches `req.apiKeyRole` and `req.apiKey` for downstream use
- **Rejects provider keys** (e.g., `ANTHROPIC_API_KEY`) if accidentally sent as `x-api-key`

**Frontend credential flow**:
1. First-run modal (`FirstRunModal.jsx`) prompts user for `BACKEND_API_KEY`
2. Stored in OS keychain via `window.backendKeyStore.setKey()` (IPC to main process)
3. Retrieved via `getBackendApiKeyAsync()` in `frontend/src/config.js`
4. Sent as `x-api-key` header in all API requests

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
1. **Rotate hardcoded Anthropic key** in `backend/src/server.js` (line ~78) before public deployment
2. **Never commit** `backend/.env` or `backend/data/api_keys.json` with real secrets
3. **Use keytar** for credential storage in packaged apps (not localStorage)

### Best Practices
- **Secrets**: Load from environment variables, never hardcode
- **API keys**: Separate `BACKEND_API_KEY` (frontend→backend) from provider keys (backend→AI)
- **Rate limiting**: Configure `RATE_LIMIT_WINDOW` and `RATE_LIMIT_MAX_REQUESTS` for production
- **CORS**: Set `CORS_ORIGIN` to match frontend origin (avoid wildcard)

## CI/CD & Release Process

### GitHub Actions Workflows
- **`.github/workflows/build.yml`** — Runs on PRs, tests backend
- **`.github/workflows/release.yml`** — Triggered by version tags (e.g., `v1.0.0`)
  - Builds frontend
  - Runs backend tests
  - Packages Electron app (Windows NSIS installer)
  - Publishes to GitHub Releases

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

### Auto-Update System
**Electron app** (`src/main.js`) integrates `electron-updater`:
- Auto-downloads updates from GitHub Releases
- Sends IPC events to renderer (via `preload.js`)
- Frontend displays `UpdateNotification.jsx` when update available

## Agent Workflow Guide

### Adding a New API Route
1. Create route file in `backend/src/routes/` (e.g., `newFeature.js`)
2. Implement business logic in `backend/src/services/`
3. Add route to `backend/src/server.js`:
   ```javascript
   const newFeatureRoutes = require('./routes/newFeature');
   app.use('/api/new-feature', requireAPIKey, newFeatureRoutes);
   ```
4. Write tests in `backend/tests/newFeature.test.js` (mock services with Jest)
5. Run `npm test` from `backend/` to validate

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
4. Test with `npm run dev` in `frontend/` directory
5. Rebuild with `npm run build` before packaging Electron app

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
| `backend/src/middleware/apiKeyAuth.js` | API key validation (constant-time) |
| `backend/src/services/ai/registry.js` | Multi-provider AI management |
| `backend/src/database/db.js` | SQLite connection & schema init |
| `frontend/src/App.jsx` | Main UI component (chat + workspace) |
| `src/main.js` | Electron main process (IPC, auto-update) |
| `src/preload.js` | Secure IPC bridge (contextBridge) |
| `.mcp/config.json` | MCP server configuration |
| `.github/workflows/release.yml` | CI/CD release pipeline |
| `backend/tests/chat.test.js` | Example test with mocked providers |

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

### Security Reminder
- Do NOT embed production secrets into build artifacts unless you fully control the environment and understand the implications. Prefer first-run secure storage (keytar) or OS-level provisioning of environment variables on managed installs.
- Do NOT commit tokens or certificates into the repository. Always use repository secrets. Rotate tokens immediately if accidentally exposed.
