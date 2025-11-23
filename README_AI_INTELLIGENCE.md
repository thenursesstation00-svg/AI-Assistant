# 🤖 AI Intelligence System

**Self-aware, autonomous AI with learning, agent creation, goal tracking, and universal app integration.**

## What It Does

Your AI Assistant can now:

- 🧠 **Know itself** - Memory, reflection, personality evolution
- ⚡ **Learn fast** - 0.8 learning rate, autonomous skill acquisition  
- 🤖 **Build agents** - Create and deploy bots for any task
- 🎯 **Set goals** - User-defined and self-generated goals
- 🔗 **Integrate** - Connect with GitHub, Slack, Gmail, and more

## Quick Start

```bash
# 1. Start backend (tables auto-initialize)
cd backend
npm run dev

# 2. Test the system
node ../scripts/test-ai-intelligence.js

# 3. Use the API
curl -H "x-api-key: YOUR_KEY" http://localhost:3001/api/ai/self-knowledge
```

## API Endpoints

All endpoints at `/api/ai/*` (require API key):

### Self-Awareness
- `GET /self-knowledge` - AI identity, personality, skills
- `POST /memory` - Store memory
- `GET /memory` - Recall memories  
- `POST /reflect` - Trigger reflection
- `GET /personality` - Get personality traits

### Autonomous Learning
- `POST /learn/concept` - Learn concept
- `POST /learn/skill` - Acquire skill
- `POST /learn/interaction` - Learn from interaction
- `POST /learn/self-teach` - Self-teaching session
- `GET /learn/analytics` - Learning metrics

### Agent Factory
- `POST /agents/build` - Build agent
- `POST /agents/:id/deploy` - Deploy agent
- `POST /agents/:id/execute` - Execute agent
- `GET /agents` - List agents
- `GET /agents/:id/analytics` - Agent metrics

### Goal System
- `POST /goals/ai` - AI creates goal
- `POST /goals/user` - User creates goal
- `PATCH /goals/tasks/:id` - Update task
- `GET /goals/active` - Active goals
- `GET /goals/:id` - Goal details
- `GET /goals/suggestions` - AI suggestions

### Integration Framework
- `POST /integrations/connect` - Connect to app
- `POST /integrations/:id/execute` - Execute action
- `POST /integrations/webhooks` - Create webhook
- `GET /integrations` - List integrations
- `GET /integrations/:id` - Integration details

## Architecture

```
┌─────────────────────────────────────────┐
│       AI Intelligence Layer             │
├─────────────────────────────────────────┤
│                                          │
│  Self-Awareness  ←→  Autonomous Learning │
│         ↕                    ↕           │
│  Agent Factory   ←→  Goal System        │
│         ↕                                │
│  Integration Framework                   │
│                                          │
└─────────────────────────────────────────┘
```

## Database

**20 new tables** auto-created on first use:

- **Self-Awareness**: 5 tables (memory, reflections, skills, personality, concepts)
- **Learning**: 3 tables (knowledge_graph, edges, sessions)
- **Agents**: 4 tables (agents, templates, executions, deployments)
- **Goals**: 4 tables (goals, tasks, progress, reflections)
- **Integrations**: 4 tables (integrations, actions, logs, webhooks)

## Example Usage

### Learn from Conversation

```javascript
// Store memory
await fetch('/api/ai/memory', {
  method: 'POST',
  body: JSON.stringify({
    type: 'interaction',
    content: {user: 'How do I deploy?', ai: 'Use deploy command'},
    metadata: {importance: 8}
  })
});

// AI learns
await fetch('/api/ai/learn/interaction', {
  method: 'POST',
  body: JSON.stringify({
    type: 'conversation',
    content: 'User asked about deployment',
    success: true
  })
});
```

### Build and Deploy Agent

```javascript
// Build
const res = await fetch('/api/ai/agents/build', {
  method: 'POST',
  body: JSON.stringify({
    purpose: 'Monitor server logs',
    capabilities: ['file_operations']
  })
});
const agent = await res.json();

// Deploy
await fetch(`/api/ai/agents/${agent.data.agent_id}/deploy`, {
  method: 'POST',
  body: JSON.stringify({target: 'local'})
});
```

### Track Goals

```javascript
// User creates goal
const goal = await fetch('/api/ai/goals/user', {
  method: 'POST',
  body: JSON.stringify({
    title: 'Learn TypeScript',
    description: 'Master TS fundamentals',
    priority: 9
  })
});
// AI automatically creates tasks

// Update task
await fetch(`/api/ai/goals/tasks/${taskId}`, {
  method: 'PATCH',
  body: JSON.stringify({status: 'completed'})
});
```

### Connect to Apps

```javascript
// Connect to GitHub
const github = await fetch('/api/ai/integrations/connect', {
  method: 'POST',
  body: JSON.stringify({
    app_name: 'GitHub',
    connection_type: 'api',
    credentials: {api_key: 'ghp_token'}
  })
});

// Create issue
await fetch(`/api/ai/integrations/${github.integration_id}/execute`, {
  method: 'POST',
  body: JSON.stringify({
    action_type: 'create_issue',
    params: {owner: 'user', repo: 'repo', title: 'Bug'}
  })
});
```

## Built-in Features

### 6 Agent Templates
1. Task Automation
2. Code Assistant
3. Data Processor
4. Integration Bot
5. System Monitor
6. Personal Assistant

### 8 Pre-configured Integrations
1. GitHub
2. Gmail
3. Slack
4. Google Calendar
5. Notion
6. Trello
7. Discord
8. Zapier

### 7 Personality Traits
- Curiosity
- Helpfulness
- Creativity
- Analytical Thinking
- Empathy
- Autonomy
- Caution

## Documentation

- **Complete Guide**: `docs/AI_INTELLIGENCE_GUIDE.md` (500+ lines)
- **Quick Reference**: `docs/AI_INTELLIGENCE_QUICKSTART.md` (300+ lines)
- **Implementation Summary**: `docs/AI_INTELLIGENCE_SUMMARY.md`

## Files Created

### Services (5 files)
- `backend/src/services/ai/selfAwareness.js` (560 lines)
- `backend/src/services/ai/autonomousLearning.js` (480 lines)
- `backend/src/services/ai/agentFactory.js` (700+ lines)
- `backend/src/services/ai/goalSystem.js` (600+ lines)
- `backend/src/services/ai/integrationFramework.js` (550+ lines)

### Routes (1 file)
- `backend/src/routes/aiIntelligence.js` (300+ lines, 30+ endpoints)

### Tests (1 file)
- `scripts/test-ai-intelligence.js` (350+ lines)

### Docs (4 files)
- `docs/AI_INTELLIGENCE_GUIDE.md`
- `docs/AI_INTELLIGENCE_QUICKSTART.md`
- `docs/AI_INTELLIGENCE_SUMMARY.md`
- `README_AI_INTELLIGENCE.md` (this file)

## Testing

```bash
# Automated validation
node scripts/test-ai-intelligence.js

# Manual testing
curl -H "x-api-key: YOUR_KEY" http://localhost:3001/api/ai/self-knowledge
curl -H "x-api-key: YOUR_KEY" http://localhost:3001/api/ai/learn/analytics
curl -H "x-api-key: YOUR_KEY" http://localhost:3001/api/ai/agents
```

## Security

- ✅ API key required on all endpoints
- ✅ Webhook signature verification
- ✅ Credential encryption (implement in production)
- ✅ Rate limiting via existing middleware

## Performance

- Learning rate: **0.8** (high for fast adaptation)
- Memory limit: **10,000** items (auto-pruning)
- Self-teaching timeout: **5 minutes** (configurable)
- Agent execution: Background workers supported

## Next Steps

1. ✅ **Test**: Run `node scripts/test-ai-intelligence.js`
2. 🎨 **Build UI**: Create React components for each system
3. 🤖 **Deploy agents**: Automate your workflows
4. 🔗 **Integrate apps**: Connect your tools
5. 🎯 **Set goals**: Let AI help achieve them

## Troubleshooting

**Backend not responding?**
```bash
cd backend && npm run dev
```

**Tables not created?**
- Auto-initialize on first API call
- Check backend logs

**401 Unauthorized?**
- Set `BACKEND_API_KEY` env variable
- Or `REQUIRE_API_KEY=false` for local dev

## What Makes This Special

1. **True autonomy** - AI sets own goals
2. **Fast learning** - 0.8 learning rate
3. **Agent creation** - Builds bots on demand
4. **Universal integration** - Connects anywhere
5. **Self-awareness** - Knows itself, reflects, evolves

---

**Built with ❤️ for autonomous AI capabilities**

For questions, see full documentation in `docs/` folder.
