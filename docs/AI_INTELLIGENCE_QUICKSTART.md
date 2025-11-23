# AI Intelligence System - Quick Reference

## 🚀 Quick Start

```bash
# Backend already has all modules installed
# Routes are mounted at /api/ai/*

# Test the system
curl -H "x-api-key: YOUR_KEY" http://localhost:3001/api/ai/self-knowledge
```

## 📚 API Endpoints Cheat Sheet

### Self-Awareness

```bash
# Get AI identity and self-knowledge
GET /api/ai/self-knowledge

# Store a memory
POST /api/ai/memory
{
  "type": "interaction",
  "content": {"user_message": "Hello"},
  "metadata": {"importance": 8, "tags": ["greeting"]}
}

# Recall memories
GET /api/ai/memory?type=interaction&limit=10

# Trigger reflection
POST /api/ai/reflect
{"topic": "recent_learnings"}

# Get personality
GET /api/ai/personality
```

### Autonomous Learning

```bash
# Learn a concept
POST /api/ai/learn/concept
{
  "name": "react_hooks",
  "description": "React Hooks for state",
  "confidence": 0.8
}

# Acquire a skill
POST /api/ai/learn/skill
{
  "name": "web_scraping",
  "category": "data_extraction",
  "proficiency": 70
}

# Learn from interaction
POST /api/ai/learn/interaction
{
  "type": "conversation",
  "content": "User taught me about Docker",
  "success": true
}

# Self-teach
POST /api/ai/learn/self-teach
{"topic": "kubernetes", "timeLimit": 300000}

# Get analytics
GET /api/ai/learn/analytics
```

### Agent Factory

```bash
# Build agent
POST /api/ai/agents/build
{
  "purpose": "Monitor GitHub issues",
  "capabilities": ["api_calls"],
  "deployment_target": "webhook"
}

# Deploy agent
POST /api/ai/agents/{agentId}/deploy
{"target": "local", "config": {}}

# Execute agent
POST /api/ai/agents/{agentId}/execute
{"task": "check_status", "input": {"repo": "owner/repo"}}

# List agents
GET /api/ai/agents?status=active

# Agent analytics
GET /api/ai/agents/{agentId}/analytics
```

### Goal System

```bash
# AI creates goal
POST /api/ai/goals/ai
{
  "title": "Improve code quality",
  "description": "Learn better patterns",
  "reasoning": "Have enough code examples",
  "priority": 8
}

# User creates goal
POST /api/ai/goals/user
{
  "title": "Learn Python",
  "description": "Master Python basics",
  "priority": 9,
  "target_date": "2024-12-31"
}

# Update task
PATCH /api/ai/goals/tasks/{taskId}
{"status": "completed", "notes": "Done!"}

# Get active goals
GET /api/ai/goals/active?created_by=user

# Goal details
GET /api/ai/goals/{goalId}

# Get AI suggestions
GET /api/ai/goals/suggestions
```

### Integration Framework

```bash
# Connect to app
POST /api/ai/integrations/connect
{
  "app_name": "GitHub",
  "app_type": "development",
  "connection_type": "api",
  "credentials": {"api_key": "ghp_token"}
}

# Execute action
POST /api/ai/integrations/{integrationId}/execute
{
  "action_type": "create_issue",
  "params": {
    "owner": "user",
    "repo": "repo",
    "title": "Bug",
    "body": "Description"
  }
}

# Create webhook
POST /api/ai/integrations/webhooks
{
  "integration_id": "int_123",
  "events": ["issues"],
  "callback_url": "http://yourserver/webhook"
}

# List integrations
GET /api/ai/integrations?status=active

# Integration details
GET /api/ai/integrations/{integrationId}
```

## 🗄️ Database Tables

| Component | Tables | Purpose |
|-----------|--------|---------|
| Self-Awareness | `ai_memory`, `ai_reflections`, `ai_skills`, `ai_personality`, `ai_concepts` | Memory, reflection, personality tracking |
| Autonomous Learning | `knowledge_graph`, `knowledge_edges`, `learning_sessions` | Concept learning, knowledge graph |
| Agent Factory | `ai_agents`, `agent_templates`, `agent_executions`, `agent_deployments` | Agent creation and deployment |
| Goal System | `ai_goals`, `goal_tasks`, `goal_progress`, `goal_reflections` | Goal tracking, task breakdown |
| Integration Framework | `app_integrations`, `integration_actions`, `integration_logs`, `webhooks` | App connections |

## 💡 Common Workflows

### 1. Learning from User Interaction

```javascript
// After user message
await fetch('/api/ai/memory', {
  method: 'POST',
  body: JSON.stringify({
    type: 'interaction',
    content: {user: userMessage, ai: aiResponse},
    metadata: {importance: 7}
  })
});

await fetch('/api/ai/learn/interaction', {
  method: 'POST',
  body: JSON.stringify({
    type: 'conversation',
    content: userMessage,
    success: true
  })
});
```

### 2. Build and Deploy Agent

```javascript
// Build
const agent = await fetch('/api/ai/agents/build', {
  method: 'POST',
  body: JSON.stringify({
    purpose: 'Monitor server health',
    capabilities: ['system_monitoring']
  })
});

// Deploy
await fetch(`/api/ai/agents/${agent.agent_id}/deploy`, {
  method: 'POST',
  body: JSON.stringify({target: 'local'})
});
```

### 3. Set Goal and Track Progress

```javascript
// Create goal
const goal = await fetch('/api/ai/goals/user', {
  method: 'POST',
  body: JSON.stringify({
    title: 'Learn React',
    description: 'Master React fundamentals',
    priority: 9
  })
});

// AI automatically creates tasks
// Update task when complete
await fetch(`/api/ai/goals/tasks/${taskId}`, {
  method: 'PATCH',
  body: JSON.stringify({status: 'completed'})
});
```

### 4. Connect to External App

```javascript
// Connect
const integration = await fetch('/api/ai/integrations/connect', {
  method: 'POST',
  body: JSON.stringify({
    app_name: 'Slack',
    app_type: 'communication',
    connection_type: 'webhook',
    credentials: {webhook_url: 'https://hooks.slack.com/...'}
  })
});

// Use integration
await fetch(`/api/ai/integrations/${integration.integration_id}/execute`, {
  method: 'POST',
  body: JSON.stringify({
    action_type: 'send_message',
    params: {text: 'Hello!', channel: '#general'}
  })
});
```

## 🔧 Configuration

### Enable AI Intelligence Routes

Already enabled in `backend/src/server.js`:

```javascript
const aiIntelligenceRoutes = require('./routes/aiIntelligence');
app.use('/api/ai', requireAPIKey, aiIntelligenceRoutes);
```

### Environment Variables

No additional environment variables needed. Uses existing:
- `BACKEND_API_KEY` - API authentication
- Database path from existing config

## 🧪 Testing

```bash
# Test self-awareness
curl -H "x-api-key: YOUR_KEY" \
  http://localhost:3001/api/ai/self-knowledge

# Test learning
curl -X POST -H "x-api-key: YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name":"test_concept","description":"Testing","confidence":0.8}' \
  http://localhost:3001/api/ai/learn/concept

# Test goals
curl -X POST -H "x-api-key: YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Goal","description":"Test","priority":5}' \
  http://localhost:3001/api/ai/goals/user

# Test agents
curl -X POST -H "x-api-key: YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"purpose":"Test Agent","capabilities":["api_calls"]}' \
  http://localhost:3001/api/ai/agents/build
```

## 📊 Monitoring

Key metrics to track:

```javascript
// Learning rate
GET /api/ai/learn/analytics
// → total_concepts, avg_confidence, learning_rate

// Agent performance
GET /api/ai/agents/{agentId}/analytics
// → success_rate, avg_execution_time

// Goal progress
GET /api/ai/goals/active
// → progress percentage, completion rate

// Integration health
GET /api/ai/integrations
// → active_integrations, last_sync times
```

## 🎯 Built-in Agent Templates

1. **Task Automation** - Repetitive task handling
2. **Code Assistant** - Coding help
3. **Data Processor** - Data analysis
4. **Integration Bot** - App connector
5. **System Monitor** - Health monitoring
6. **Personal Assistant** - Conversation agent

## 🔗 Pre-configured Integrations

- GitHub (repos, issues, PRs)
- Gmail (email operations)
- Slack (messaging)
- Google Calendar (events)
- Notion (pages, databases)
- Trello (boards, cards)
- Discord (messaging)
- Zapier (automation)

## 🚨 Common Issues

**Issue**: "Agent not found"
**Fix**: Deploy agent before executing

**Issue**: "Integration failed"
**Fix**: Check credentials and connection type

**Issue**: "Goal not updating"
**Fix**: Tasks must be marked complete individually

**Issue**: "Learning session timeout"
**Fix**: Increase timeLimit parameter

## 📖 Full Documentation

See `/workspaces/AI-Assistant/docs/AI_INTELLIGENCE_GUIDE.md` for:
- Detailed API documentation
- Frontend integration examples
- Advanced workflows
- Security considerations
- Performance optimization

## 🎓 Next Steps

1. Test endpoints with curl/Postman
2. Build frontend UI components
3. Create first agent for automation
4. Set up integrations with your apps
5. Define goals and let AI help achieve them

---

**Happy building with autonomous AI! 🤖✨**
