# Quick Reference: Multi-Provider AI System

## 🚀 Quick Start (30 seconds)

### 1. Initialize Database
```powershell
cd backend
node scripts/initDatabase.js
node scripts/seedProviders.js
```

### 2. Add API Key
```powershell
# Option A: Environment variable (production)
$env:ANTHROPIC_API_KEY = "sk-ant-..."
node scripts/seedProviders.js

# Option B: Via API (user-facing apps)
curl -X PUT http://localhost:3001/api/providers/anthropic/config `
  -H "x-api-key: your-backend-key" `
  -H "Content-Type: application/json" `
  -d '{"api_key":"sk-ant-...","is_active":true}'
```

### 3. Test Chat
```powershell
curl -X POST http://localhost:3001/api/chat `
  -H "x-api-key: your-backend-key" `
  -H "Content-Type: application/json" `
  -d '{"messages":[{"role":"user","content":"Hello!"}],"provider":"anthropic"}'
```

## 📋 Common Tasks

### List Available Providers
```bash
GET /api/providers
# Returns: anthropic, openai with status and capabilities
```

### Get Model List
```bash
GET /api/providers/openai/models
# Returns: GPT-4o, GPT-4 Turbo, etc. with pricing
```

### Switch Models Mid-Conversation
```javascript
// Start with GPT-4o Mini (cheap)
POST /api/chat
{
  "conversationId": "conv-123",
  "provider": "openai",
  "model": "gpt-4o-mini",
  "messages": [...]
}

// Continue with Claude Opus (powerful)
POST /api/chat
{
  "conversationId": "conv-123",
  "provider": "anthropic",
  "model": "claude-3-opus-20240229",
  "messages": [...]
}
```

### View Conversation Costs
```javascript
const repo = require('./src/db/repositories/conversationRepo');
const stats = new repo().getStats('conv-123');
console.log(`Cost: $${stats.total_cost}`);
```

## 🔧 Provider Configuration

### Anthropic (Claude)
```javascript
PUT /api/providers/anthropic/config
{
  "api_key": "sk-ant-...",
  "default_model": "claude-3-5-sonnet-20241022",
  "is_active": true,
  "options": {
    "max_tokens": 4096,
    "temperature": 1.0
  }
}
```

**Best Models:**
- `claude-3-5-sonnet-20241022` - Latest, balanced (default)
- `claude-3-opus-20240229` - Most capable, expensive
- `claude-3-haiku-20240307` - Fastest, cheapest

### OpenAI (GPT)
```javascript
PUT /api/providers/openai/config
{
  "api_key": "sk-...",
  "default_model": "gpt-4o",
  "is_active": true,
  "options": {
    "temperature": 0.7
  }
}
```

**Best Models:**
- `gpt-4o` - Latest, balanced (default)
- `gpt-4o-mini` - Cheapest, fast
- `gpt-4-turbo` - Powerful, expensive

## 💰 Pricing Cheat Sheet

| Model | Input (per 1M tokens) | Output (per 1M tokens) |
|-------|----------------------|------------------------|
| GPT-4o Mini | $0.15 | $0.60 |
| Claude 3 Haiku | $0.25 | $1.25 |
| GPT-4o | $2.50 | $10.00 |
| Claude 3.5 Sonnet | $3.00 | $15.00 |
| GPT-4 Turbo | $10.00 | $30.00 |
| Claude 3 Opus | $15.00 | $75.00 |

**Cost Estimation:**
- 1,000 tokens ≈ 750 words
- Typical chat message: 50-200 tokens
- GPT-4o Mini: ~$0.0002 per message
- Claude 3.5 Sonnet: ~$0.0006 per message

## 🔍 Troubleshooting

### No active providers
```powershell
# Check status
node -e "const r = require('./src/db/repositories/providerConfigRepo'); console.log(new r().getAllProviders({provider_type:'ai'}))"

# Fix: Add API key (see Quick Start #2)
```

### Provider cached with old config
```powershell
# Clear cache
node -e "require('./src/services/providers/registry').clearAll()"
```

### Validate API key
```bash
POST /api/providers/anthropic/validate
{ "api_key": "sk-ant-..." }
# Returns: { "valid": true/false }
```

## 📊 Database Schema

```sql
-- Provider configs
SELECT provider_name, is_active, default_model 
FROM provider_configs 
WHERE provider_type = 'ai';

-- Conversation stats
SELECT 
  SUM(tokens) as total_tokens,
  SUM(cost) as total_cost
FROM messages 
WHERE conversation_id = 'conv-123';

-- Most expensive conversations
SELECT 
  c.title,
  SUM(m.cost) as total_cost
FROM conversations c
JOIN messages m ON c.id = m.conversation_id
GROUP BY c.id
ORDER BY total_cost DESC
LIMIT 10;
```

## 🛡️ Security Checklist

- ✅ API keys encrypted with AES-256-CBC in database
- ✅ Keys never returned in API responses
- ✅ All endpoints require `x-api-key` authentication
- ✅ Provider cache invalidated on config changes
- ✅ Separate backend auth key from provider keys

## 📚 API Endpoints Summary

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/providers` | GET | List all providers |
| `/api/providers/:name` | GET | Get provider details |
| `/api/providers/:name/models` | GET | Get supported models |
| `/api/providers/:name/validate` | POST | Test API key |
| `/api/providers/:name/config` | PUT | Update configuration |
| `/api/providers/:name/config` | DELETE | Remove API key |
| `/api/chat` | POST | Send message (multi-provider) |

## 🧪 Testing

```powershell
# Run full test suite
node scripts/testProviderSystem.js

# Quick validation
node scripts/testDatabase.js
```

## 📖 Full Documentation
- **Setup Guide:** `docs/MULTI_PROVIDER_GUIDE.md`
- **Implementation Details:** `docs/PHASE_2_COMPLETE.md`
- **Roadmap:** `ROADMAP.md`

---

**Status:** ✅ Phase 2 Complete - Multi-provider architecture operational
**Next:** Phase 3 - Professional UI with settings panel and model selector
