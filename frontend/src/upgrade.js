/**
 * Developer Control Panel Upgrade Roadmap
 * --------------------------------------
 * Canonical specification for delivering the next major release of the
 * AI Assistant desktop experience. Keep this file concise and machine-friendly
 * so other tooling can consume it without parsing prose documents.
 */

const roadmap = {
  version: '2025-12-01',
  owner: 'AI Assistant Core Team',
  summary:
    'Stabilize the backend, launch the AI-native Developer Control Panel, and unify Git, personas, and system telemetry under a secure automation layer.',
  objectives: [
    'Keep the backend alive and observable across local, web, and Electron builds.',
    'Ship a Futuristic-OS-ready Developer Control Panel window with AI + shell command parity.',
    'Expose controlled automation through a schema-driven tool registry and persona-aware policies.',
    'Modernize supporting panels (Search, Settings) so every feature feeds the CFE context loop.',
  ],
  prerequisites: {
    environment: [
      'Node.js 20.x, npm 10.x, and pnpm 9.x installed.',
      'backend/.env populated with provider keys and REQUIRE_API_KEY=false for dev.',
      'SQLite migrations passing via npm ci && npm test in backend/.',
    ],
    repos: [
      'AI-Assistant mono-repo checked out on main with clean git status.',
      'Duplicate workspaces removed so backend/, frontend/, docs/ are single sources of truth.',
    ],
  },
  phases: [
    {
      id: 'P0',
      name: 'Backend Stabilization',
      focus: 'Keep backend/src/server.js online and responding to /health.',
      tasks: [
        'Add structured startup/shutdown logs and ensure no hidden process.exit paths.',
        'Confirm database migrations complete once and keep SQLite handles open.',
        'Document nodemon vs node usage and provide a troubleshooting runbook in backend/README.md.',
      ],
      exitCriteria: [
        'Server runs >30 minutes locally without intervention.',
        '/health returns 200 OK in curl and Playwright smoke tests.',
        'npm test passes consistently.',
      ],
    },
    {
      id: 'P1',
      name: 'Tooling & Safety Foundation',
      focus: 'Introduce schema-driven tool execution guarded by persona policies.',
      tasks: [
        'Implement backend/services/tools registry with git.* and shell.exec handlers.',
        'Validate tool arguments via JSON schema and block dangerous commands.',
        'Expose orchestration APIs: /api/ai/terminal/plan, /api/ai/git/commit-message, /api/v1/personas, /api/system/info, /api/settings/*.',
      ],
      exitCriteria: [
        'Tool registry unit tests covering git + shell paths.',
        'Persona policy table persisted in SQLite.',
        'docs/TOOLS.md published with contract and examples.',
      ],
    },
    {
      id: 'P2',
      name: 'Developer Control Panel UI',
      focus: 'Deliver the window shell that hosts Terminal, Git, Agents, and System tabs.',
      tasks: [
        'Replace TerminalPanel with AI-aware version (shell/AI toggle, FitAddon, confirmation flow).',
        'Create frontend/windows/DeveloperControlPanelWindow.jsx wired into the window manager.',
        'Pipe uiState/CFE snapshots into the AI planner APIs.',
      ],
      exitCriteria: [
        'Terminal AI mode demo recorded.',
        'Keyboard navigation/accessibility verified for the entire window.',
        'Window registered with Futuristic OS layout manager.',
      ],
    },
    {
      id: 'P3',
      name: 'Git Workflow Integration',
      focus: 'Give the Git tab first-class stage/commit/pull/push capabilities.',
      tasks: [
        'Backend routes: /api/git/status|stage|unstage|commit|pull|push|branches|diff.',
        'GitPanel with multi-select staging, AI commit message button, and progress spinners.',
        'Repo discovery + permissions documented in docs/GIT.md.',
      ],
      exitCriteria: [
        'End-to-end commit completed from the UI.',
        'Automated tests mocking git CLI merged.',
        'User guide (docs/DEV_CONTROL_PANEL.md) updated with screenshots.',
      ],
    },
    {
      id: 'P4',
      name: 'Agents & System Awareness',
      focus: 'Make personas and system telemetry first-class citizens.',
      tasks: [
        'Agents tab consuming /api/v1/personas and allowing instant persona switches.',
        'Surface persona policies (allowed tools, confirmation requirements) in the UI.',
        'System tab reading /api/system/info with refresh + log/feature flag hooks.',
      ],
      exitCriteria: [
        'Persona switch latency <1s.',
        'System metrics cards (OS/CPU/Mem/Uptime) displayed and refreshed.',
        'Persona policy YAML stored in database and editable.',
      ],
    },
    {
      id: 'P5',
      name: 'Intelligent Search Upgrade',
      focus: 'Turn search into an agent-aware research console.',
      tasks: [
        'SearchPanel with provider selector, cached badge, and AI Answer CTA.',
        'Backend /api/search honors provider override; /api/search/ai-answer returns answer + sources.',
        'Push search snippets into agent memory queues for CFE context.',
      ],
      exitCriteria: [
        'Search latency telemetry (provider + cache) recorded.',
        'AI answers cite at least two sources.',
        'docs/SEARCH_PANEL.md created.',
      ],
    },
    {
      id: 'P6',
      name: 'Settings Center',
      focus: 'Centralize configuration management in-app.',
      tasks: [
        'Backend settings store with CRUD, import/export, reset, and orchestrator sync endpoints.',
        'Frontend panels: General, Providers, AI Behavior, Security.',
        'Broadcast theme/animation changes via CustomEvent so all windows update live.',
      ],
      exitCriteria: [
        'Settings persist across relaunch.',
        'Theme switch propagates instantly to active windows.',
        'Security panel toggles client-side encryption flag.',
      ],
    },
    {
      id: 'P7',
      name: 'QA & Integration',
      focus: 'Validate the stack and prep release collateral.',
      tasks: [
        'Run backend Jest suite and targeted git/tool tests.',
        'Smoke-test Vite dev server, Electron shell, and packaged builds.',
        'Update docs, record walkthroughs, and produce release checklist.',
      ],
      exitCriteria: [
        'QA sign-off report stored in docs/QA.md.',
        'Release notes drafted.',
        'Demo video covering control panel + AI workflows.',
      ],
    },
  ],
  crossCutting: {
    telemetry: [
      'Instrument backend routes with pino + OpenTelemetry exporters.',
      'Capture control panel UX events to feed adaptive layout logic.',
    ],
    security: [
      'Enforce API key auth on every new route.',
      'Block dangerous shell patterns and log all tool executions with persona IDs.',
    ],
    docs: [
      'Update backend/README.md and frontend/README.md per phase.',
      'Maintain CHANGELOG.md entries tied to roadmap phases.',
    ],
  },
  milestones: [
    { name: 'Backend stable & tool registry live', phase: 'P1', target: null },
    { name: 'Developer Control Panel alpha', phase: 'P3', target: null },
    { name: 'Full AI OS integration complete', phase: 'P5', target: null },
    { name: 'Release candidate build', phase: 'P7', target: null },
  ],
};

module.exports = roadmap;
