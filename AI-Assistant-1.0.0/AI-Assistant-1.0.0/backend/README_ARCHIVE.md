# Archive Feature (backend)

This document explains the archive features in the backend, safe defaults, and how to run them locally.

Environment variables (backend/.env)
- `GITHUB_TOKEN` (required for authenticated GitHub API calls)
- `BACKEND_API_KEY` (admin API key; requests to `/api/admin/*` must include `x-api-key` header)
- `BACKEND_NOTIFY_URL` (optional webhook URL for pending patch notifications)

Endpoints
- `POST /api/admin/archive` — body: `{ query, per_page, page, fetch_readme, save, auto_clone }`.
  - `save` (bool): when true, the server writes per-run JSON report to `backend/archives_report/` and per-repo artifacts to `backend/backend_archives/<owner__repo>/`.
  - `auto_clone` (bool): when true and repository license is permissive (MIT/BSD/Apache heuristics), the server attempts a shallow clone into the artifact directory. Cloning requires `git` on PATH.

- `GET /api/admin/reports` — lists saved report files (protected by API key).
- `GET /api/admin/reports/:file` — returns report JSON content.
- `GET /api/admin/artifacts/:repo/:file` — returns `meta.json` or `README.md` for saved repo artifacts.

Safety and defaults
- Persistence is opt-in: `save` and `auto_clone` default to `false` and must be explicitly set.
- License filtering: auto-clone only for repos with permissive license heuristics to reduce license risk.
- Admin endpoints are protected by `x-api-key` and `BACKEND_API_KEY`.

Running locally (safe)
1. Create `backend/.env` with `GITHUB_TOKEN` and `BACKEND_API_KEY`.
2. Start the backend:
   ```powershell
   node backend/src/server.js
   ```
3. Use the frontend Admin UI (in this repo under `frontend/src/Admin.jsx`) or call the endpoints via curl/PowerShell/HTTP client.

Developer notes
- For CI, avoid running archive/clone actions that access external networks unless tests are explicitly configured to mock network calls.
- Use the provided mock crawler (`backend/src/services/githubCrawler.mock.js`) by setting `USE_MOCK_GITHUB=1` when running integration checks locally.
Archive & GitHub Integration

This document explains the safe, opt-in archive and cloning features provided by the backend.

Environment
- `GITHUB_TOKEN` - required to use the GitHub Search and content APIs.
- `BACKEND_API_KEY` - admin API key used to protect archive/patch endpoints.
- `BACKEND_NOTIFY_URL` (optional) - webhook URL to notify when a pending patch is created.

Key endpoints
- `POST /api/admin/archive` - body: `{ query, per_page, page, fetch_readme, save, auto_clone }`.
  - `fetch_readme` (bool): when true, server will fetch README for permissive-licensed repos.
  - `save` (bool): when true, server will persist per-repo `meta.json` and `README.md` under `backend_archives/<owner__repo>/` and will write a run report under `archives_report/`.
  - `auto_clone` (bool): when true and a repo license is permissive, server will `git clone --depth=1` into the `backend_archives/<owner__repo>/` directory.

Design & Safety
- The archive flow is explicit and opt-in. The server will not save or clone repositories unless `save` and/or `auto_clone` are specified.
- The server detects permissive licenses (MIT, BSD, Apache) before auto-cloning. Non-permissive repos will not be cloned and READMEs are only fetched for permissive repos when `fetch_readme` is true.
- Rate limiting and CORS configuration is enforced by the main server.

Running locally
1. Ensure you have `git` available on PATH to use `auto_clone`.
2. Populate `backend/.env` with `GITHUB_TOKEN` and `BACKEND_API_KEY`.
3. Start the backend:

```powershell
node backend/src/server.js
```

4. Run a safe archive (no clone) using the helper script included:

```powershell
node backend/test_post_archive_write.js
```

Artifacts
- `archives_report/` — per-run JSON reports when `save=true`.
- `backend_archives/<owner__repo>/` — `meta.json` + `README.md` and optionally a shallow clone when `auto_clone=true`.

Notes
- Be mindful of GitHub API rate limits; use an authenticated `GITHUB_TOKEN`.
- The project intentionally keeps archive operations opt-in to respect copyright and user control.
