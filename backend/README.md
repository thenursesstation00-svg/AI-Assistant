```markdown
# Backend

## Setup (local)

1. cd backend
2. cp .env.example .env and fill ANTHROPIC_API_KEY and BACKEND_API_KEY (see security notes)
3. npm install
4. npm run dev

The API listens at http://localhost:3001

## Development Workflow (Nodemon)

We use `nodemon` to automatically restart the server when file changes are detected.

- **Start Development Server**:
  ```bash
  npm run dev
  ```
- **Manual Restart**: Type `rs` and press Enter in the terminal running nodemon.
- **Troubleshooting**:
  - If the server crashes immediately, check the logs for syntax errors.
  - If `EADDRINUSE` errors occur, ensure no other process is using port 3001 (`lsof -i :3001` or `netstat -ano | findstr :3001`).

## Authentication & security notes

- This backend expects frontend-to-backend requests to authenticate using a dedicated backend API key header `x-api-key`.
  - For a simple single-key setup set `BACKEND_API_KEY` in `backend/.env`.
  - Alternatively set `BACKEND_API_KEYS` with a JSON mapping: e.g.
    `BACKEND_API_KEYS='{"secret-backend-key-123":"admin","read-only-key-456":"reader"}'`
- Important: Do NOT expose `ANTHROPIC_API_KEY` (or any provider secret) to client-side/renderer code.
  - If the client sends the Anthropic key as `x-api-key`, the backend will reject it and return a 401 with a message instructing you to set a separate backend key.
  - If you've accidentally exposed the Anthropic key in the renderer, rotate it immediately.

## Quick test

1. Start backend:
   cd backend
   npm install
   npm run dev

2. Test health:
   curl http://localhost:3001/health

3. Test protected endpoint (replace BACKEND_KEY):
   curl -i -X POST http://localhost:3001/api/chat \
     -H "Content-Type: application/json" \
     -H "x-api-key: BACKEND_KEY" \
     -d '{"messages":[{"role":"user","content":"hello"}]}'

## Development tips

- For quick local dev temporarily set `REQUIRE_API_KEY=false` in backend/.env — this will bypass API key checks (do NOT use in production).
- Ensure `CORS_ORIGIN` matches the origin used by your frontend during development (e.g., `http://localhost:5173`).
- The backend communicates with Anthropic using `ANTHROPIC_API_KEY` — keep that strictly server-side.

```