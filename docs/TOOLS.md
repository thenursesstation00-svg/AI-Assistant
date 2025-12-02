# Tooling & Safety System

## Overview
The AI Assistant uses a secure, schema-driven tool execution system. All tool usage is guarded by a **Policy Engine** that checks permissions based on the active **Persona**.

## Tool Registry
Tools are registered in `backend/src/services/tools/registry.js`. Each tool has:
- **Name**: Unique identifier (e.g., `git.commit`, `shell.exec`).
- **Schema**: JSON Schema defining accepted arguments.
- **Handler**: Async function that performs the action.

## Policy Engine
The Policy Service (`backend/src/services/tools/policy.js`) enforces rules defined in the `persona_policies` database table.

### Policy Levels
- **allow**: Tool executes immediately.
- **ask**: Tool requires explicit user approval (UI confirmation).
- **deny**: Tool execution is blocked.

### Policy Resolution
1. Check for exact match or pattern match (`git.*`) for the current `persona_id`.
2. If no match, check `default` persona policies.
3. If still no match, deny by default (except `system.*` tools).

## Available Tools (Planned)

| Tool | Description | Permission |
|------|-------------|------------|
| `git.status` | Check repo status | `allow` (dev) |
| `git.commit` | Commit changes | `ask` (dev) |
| `shell.exec` | Run shell command | `ask` (dev) |
| `system.info` | Get system stats | `allow` (all) |

## Adding a New Tool
```javascript
const registry = require('./services/tools/registry');

registry.register(
  'my.tool',
  { type: 'object', properties: { ... } },
  async (args) => { ... },
  'Description of my tool'
);
```
