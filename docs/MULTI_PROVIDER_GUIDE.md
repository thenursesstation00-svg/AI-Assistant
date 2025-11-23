# Multi-Provider AI System - Complete Guide

## Overview
Phase 2 implementation adds a flexible provider abstraction layer that supports multiple AI services (Anthropic Claude, OpenAI GPT, etc.) with a unified interface.

## Architecture

### Core Components

```
backend/src/
├── services/providers/
│   ├── base.provider.js      # Abstract interface all providers implement
│   ├── anthropic.provider.js # Claude 3.5 Sonnet, Opus, Haiku
│   ├── openai.provider.js    # GPT-4o, GPT-4 Turbo, GPT-3.5
│   └── registry.js           # Singleton provider factory/cache manager
├── routes/
│   ├── providers.js          # Provider management API
│   └── chat.js               # Enhanced with multi-provider support
└── db/repositories/
    ├── providerConfigRepo.js # Encrypted provider config storage
    └── conversationRepo.js   # Chat history with cost tracking
```

### Database Schema
**provider_configs** table stores:
- `provider_name` (primary key): anthropic, openai, google
- `display_name`: Human-readable name
- `provider_type`: 'ai' or 'web_search'
- `api_key`: Encrypted with AES-256-CBC
- `api_endpoint`: Custom endpoint (optional)
- `default_model`: Model to use if not specified
- `is_active`: Whether provider is enabled
- `options`: JSON configuration object

## API Endpoints

### 1. List All Providers
```bash
GET /api/providers?active_only=true
Headers:
  x-api-key: your-backend-api-key

Response:
{
  "success": true,
  "providers": [
    {
      "provider_name": "anthropic",
      "display_name": "Anthropic Claude",
      "provider_type": "ai",
      "is_active": true,
      "default_model": "claude-3-5-sonnet-20241022",
      "has_api_key": true,
      "api_endpoint": null,
      "options": { "max_tokens": 4096 }
    }
  ],
  "available_types": ["anthropic", "openai"]
}
```

### 2. Get Provider Details
```bash
GET /api/providers/anthropic
Headers:
  x-api-key: your-backend-api-key

Response:
{
  "success": true,
  "provider": {
    "provider_name": "anthropic",
    "display_name": "Anthropic Claude",
    "is_active": true,
    "default_model": "claude-3-5-sonnet-20241022",
    "has_api_key": true
  }
}
```

### 3. Get Supported Models
```bash
GET /api/providers/openai/models
Headers:
  x-api-key: your-backend-api-key

Response:
{
  "success": true,
  "provider": "openai",
  "models": [
    {
      "id": "gpt-4o",
      "name": "GPT-4o (Latest)",
      "context_window": 128000,
      "cost_per_1k_tokens": {
        "input": 0.0025,
        "output": 0.010
      },
      "capabilities": ["text", "vision", "tool_use"]
    }
  ]
}
```

### 4. Validate API Key
```bash
POST /api/providers/openai/validate
Headers:
  x-api-key: your-backend-api-key
  Content-Type: application/json

Body:
{
  "api_key": "sk-..."
}

Response:
{
  "success": true,
  "valid": true,
  "provider": "openai"
}
```

### 5. Update Provider Configuration
```bash
PUT /api/providers/anthropic/config
Headers:
  x-api-key: your-backend-api-key
  Content-Type: application/json

Body:
{
  "api_key": "sk-ant-...",
  "default_model": "claude-3-opus-20240229",
  "is_active": true,
  "options": {
    "temperature": 0.7,
    "max_tokens": 8192
  }
}

Response:
{
  "success": true,
  "message": "Provider 'anthropic' updated successfully",
  "provider": {
    "provider_name": "anthropic",
    "is_active": true,
    "default_model": "claude-3-opus-20240229",
    "has_api_key": true
  }
}
```

### 6. Remove Provider Configuration
```bash
DELETE /api/providers/openai/config
Headers:
  x-api-key: your-backend-api-key

Response:
{
  "success": true,
  "message": "Provider 'openai' API key removed and provider deactivated"
}
```

### 7. Enhanced Chat Endpoint
```bash
POST /api/chat
Headers:
  x-api-key: your-backend-api-key
  Content-Type: application/json

Body:
{
  "messages": [
    { "role": "user", "content": "What is 2+2?" }
  ],
  "provider": "openai",        // Optional: defaults to first active
  "model": "gpt-4o-mini",       // Optional: uses provider default
  "conversationId": "conv-123", // Optional: for persistence
  "temperature": 0.7,           // Optional: 0-2
  "max_tokens": 1000            // Optional
}

Response:
{
  "content": "2+2 equals 4.",
  "usage": {
    "prompt_tokens": 12,
    "completion_tokens": 8,
    "total_tokens": 20
  },
  "model": "gpt-4o-mini",
  "cost": 0.000002,
  "provider": "openai",
  "conversationId": "conv-123"
}
```

## Setup Instructions

### 1. Initial Database Setup (One-time)
```powershell
cd backend
node scripts/initDatabase.js
node scripts/seedProviders.js
```

### 2. Configure API Keys

#### Option A: Environment Variables (Recommended for Production)
```powershell
# Set in your deployment environment
$env:ANTHROPIC_API_KEY = "sk-ant-..."
$env:OPENAI_API_KEY = "sk-..."

# Re-seed to activate providers
node scripts/seedProviders.js
```

#### Option B: Via API (Recommended for User-Facing Apps)
```powershell
# Add Anthropic key
curl -X PUT http://localhost:3001/api/providers/anthropic/config `
  -H "x-api-key: your-backend-key" `
  -H "Content-Type: application/json" `
  -d '{"api_key":"sk-ant-...","is_active":true}'

# Add OpenAI key
curl -X PUT http://localhost:3001/api/providers/openai/config `
  -H "x-api-key: your-backend-key" `
  -H "Content-Type: application/json" `
  -d '{"api_key":"sk-...","is_active":true}'
```

### 3. Test the System
```powershell
# Run automated tests
node scripts/testProviderSystem.js

# Test chat with Anthropic
curl -X POST http://localhost:3001/api/chat `
  -H "x-api-key: your-backend-key" `
  -H "Content-Type: application/json" `
  -d '{"messages":[{"role":"user","content":"Hello"}],"provider":"anthropic"}'

# Test chat with OpenAI
curl -X POST http://localhost:3001/api/chat `
  -H "x-api-key: your-backend-key" `
  -H "Content-Type: application/json" `
  -d '{"messages":[{"role":"user","content":"Hello"}],"provider":"openai"}'
```

## Provider Implementations

### Anthropic Provider
**Models Supported:**
- `claude-3-5-sonnet-20241022` (Latest, default)
- `claude-3-5-sonnet-20240620`
- `claude-3-opus-20240229` (Most capable)
- `claude-3-sonnet-20240229`
- `claude-3-haiku-20240307` (Fastest, cheapest)

**Pricing (per 1M tokens):**
- Claude 3.5 Sonnet: $3 input / $15 output
- Claude 3 Opus: $15 input / $75 output
- Claude 3 Haiku: $0.25 input / $1.25 output

**Capabilities:**
- Text generation
- Vision (analyze images)
- Tool use (function calling)
- 200K context window

### OpenAI Provider
**Models Supported:**
- `gpt-4o` (Latest, default)
- `gpt-4o-mini` (Cheapest)
- `gpt-4-turbo`
- `gpt-4`
- `gpt-3.5-turbo`

**Pricing (per 1M tokens):**
- GPT-4o: $2.50 input / $10 output
- GPT-4o Mini: $0.15 input / $0.60 output
- GPT-4 Turbo: $10 input / $30 output
- GPT-3.5 Turbo: $0.50 input / $1.50 output

**Capabilities:**
- Text generation
- Vision (GPT-4o, GPT-4 Turbo)
- Tool use (function calling)
- Up to 128K context window

## Adding New Providers

### 1. Create Provider Class
```javascript
// backend/src/services/providers/google.provider.js
const { GoogleGenerativeAI } = require('@google/generative-ai');
const BaseAIProvider = require('./base.provider');

class GoogleAIProvider extends BaseAIProvider {
  constructor(config) {
    super(config);
    this.client = new GoogleGenerativeAI(this.apiKey);
  }
  
  async sendMessage(messages, options = {}) {
    const model = this.client.getGenerativeModel({ 
      model: options.model || this.defaultModel || 'gemini-pro' 
    });
    
    const result = await model.generateContent(messages[messages.length - 1].content);
    const response = await result.response;
    
    return this.normalizeResponse(response);
  }
  
  normalizeResponse(response) {
    return {
      content: response.text(),
      usage: {
        prompt_tokens: 0, // Google doesn't provide this
        completion_tokens: 0,
        total_tokens: 0,
      },
      model: 'gemini-pro',
      cost: 0,
    };
  }
  
  async validateConfig() {
    try {
      const model = this.client.getGenerativeModel({ model: 'gemini-pro' });
      await model.generateContent('test');
      return true;
    } catch {
      return false;
    }
  }
  
  async getSupportedModels() {
    return [
      {
        id: 'gemini-pro',
        name: 'Gemini Pro',
        context_window: 30720,
        cost_per_1k_tokens: { input: 0.0005, output: 0.0015 },
        capabilities: ['text'],
      },
    ];
  }
}

module.exports = GoogleAIProvider;
```

### 2. Register in Provider Registry
```javascript
// backend/src/services/providers/registry.js
const GoogleAIProvider = require('./google.provider');

this.providerClasses = {
  anthropic: AnthropicProvider,
  openai: OpenAIProvider,
  google: GoogleAIProvider, // Add this
};
```

### 3. Seed Database Configuration
```javascript
// backend/scripts/seedProviders.js
configRepo.saveProviderConfig({
  provider_name: 'google',
  display_name: 'Google AI (Gemini)',
  provider_type: 'ai',
  default_model: 'gemini-pro',
  api_key: process.env.GOOGLE_AI_KEY || null,
  is_active: !!process.env.GOOGLE_AI_KEY,
});
```

### 4. Install Dependencies
```powershell
npm install @google/generative-ai
```

## Cost Tracking
All chat messages are automatically tracked when `conversationId` is provided:

```sql
-- Get conversation statistics
SELECT 
  SUM(tokens) as total_tokens,
  SUM(cost) as total_cost,
  COUNT(*) as message_count
FROM messages 
WHERE conversation_id = 'conv-123';
```

Query via API:
```javascript
const conversationRepo = new ConversationRepository();
const stats = conversationRepo.getStats('conv-123');
// { total_tokens: 1500, total_cost: 0.0045, message_count: 6 }
```

## Security Considerations

1. **API Key Encryption**: All provider API keys are encrypted with AES-256-CBC before storage
2. **No Keys in Responses**: API endpoints never return API keys (only `has_api_key: boolean`)
3. **Backend Auth Required**: All provider endpoints require `x-api-key` header
4. **Environment Variables**: Prefer env vars for production deployments (no keys in database)
5. **Cache Invalidation**: Provider cache is cleared after config changes to prevent stale credentials

## Troubleshooting

### "Provider not found in database"
```powershell
# Run seed script to initialize providers
node scripts/seedProviders.js
```

### "Provider is inactive"
```powershell
# Activate via API
curl -X PUT http://localhost:3001/api/providers/anthropic/config `
  -H "x-api-key: your-backend-key" `
  -H "Content-Type: application/json" `
  -d '{"is_active":true}'

# Or set environment variable and re-seed
$env:ANTHROPIC_API_KEY = "sk-ant-..."
node scripts/seedProviders.js
```

### "No active AI providers configured"
```powershell
# Check provider status
node -e "const repo = require('./src/db/repositories/providerConfigRepo'); const r = new repo(); console.log(r.getAllProviders({provider_type:'ai'}))"

# Configure at least one provider (see Setup Instructions above)
```

### Provider returns unexpected errors
```powershell
# Clear provider cache to force reload
node -e "const registry = require('./src/services/providers/registry'); registry.clearAll(); console.log('Cache cleared')"

# Validate API key
curl -X POST http://localhost:3001/api/providers/anthropic/validate `
  -H "x-api-key: your-backend-key" `
  -H "Content-Type: application/json" `
  -d '{"api_key":"sk-ant-..."}'
```

## Next Steps (Phase 3)
- **Frontend Integration**: Settings UI for API key management
- **Model Selector**: Dropdown to choose provider and model
- **Streaming Support**: Real-time responses using `streamMessage()`
- **Conversation Management**: UI to view chat history and costs
- **Web Search Integration**: Connect SerpAPI/Google CSE providers to chat

## Files Modified/Created
```
backend/
├── src/
│   ├── services/providers/
│   │   ├── base.provider.js          (NEW - Abstract interface)
│   │   ├── anthropic.provider.js     (NEW - Claude implementation)
│   │   ├── openai.provider.js        (NEW - GPT implementation)
│   │   └── registry.js               (NEW - Provider factory)
│   ├── routes/
│   │   ├── providers.js              (NEW - Provider management API)
│   │   └── chat.js                   (MODIFIED - Multi-provider support)
│   └── server.js                     (MODIFIED - Mount providers route)
└── scripts/
    └── testProviderSystem.js         (NEW - Integration tests)
```
