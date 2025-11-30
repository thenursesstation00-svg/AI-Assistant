# MASTER_AI_OS_SPEC.md

## 1. Purpose & Vision
We are building an AI-native operating system running on a futuristic, glass-morphism multi-window UI, where:
- The UI is a desktop: draggable, resizable windows, dock, status bar.
- The AI is the OS brain: context-aware, persona-shaped, and owner-bound.
- The system evolves into a personal, persistent, encrypted digital universe for the user.

Key properties:
- Context-aware: AI knows open windows, files, errors, history.
- Persona-aware: AI behavior is controlled by switchable, blendable personalities.
- Persistent: Workspaces, layouts, and memories persist across sessions/devices.
- Owner-bound: Memory is encrypted client-side and only readable with the owner’s key.
- Safe & audited: Actions constrained by policy, logged, reversible.

## 2. High-Level Architecture
### 2.1. Frontend (Futuristic UI)
- Framework: React.
- Visual theme: Neon cyberpunk, glass morphism, animated background.
- Core components:
  - FuturisticUI.jsx: container, dock, status bar, particle system.
  - WindowManager.jsx: custom hook implementing drag, resize, z-index, window state.
  - Window.jsx: window chrome (title bar, controls, resize handles).
  - Windows: ChatWindow.jsx, DevToolsWindow.jsx, FileExplorerWindow.jsx, AgentManagerWindow.jsx, TerminalWindow.jsx, SystemMonitorWindow.jsx, ReflectionWindow.jsx
  - Personality UI: PersonalitySwitcher.jsx, PersonaPreviewCard.jsx, TraitEditor.jsx
### 2.2. Edge / Core B
- Personality Orchestrator (FastAPI/Express):
  - Loads persona JSON definitions.
  - Manages active persona, blending, and metrics.
  - Composes persona + context-aware system prompts (/compose_prompt).
- Core B Command/Tool Layer:
  - LLM bridge.
  - Tool adapters (filesystem, terminal, git, etc.).
  - Sandbox execution.
- Context Fusion Engine (CFE):
  - Receives CFE snapshots from frontend.
  - Validates and optionally enriches context.
  - Passes summarized context to orchestrator.
### 2.3. Executive Core A (Cloud)
- Encrypted Intelligence Vault:
  - Stores owner-bound memory artifacts as ciphertext.
- Periodic consolidation jobs:
  - Merge small trait updates into stable preference vectors.
- Mother AI:
  - Aggregates population-level insights under differential privacy (optional / opt-in).

## 3. Frontend Components & Behavior
### 3.1. Futuristic Desktop UI
- Glass morphism windows with blur, neon borders, gradient shadows.
- Animated grid background, floating particles.
- Multi-window drag/resize with fps-friendly transforms.
- Dock with 8 app launchers (Chat, DevTools, Files, Agents, Terminal, System, Reflection, Settings [planned]).
- Status bar: time, system info (simulated or live later).
- Minimized tray and z-index management.
- Layout persistence across reloads and devices.
- Snapping and tiling for productivity.
- Global shortcuts (Ctrl+N, Ctrl+W, Ctrl+S, Ctrl+P).
- Touch/gesture support.
- VR/AR experimental mode.

### 3.2. WindowManager & CFE
- WindowManager maintains:
  - windows: list of window state objects.
  - activeWindowId: current focused window.
  - Drag/resize logic, mouse event handlers.
- CFE integrates:
  - buildCfeSnapshotFromWindowManager(uiState):
    - Takes window state, path, cursor, errors, system metrics.
    - Produces a compact CFE JSON.
- UI sends this snapshot:
  - Either per interaction (when Chat/Agents need context).
  - Or on an interval (1–3s heartbeat, optional).

### 3.3. ChatWindow: Persona + Context-Aware LLM
- User types a message.
- buildCfeSnapshotFromWindowManager(uiState) builds snapshot.
- requestSystemPrompt(cfe) POSTs to /compose_prompt.
- Orchestrator returns system_prompt + persona meta.
- ChatWindow calls LLM with [system_prompt, conversation, new_user_message].
- Response is rendered into chat.
- ChatWindow also displays typing indicator, attaches files, and will show persona info.

### 3.4. Personality UI
- PersonalitySwitcher: Fetches personas and active persona from orchestrator. Shows list with “Use” and “Blend” buttons. Toggles TraitEditor.
- PersonaPreviewCard: Displays persona name, description, trait values.
- TraitEditor: Raw JSON editing for personas (for dev/admin use). Calls /personality/create.
- User can switch persona instantly, blend between personas, and adjust traits through sliders.

## 4. Backend: Personality Orchestrator & CFE Service
### 4.1. Persona Model
- persona_id: unique ID.
- meta: name, description
- trait_vector: numeric list for similarity/embedding.
- style: formality, verbosity, positivity, humor, directness, empathy (0–1).
- prompt_template: string with {name}, {style}, {context_summary} placeholders.
- action_policy: allowed_actions, blocked_actions, confirmation_threshold (0–1)
- mirroring_profile_uri (optional for mirror personas).
- Starter personas (10): Guardian, Mentor, Playful, Stoic, Analyst, Therapist, Creative, Historian, Mirror, Silent Genius.

### 4.2. Orchestrator Responsibilities
- Load persona JSONs from data/personas/.
- Serve persona list (/personas).
- Switch active persona (/personality/switch).
- Create new persona (/personality/create).
- Serve active persona (/personality/active).
- Compose system prompt (/compose_prompt): Merge persona template + style + CFE summary. Return system_prompt plus persona meta.

### 4.3. Context Fusion Engine (CFE)
- Input: CFESnapshot from UI: active_window, open_windows, path, cursor, selected_text_snippet, terminal_errors, system_metrics, user_history, summary.
- Processing: Validation, sanity checks, optionally compute a more detailed summary, possibly call embeddings to detect patterns (later).
- Output: JSON consumed by the orchestrator to fill {context_summary}.

## 5. Memory, Encryption, and Learning
### 5.1. Owner-Bound Key (K_owner)
- Derived client-side using passphrase + salt (PBKDF2).
- Used only for AES-GCM encryption/decryption.
- Never sent to server.
- Can be stored in OS keychain/hardware-backed keystore.

### 5.2. Memory Artifacts
- Each memory artifact encodes intelligence, not raw data (e.g., “user prefers left-side editor”, “commonly used repos”).
- Serialized to JSON, then encrypted with K_owner using AES-GCM.
- Structure stored server-side:
  - id, owner_id, created_at, ciphertext, iv, salt, metadata, provenance_hash
- Server never sees plaintext, only stores opaque ciphertext.
- Client decrypts artifacts when needed, updates traits/behaviour and re-encrypts new values.

### 5.3. Learning Loop
- Implicit learning: Signals (accept suggestion, ignore, edit heavily, time-to-action), reward r ∈ [-1,1], trait update t <- clip(t + α·r, [0,1]).
- Explicit feedback: User rates suggestion 1–5, reward r = (rating - 3)/2, update trait vector as above.
- Consolidation: Periodically merge many small updates into stable preference vectors (client or HSM + secure enclave).

## 6. Workspace Persistence & Productivity
### 6.1. Window Layout Persistence
- Local: localStorage under futuristic_workspace_v1.
- Cloud (optional): encrypted workspace blob stored as ciphertext.
- Stored payload: workspace_id, windows, activeWindowId, dock, meta, lastSaved
- On startup: Load local workspace if present, optionally decrypt cloud workspace and merge.

### 6.2. Snapping & Tiling
- Snap windows to left/right/bottom/top edges when within threshold, optional grid spacing.
- Future: Double-drag edges to tile half/half, shortcut to arrange for “Coding Mode”, “Debug Mode”, etc.

## 7. Safety, Ethics, and Policy
### 7.1. Action Policy
- Each persona has an action_policy: allowed low-risk actions, blocked or high-risk, confirmation_threshold for risky actions.
### 7.2. Logging & Audit
- Append-only logs (hashed, timestamped), no plaintext private content in logs, each log entry: “Persona X suggested this action at time T because Y”.
### 7.3. Mirroring & Impersonation
- Mirroring available only with explicit user consent, explanation of data sources used, disclaimers for public figures, personal mirroring data remains encrypted and owner-controlled.
### 7.4. Kill Switch & Local Mode
- User can disable internet access for AI (local-only), disable mirroring features, reset persona learning and memory state.

## 8. Roadmap & Phasing (A + B + C)
- Phase A: AI Awareness (CFE snapshots, /compose_prompt wiring, intent predictor, context-informed suggestions)
- Phase B: Workspace Persistence & UX Polish (layout persistence, snapping & tiling, shortcuts, system monitor)
- Phase C: Owner-Bound Memory & Learning (K_owner derivation, memory encryption, feedback UI, mirroring sandbox)

## 9. Success Criteria
- Persona-aware prompts: Chat responds differently for Guardian vs Playful in ≥80% test runs.
- Context-aware behavior: Errors in Terminal, active file path, and window context are visible in prompts and influence suggestions.
- Layout persistence: Windows & layout are restored after reload within 1s.
- Snapping & shortcuts: Users can rearrange windows efficiently with your chosen shortcuts and snaps.
- Owner-bound memory: Memory artifacts are encrypted client-side; server never sees plaintext.
- Learning: Persona style subtly shifts after multiple feedback events and stays stable after reload.
- Safety: High-risk actions always require explicit confirmation; no unauthorized actions possible in tests.
- Telemetry & Monitoring: Latency, trait updates, and blocked actions are visible in dashboards.
