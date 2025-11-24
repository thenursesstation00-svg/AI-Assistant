# GitHub Copilot Instructions for AI Assistant

## Purpose
Help an AI agent quickly become productive in this repository by describing the architecture, developer workflows, important conventions, and concrete examples taken from the codebase. Include concrete commands, environment variables, and file-level examples discovered during analysis.

## High-level Architecture
- Backend: `backend/` — Express-based Node service. Entrypoint: `backend/src/server.js`. Routes live under `backend/src/routes/`, business logic under `backend/src/services/`, auth under `backend/src/middleware/`, and background tasks under `backend/src/workers/`.
- Frontend: `frontend/` — Vite + React app. Entry: `frontend/src/main.jsx`, main components in `frontend/src/App.jsx`, `Admin.jsx`, and `Chat` UI in `frontend/src/Chat.css`.
- Desktop packaging: root-level Electron launcher `main.js`; packaging via `electron-builder` configured in root `package.json` (outputs in `release/`).
- On-disk data: fixtures and snapshots live in `backend/archives_report/`, `backend/uploads/`, and `backend/tmp_archive_response.json`.

## Key Workflows & Commands

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

```powershell
# On your build machine/CI, run (PowerShell):
.
\scripts\build_with_key.ps1 -BackendApiKey "<your-backend-api-key>"
```

  2. Preferable: the packaged app prompts the user at first run and stores the key in the OS secure store (Windows Credential Manager, macOS Keychain). This repo includes a first-run modal and `keytar`-backed storage already.

### Security Reminder
- Do NOT embed production secrets into build artifacts unless you fully control the environment and understand the implications. Prefer first-run secure storage (keytar) or OS-level provisioning of environment variables on managed installs.
- Do NOT commit tokens or certificates into the repository. Always use repository secrets. Rotate tokens immediately if accidentally exposed.
