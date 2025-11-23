---
applyTo:
  - "backend/**"
---

## Backend Service Guidelines
- Target Node.js 20 and npm 10; install dependencies with `npm ci` for repeatable builds.
- Keep Express routes minimal and delegate business logic to modules in `backend/src/services/`.
- When touching data models or providers, review `backend/src/database/`, `backend/src/services/anthropic*.js`, and related tests.

## Required Validation
- Run `npm test` (Jest) from `backend/` before submitting changes.
- For focussed suites use `npx jest backend/tests/<file>.test.js -i --runInBand` to avoid concurrency issues with shared fixtures.
- Update JSON fixtures in `backend/archives_report/` alongside any test expectation changes; never leave fixtures out of sync.

## Security Notes
- Load secrets via environment variables (`ANTHROPIC_API_KEY`, `BACKEND_API_KEY`, etc.); do not hardcode credentials.
- Remove or rotate the temporary Anthropic key in `backend/src/server.js` whenever shipping beyond local development.

## Agent Workflow Tips
1. Identify the target route/service and open the matching file under `backend/src/`.
2. Draft tests first or update existing tests in `backend/tests/` so behavior is defined.
3. Make minimal code changes and rerun Jest until it passes.
4. Document any new env vars or migrations in `backend/README.md` if needed.
