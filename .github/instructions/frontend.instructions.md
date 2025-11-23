---
applyTo:
  - "frontend/**"
---

## Frontend Guidelines
- Vite + React (ES modules) with entry `frontend/src/main.jsx`; prefer functional components with hooks.
- Keep shared configuration in `frontend/src/api.js` and `frontend/src/config.js`; avoid duplicating API base URLs or feature flags.
- Co-locate reusable UI under `frontend/src/components/` and panel-specific logic under `frontend/src/panels/`.

## Required Validation
- Install deps via `npm ci` and run `npm run dev` to verify the UI manually; no automated test suite exists yet.
- Rebuild with `npm run build` whenever Electron packaging or deployment assets are impacted.
- Run `npm run lint` and `npm run format` at the repo root if you touch styling or JSX structure.

## Styling & Accessibility
- Use existing utility classes in `frontend/src/Chat.css` and `frontend/src/PluginManager.css`; prefer CSS modules already in place.
- Ensure modals and panels remain keyboard accessible (focus trap, `aria` labels) and reuse helpers from `FirstRunModal.jsx` when possible.

## Agent Workflow Tips
1. Identify the target component and update the associated JSX/CSS files together.
2. Verify API changes remain aligned with `frontend/src/api.js`; update request wrappers instead of duplicating fetch logic.
3. After edits, run the Vite dev server and smoke-test main flows (chat, credentials, admin panel).
