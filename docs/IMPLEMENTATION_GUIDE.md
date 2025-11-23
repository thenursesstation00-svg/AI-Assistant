# Implementation Guide: Phase 1 → Phase 2 Transition

**Current Status:** Phase 1 Critical Fixes - 80% Complete  
**Next Step:** Complete SQLite setup, then begin multi-provider architecture

---

## Immediate Next Steps (This Week)

### 1. Complete SQLite Database Setup

#### Install Dependencies
```bash
cd backend
npm install better-sqlite3
```

#### Create Database Schema
Create `backend/src/db/schema.sql`:

```sql
-- Provider configurations
CREATE TABLE provider_configs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  provider_name TEXT NOT NULL UNIQUE,
  display_name TEXT,
  provider_type TEXT NOT NULL CHECK(provider_type IN ('ai', 'web_search')),
  api_key_encrypted TEXT,
  api_endpoint TEXT,
  default_model TEXT,
  options TEXT, -- JSON string
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Conversations (replaces in-memory state)
CREATE TABLE conversations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT,
  provider_name TEXT,
  model TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  archived INTEGER DEFAULT 0
);

-- Messages within conversations
CREATE TABLE messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  conversation_id INTEGER NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  tokens INTEGER,
  cost REAL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
);

-- API keys (encrypted storage)
CREATE TABLE api_keys (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  service_name TEXT NOT NULL UNIQUE,
  key_encrypted TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Archive runs (existing functionality)
CREATE TABLE archive_runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  query TEXT NOT NULL,
  total_count INTEGER,
  items_fetched INTEGER,
  report_path TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_conversations_updated ON conversations(updated_at DESC);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_provider_active ON provider_configs(is_active);
```

#### Create Database Connection Module
Create `backend/src/db/connection.js`:

```javascript
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.resolve(__dirname, '../../data/assistant.db');
const schemaPath = path.resolve(__dirname, 'schema.sql');

let db = null;

function getDatabase() {
  if (db) return db;
  
  // Ensure data directory exists
  const dataDir = path.dirname(dbPath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  // Open database
  db = new Database(dbPath);
  db.pragma('journal_mode = WAL'); // Write-Ahead Logging for better concurrency
  
  // Initialize schema if tables don't exist
  const tableCheck = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='conversations'").get();
  if (!tableCheck) {
    console.log('Initializing database schema...');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    db.exec(schema);
    console.log('Database schema initialized.');
  }
  
  return db;
}

function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}

module.exports = { getDatabase, closeDatabase };
```

#### Create Repository Pattern
Create `backend/src/db/repositories/conversationRepo.js`:

```javascript
const { getDatabase } = require('../connection');
const crypto = require('crypto');

class ConversationRepository {
  constructor() {
    this.db = getDatabase();
  }
  
  createConversation({ title, provider_name, model }) {
    const stmt = this.db.prepare(`
      INSERT INTO conversations (title, provider_name, model)
      VALUES (?, ?, ?)
    `);
    const result = stmt.run(title || 'New Conversation', provider_name, model);
    return result.lastInsertRowid;
  }
  
  getConversation(id) {
    const stmt = this.db.prepare('SELECT * FROM conversations WHERE id = ?');
    return stmt.get(id);
  }
  
  getAllConversations({ limit = 50, archived = 0 } = {}) {
    const stmt = this.db.prepare(`
      SELECT * FROM conversations 
      WHERE archived = ?
      ORDER BY updated_at DESC 
      LIMIT ?
    `);
    return stmt.all(archived, limit);
  }
  
  addMessage(conversationId, { role, content, tokens, cost }) {
    const stmt = this.db.prepare(`
      INSERT INTO messages (conversation_id, role, content, tokens, cost)
      VALUES (?, ?, ?, ?, ?)
    `);
    const result = stmt.run(conversationId, role, content, tokens, cost);
    
    // Update conversation timestamp
    const updateStmt = this.db.prepare(`
      UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `);
    updateStmt.run(conversationId);
    
    return result.lastInsertRowid;
  }
  
  getMessages(conversationId) {
    const stmt = this.db.prepare(`
      SELECT * FROM messages 
      WHERE conversation_id = ? 
      ORDER BY created_at ASC
    `);
    return stmt.all(conversationId);
  }
  
  deleteConversation(id) {
    const stmt = this.db.prepare('DELETE FROM conversations WHERE id = ?');
    return stmt.run(id);
  }
  
  archiveConversation(id) {
    const stmt = this.db.prepare('UPDATE conversations SET archived = 1 WHERE id = ?');
    return stmt.run(id);
  }
}

module.exports = ConversationRepository;
```

Create `backend/src/db/repositories/providerConfigRepo.js`:

```javascript
const { getDatabase } = require('../connection');
const crypto = require('crypto');

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-key-change-in-production';

class ProviderConfigRepository {
  constructor() {
    this.db = getDatabase();
  }
  
  // Simple encryption (use a proper library in production)
  encrypt(text) {
    const cipher = crypto.createCipher('aes-256-cbc', ENCRYPTION_KEY);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }
  
  decrypt(encrypted) {
    const decipher = crypto.createDecipher('aes-256-cbc', ENCRYPTION_KEY);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
  
  saveProviderConfig({ provider_name, display_name, provider_type, api_key, api_endpoint, default_model, options, is_active = 1 }) {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO provider_configs 
      (provider_name, display_name, provider_type, api_key_encrypted, api_endpoint, default_model, options, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const encrypted = api_key ? this.encrypt(api_key) : null;
    const optionsJson = options ? JSON.stringify(options) : null;
    
    return stmt.run(
      provider_name,
      display_name || provider_name,
      provider_type,
      encrypted,
      api_endpoint,
      default_model,
      optionsJson,
      is_active
    );
  }
  
  getProviderConfig(provider_name) {
    const stmt = this.db.prepare('SELECT * FROM provider_configs WHERE provider_name = ?');
    const row = stmt.get(provider_name);
    
    if (!row) return null;
    
    return {
      ...row,
      api_key: row.api_key_encrypted ? this.decrypt(row.api_key_encrypted) : null,
      options: row.options ? JSON.parse(row.options) : null,
    };
  }
  
  getAllProviders({ provider_type, is_active } = {}) {
    let query = 'SELECT * FROM provider_configs WHERE 1=1';
    const params = [];
    
    if (provider_type) {
      query += ' AND provider_type = ?';
      params.push(provider_type);
    }
    
    if (is_active !== undefined) {
      query += ' AND is_active = ?';
      params.push(is_active ? 1 : 0);
    }
    
    const stmt = this.db.prepare(query);
    const rows = stmt.all(...params);
    
    return rows.map(row => ({
      ...row,
      api_key: row.api_key_encrypted ? this.decrypt(row.api_key_encrypted) : null,
      options: row.options ? JSON.parse(row.options) : null,
    }));
  }
  
  deleteProviderConfig(provider_name) {
    const stmt = this.db.prepare('DELETE FROM provider_configs WHERE provider_name = ?');
    return stmt.run(provider_name);
  }
  
  toggleProviderActive(provider_name, is_active) {
    const stmt = this.db.prepare('UPDATE provider_configs SET is_active = ? WHERE provider_name = ?');
    return stmt.run(is_active ? 1 : 0, provider_name);
  }
}

module.exports = ProviderConfigRepository;
```

#### Create Initialization Script
Create `backend/scripts/initDatabase.js`:

```javascript
const { getDatabase, closeDatabase } = require('../src/db/connection');

console.log('Initializing database...');

try {
  const db = getDatabase();
  console.log('Database initialized successfully!');
  console.log('Location:', db.name);
  
  // Verify tables exist
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  console.log('Tables created:', tables.map(t => t.name).join(', '));
  
  closeDatabase();
} catch (error) {
  console.error('Database initialization failed:', error);
  process.exit(1);
}
```

Run it:
```bash
cd backend
node scripts/initDatabase.js
```

---

### 2. Create Provider Abstraction Layer

#### Base Provider Interface
Create `backend/src/services/providers/base.provider.js`:

```javascript
class BaseAIProvider {
  constructor(config) {
    this.name = config.name;
    this.apiKey = config.apiKey;
    this.endpoint = config.endpoint;
    this.defaultModel = config.defaultModel;
  }
  
  /**
   * Send a message to the AI provider
   * @param {Array} messages - Array of {role, content} objects
   * @param {Object} options - Optional parameters (model, temperature, max_tokens, etc.)
   * @returns {Promise<Object>} - {content, usage, model}
   */
  async sendMessage(messages, options = {}) {
    throw new Error('sendMessage() must be implemented by provider');
  }
  
  /**
   * Stream a message from the AI provider
   * @param {Array} messages - Array of {role, content} objects
   * @param {Object} options - Optional parameters
   * @returns {AsyncGenerator} - Yields {chunk, done}
   */
  async *streamMessage(messages, options = {}) {
    throw new Error('streamMessage() must be implemented by provider');
  }
  
  /**
   * Validate API key and configuration
   * @returns {Promise<Boolean>} - True if valid
   */
  async validateConfig() {
    throw new Error('validateConfig() must be implemented by provider');
  }
  
  /**
   * Get list of supported models
   * @returns {Promise<Array>} - [{id, name, context_window, cost_per_1k_tokens}]
   */
  async getSupportedModels() {
    throw new Error('getSupportedModels() must be implemented by provider');
  }
  
  /**
   * Normalize response format across providers
   * @param {Object} rawResponse - Provider-specific response
   * @returns {Object} - {content, usage: {prompt_tokens, completion_tokens, total_tokens}, model}
   */
  normalizeResponse(rawResponse) {
    throw new Error('normalizeResponse() must be implemented by provider');
  }
}

module.exports = BaseAIProvider;
```

#### Refactor Anthropic as Provider
Create `backend/src/services/providers/anthropic.provider.js`:

```javascript
const Anthropic = require('@anthropic-ai/sdk');
const BaseAIProvider = require('./base.provider');

class AnthropicProvider extends BaseAIProvider {
  constructor(config) {
    super(config);
    this.client = new Anthropic({ apiKey: this.apiKey });
  }
  
  async sendMessage(messages, options = {}) {
    const response = await this.client.messages.create({
      model: options.model || this.defaultModel || 'claude-3-5-sonnet-20241022',
      max_tokens: options.max_tokens || 4096,
      temperature: options.temperature,
      messages: messages,
      system: options.system,
    });
    
    return this.normalizeResponse(response);
  }
  
  async *streamMessage(messages, options = {}) {
    const stream = await this.client.messages.stream({
      model: options.model || this.defaultModel || 'claude-3-5-sonnet-20241022',
      max_tokens: options.max_tokens || 4096,
      messages: messages,
      system: options.system,
    });
    
    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta') {
        yield {
          chunk: chunk.delta.text,
          done: false,
        };
      }
    }
    
    yield { chunk: '', done: true };
  }
  
  async validateConfig() {
    try {
      await this.client.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'test' }],
      });
      return true;
    } catch (error) {
      console.error('Anthropic validation failed:', error.message);
      return false;
    }
  }
  
  async getSupportedModels() {
    return [
      {
        id: 'claude-3-5-sonnet-20241022',
        name: 'Claude 3.5 Sonnet',
        context_window: 200000,
        cost_per_1k_tokens: { input: 0.003, output: 0.015 },
      },
      {
        id: 'claude-3-opus-20240229',
        name: 'Claude 3 Opus',
        context_window: 200000,
        cost_per_1k_tokens: { input: 0.015, output: 0.075 },
      },
      {
        id: 'claude-3-haiku-20240307',
        name: 'Claude 3 Haiku',
        context_window: 200000,
        cost_per_1k_tokens: { input: 0.00025, output: 0.00125 },
      },
    ];
  }
  
  normalizeResponse(response) {
    return {
      content: response.content[0]?.text || '',
      usage: {
        prompt_tokens: response.usage.input_tokens,
        completion_tokens: response.usage.output_tokens,
        total_tokens: response.usage.input_tokens + response.usage.output_tokens,
      },
      model: response.model,
    };
  }
}

module.exports = AnthropicProvider;
```

#### Create Provider Registry
Create `backend/src/services/providers/registry.js`:

```javascript
const AnthropicProvider = require('./anthropic.provider');
const ProviderConfigRepository = require('../../db/repositories/providerConfigRepo');

class ProviderRegistry {
  constructor() {
    this.providers = new Map();
    this.configRepo = new ProviderConfigRepository();
    this.providerClasses = {
      anthropic: AnthropicProvider,
      // Future: openai, google, cohere, ollama
    };
  }
  
  /**
   * Initialize provider from database config
   */
  async loadProvider(providerName) {
    const config = this.configRepo.getProviderConfig(providerName);
    if (!config || !config.is_active) {
      throw new Error(`Provider ${providerName} not configured or inactive`);
    }
    
    const ProviderClass = this.providerClasses[providerName];
    if (!ProviderClass) {
      throw new Error(`Provider ${providerName} not supported`);
    }
    
    const provider = new ProviderClass({
      name: providerName,
      apiKey: config.api_key,
      endpoint: config.api_endpoint,
      defaultModel: config.default_model,
    });
    
    this.providers.set(providerName, provider);
    return provider;
  }
  
  /**
   * Get provider instance (load if not cached)
   */
  async getProvider(providerName) {
    if (this.providers.has(providerName)) {
      return this.providers.get(providerName);
    }
    return await this.loadProvider(providerName);
  }
  
  /**
   * List all available provider types
   */
  getAvailableProviders() {
    return Object.keys(this.providerClasses);
  }
  
  /**
   * Get all active providers from database
   */
  getActiveProviders() {
    return this.configRepo.getAllProviders({ provider_type: 'ai', is_active: 1 });
  }
}

// Singleton instance
const registry = new ProviderRegistry();
module.exports = registry;
```

---

### 3. Update Chat Route to Use Providers

Modify `backend/src/routes/chat.js`:

```javascript
const express = require('express');
const providerRegistry = require('../services/providers/registry');
const ConversationRepository = require('../db/repositories/conversationRepo');
const { validateMessages } = require('../utils/validateMessages');
const { checkTextForViolations } = require('../services/moderation');

const router = express.Router();
const conversationRepo = new ConversationRepository();

router.post('/', async (req, res) => {
  try {
    const { 
      messages = [], 
      provider = 'anthropic',  // NEW: Allow provider selection
      model,                   // NEW: Allow model selection
      conversationId,          // NEW: Track conversation
      stream = false,          // NEW: Streaming support
    } = req.body;
    
    validateMessages(messages);
    
    // Simple moderation
    const last = messages.length ? messages[messages.length-1] : null;
    if(last && last.role === 'user' && checkTextForViolations(last.content)){
      return res.status(400).json({ error: 'content_violates_policy' });
    }

    // Get provider instance
    const aiProvider = await providerRegistry.getProvider(provider);
    
    // Create or get conversation
    let convId = conversationId;
    if (!convId) {
      convId = conversationRepo.createConversation({
        title: messages[0]?.content.substring(0, 50) || 'New Chat',
        provider_name: provider,
        model: model || aiProvider.defaultModel,
      });
    }
    
    // Save user message
    conversationRepo.addMessage(convId, {
      role: 'user',
      content: last.content,
    });
    
    // Handle streaming
    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      
      for await (const chunk of aiProvider.streamMessage(messages, { model })) {
        res.write(`data: ${JSON.stringify(chunk)}\n\n`);
        if (chunk.done) break;
      }
      
      res.end();
    } else {
      // Normal response
      const response = await aiProvider.sendMessage(messages, { model });
      
      // Save assistant message
      conversationRepo.addMessage(convId, {
        role: 'assistant',
        content: response.content,
        tokens: response.usage.completion_tokens,
      });
      
      res.json({
        ...response,
        conversationId: convId,
        provider,
      });
    }
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({error: 'server_error', details: err.message});
  }
});

module.exports = router;
```

---

### 4. Create Provider Management Routes

Create `backend/src/routes/providers.js`:

```javascript
const express = require('express');
const providerRegistry = require('../services/providers/registry');
const ProviderConfigRepository = require('../db/repositories/providerConfigRepo');

const router = express.Router();
const configRepo = new ProviderConfigRepository();

// GET /api/providers - List all providers
router.get('/', (req, res) => {
  try {
    const available = providerRegistry.getAvailableProviders();
    const configured = configRepo.getAllProviders({ provider_type: 'ai' });
    
    res.json({
      available,
      configured: configured.map(p => ({
        name: p.provider_name,
        display_name: p.display_name,
        is_active: p.is_active === 1,
        has_api_key: !!p.api_key_encrypted,
        default_model: p.default_model,
      })),
    });
  } catch (err) {
    console.error('Get providers error:', err);
    res.status(500).json({ error: 'server_error' });
  }
});

// GET /api/providers/:name/models - Get supported models
router.get('/:name/models', async (req, res) => {
  try {
    const provider = await providerRegistry.getProvider(req.params.name);
    const models = await provider.getSupportedModels();
    res.json({ models });
  } catch (err) {
    console.error('Get models error:', err);
    res.status(500).json({ error: 'server_error', details: err.message });
  }
});

// POST /api/providers/:name/validate - Test API key
router.post('/:name/validate', async (req, res) => {
  try {
    const { api_key } = req.body;
    const { name } = req.params;
    
    // Temporarily create provider with test key
    const ProviderClass = providerRegistry.providerClasses[name];
    if (!ProviderClass) {
      return res.status(404).json({ error: 'provider_not_found' });
    }
    
    const testProvider = new ProviderClass({
      name,
      apiKey: api_key,
    });
    
    const isValid = await testProvider.validateConfig();
    res.json({ valid: isValid });
  } catch (err) {
    console.error('Validate error:', err);
    res.json({ valid: false, error: err.message });
  }
});

// PUT /api/providers/:name/config - Save provider config
router.put('/:name/config', async (req, res) => {
  try {
    const { api_key, default_model, is_active } = req.body;
    const { name } = req.params;
    
    configRepo.saveProviderConfig({
      provider_name: name,
      display_name: name.charAt(0).toUpperCase() + name.slice(1),
      provider_type: 'ai',
      api_key,
      default_model,
      is_active: is_active !== false,
    });
    
    res.json({ status: 'saved' });
  } catch (err) {
    console.error('Save config error:', err);
    res.status(500).json({ error: 'server_error' });
  }
});

// DELETE /api/providers/:name/config - Remove provider
router.delete('/:name/config', (req, res) => {
  try {
    configRepo.deleteProviderConfig(req.params.name);
    res.json({ status: 'deleted' });
  } catch (err) {
    console.error('Delete config error:', err);
    res.status(500).json({ error: 'server_error' });
  }
});

module.exports = router;
```

Add to `backend/src/server.js`:
```javascript
const providersRoutes = require('./routes/providers');
app.use('/api/providers', requireAPIKey, providersRoutes);
```

---

### 5. Test the New System

#### Seed Database with Test Provider
Create `backend/scripts/seedProviders.js`:

```javascript
const ProviderConfigRepository = require('../src/db/repositories/providerConfigRepo');

const repo = new ProviderConfigRepository();

// Add Anthropic provider
repo.saveProviderConfig({
  provider_name: 'anthropic',
  display_name: 'Anthropic Claude',
  provider_type: 'ai',
  api_key: process.env.ANTHROPIC_API_KEY,
  default_model: 'claude-3-5-sonnet-20241022',
  is_active: 1,
});

console.log('Providers seeded successfully!');
```

Run:
```bash
ANTHROPIC_API_KEY=your-key node backend/scripts/seedProviders.js
```

#### Test Chat with Provider
```bash
curl -X POST http://localhost:3001/api/chat \
  -H "x-api-key: your-backend-key" \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "anthropic",
    "model": "claude-3-5-sonnet-20241022",
    "messages": [
      {"role": "user", "content": "Hello!"}
    ]
  }'
```

---

## Next Week: Add OpenAI Provider

Create `backend/src/services/providers/openai.provider.js`:

```javascript
const OpenAI = require('openai');
const BaseAIProvider = require('./base.provider');

class OpenAIProvider extends BaseAIProvider {
  constructor(config) {
    super(config);
    this.client = new OpenAI({ apiKey: this.apiKey });
  }
  
  async sendMessage(messages, options = {}) {
    const response = await this.client.chat.completions.create({
      model: options.model || this.defaultModel || 'gpt-4o',
      messages: messages,
      temperature: options.temperature,
      max_tokens: options.max_tokens,
    });
    
    return this.normalizeResponse(response);
  }
  
  async *streamMessage(messages, options = {}) {
    const stream = await this.client.chat.completions.create({
      model: options.model || this.defaultModel || 'gpt-4o',
      messages: messages,
      stream: true,
    });
    
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        yield { chunk: content, done: false };
      }
    }
    
    yield { chunk: '', done: true };
  }
  
  async validateConfig() {
    try {
      await this.client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 5,
      });
      return true;
    } catch (error) {
      return false;
    }
  }
  
  async getSupportedModels() {
    return [
      {
        id: 'gpt-4o',
        name: 'GPT-4o',
        context_window: 128000,
        cost_per_1k_tokens: { input: 0.005, output: 0.015 },
      },
      {
        id: 'gpt-4-turbo',
        name: 'GPT-4 Turbo',
        context_window: 128000,
        cost_per_1k_tokens: { input: 0.01, output: 0.03 },
      },
      {
        id: 'gpt-3.5-turbo',
        name: 'GPT-3.5 Turbo',
        context_window: 16385,
        cost_per_1k_tokens: { input: 0.0005, output: 0.0015 },
      },
    ];
  }
  
  normalizeResponse(response) {
    return {
      content: response.choices[0]?.message?.content || '',
      usage: {
        prompt_tokens: response.usage.prompt_tokens,
        completion_tokens: response.usage.completion_tokens,
        total_tokens: response.usage.total_tokens,
      },
      model: response.model,
    };
  }
}

module.exports = OpenAIProvider;
```

Install:
```bash
npm install openai
```

Register in `registry.js`:
```javascript
const OpenAIProvider = require('./openai.provider');

this.providerClasses = {
  anthropic: AnthropicProvider,
  openai: OpenAIProvider,
};
```

---

## Success Checklist

### Phase 1 Complete ✅
- [x] Fix duplicate dependencies
- [x] Upgrade nodemon
- [x] Fix path traversal
- [x] Fix command injection
- [ ] SQLite database operational
- [ ] Provider abstraction working
- [ ] Chat route uses new provider system

### Ready for Phase 2
- [ ] 2+ providers working (Anthropic + OpenAI)
- [ ] Provider switching mid-conversation
- [ ] Database persisting conversations
- [ ] Frontend can select provider/model

---

**Next Action:** Run database initialization, then test provider system!
