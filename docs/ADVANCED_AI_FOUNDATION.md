# Advanced AI Capabilities - Foundation Architecture

This document describes the foundation architecture for advanced AI capabilities in the AI Assistant project.

## Overview

The foundation provides extensible, well-architected systems for:

1. **Multi-Model Provider Support** - Switch between different AI models (Claude, GPT-4, Gemini, etc.)
2. **Plugin System** - Extend functionality with custom tools, knowledge sources, and UI components
3. **Conversation Management** - Store, search, and manage conversation history
4. **Knowledge Base & RAG** - Integrate custom knowledge sources with Retrieval Augmented Generation

## Architecture Components

### 1. Model Provider Abstraction (`modelProvider.js`)

**Purpose:** Unified interface for multiple AI model providers

**Key Features:**
- Provider-agnostic API for chat and streaming
- Automatic response normalization across providers
- Provider registry for dynamic switching
- Support for provider-specific capabilities

**Supported Providers:**
- ✅ **Anthropic Claude** (Implemented)
  - claude-3-opus, claude-3-sonnet, claude-3-haiku
  - claude-sonnet-4-20250514
- 🔄 **OpenAI GPT** (Foundation ready)
  - gpt-4-turbo-preview, gpt-4, gpt-3.5-turbo
- 🔄 **Google Gemini** (Foundation ready)
  - gemini-pro, gemini-pro-vision
- 🔄 **Local Models** (Foundation ready)
  - Ollama, LocalAI, llama.cpp integration

**Usage Example:**
```javascript
const { registry } = require('./services/modelProvider');

// Get default provider
const provider = registry.getDefault();

// Send a chat message
const response = await provider.chat([
  { role: 'user', content: 'Hello!' }
], {
  model: 'claude-sonnet-4-20250514',
  max_tokens: 1000
});

// Switch providers
registry.setDefault('openai');
```

**Research References:**
- [LangChain Model Providers](https://js.langchain.com/docs/modules/model_io/)
- [Hugging Face Hub](https://huggingface.co/docs/hub/index)
- [OpenRouter API](https://openrouter.ai/docs)

### 2. Plugin System (`pluginSystem.js`)

**Purpose:** Extensible architecture for third-party integrations

**Plugin Types:**
- **Tool Plugins** - Add custom functions/tools the AI can use
- **Knowledge Plugins** - Integrate custom knowledge sources
- **UI Plugins** - Add custom UI components and panels

**Key Features:**
- Plugin lifecycle management (initialize, activate, deactivate, dispose)
- Capability-based plugin discovery
- Hook system for extending core functionality
- Plugin manifest with versioning and dependencies

**Plugin Structure:**
```javascript
{
  "id": "my-plugin",
  "name": "My Custom Plugin",
  "version": "1.0.0",
  "author": "Developer Name",
  "description": "Plugin description",
  "capabilities": ["tool", "knowledge"],
  "main": "index.js"
}
```

**Usage Example:**
```javascript
const { pluginRegistry } = require('./services/pluginSystem');

// List all plugins
const plugins = pluginRegistry.list();

// Get plugins by capability
const toolPlugins = pluginRegistry.getByCapability('tool');

// Enable/disable plugins
await pluginRegistry.enable('my-plugin');
await pluginRegistry.disable('my-plugin');
```

**Research References:**
- [VSCode Extension API](https://code.visualstudio.com/api/references/vscode-api)
- [WordPress Plugin Development](https://developer.wordpress.org/plugins/)
- [Obsidian Plugin System](https://docs.obsidian.md/Plugins/Getting+started/Build+a+plugin)

### 3. Conversation Management (`conversationManager.js`)

**Purpose:** Manage conversation history, context, and user preferences

**Key Features:**
- Multi-conversation support with unique IDs
- Smart context window management (token-aware)
- Conversation search and filtering
- Import/export capabilities (JSON format)
- Auto-generated titles from first messages
- Tag-based organization

**Data Model:**
```javascript
{
  id: 'conv_123',
  messages: [
    { role: 'user', content: '...', timestamp: '...' },
    { role: 'assistant', content: '...', timestamp: '...' }
  ],
  metadata: {
    title: 'Conversation Title',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:10:00Z',
    tags: ['tag1', 'tag2'],
    model: 'claude-sonnet-4-20250514',
    provider: 'anthropic'
  },
  userPreferences: {
    preferredStyle: 'concise',
    topics: ['programming', 'ai']
  }
}
```

**Usage Example:**
```javascript
const { conversationManager } = require('./services/conversationManager');

// Create new conversation
const conv = conversationManager.createConversation({
  title: 'My Chat',
  tags: ['work']
});

// Add messages
conv.addMessage('user', 'Hello!');
conv.addMessage('assistant', 'Hi! How can I help?');

// Get context-aware messages
const contextMessages = conv.getContextWindow(4000);

// Search conversations
const results = conversationManager.searchConversations('machine learning');
```

**Research References:**
- [LangChain Memory Systems](https://js.langchain.com/docs/modules/memory/)
- [Conversation Design Patterns](https://www.nngroup.com/articles/chatbot-ux/)
- [Dialog State Tracking](https://arxiv.org/abs/1907.00456)

### 4. Knowledge Base & RAG (`knowledgeBase.js`)

**Purpose:** Integrate custom knowledge sources for enhanced AI responses

**Key Features:**
- Document ingestion with automatic chunking
- Vector database integration (in-memory, Pinecone, Weaviate)
- Semantic search across knowledge sources
- RAG (Retrieval Augmented Generation) support
- Multi-source knowledge aggregation

**Supported Vector Databases:**
- ✅ **In-Memory** (Implemented for dev/testing)
- 🔄 **Pinecone** (Foundation ready)
- 🔄 **Weaviate** (Foundation ready)
- 🔄 **ChromaDB** (To be added)
- 🔄 **FAISS** (To be added)

**Usage Example:**
```javascript
const { knowledgeBase, Document } = require('./services/knowledgeBase');

// Index a document
await knowledgeBase.indexDocument(
  'Machine learning is a subset of artificial intelligence...',
  { title: 'ML Basics', source: 'textbook', tags: ['ml', 'ai'] }
);

// Search for relevant knowledge
const docs = await knowledgeBase.search('what is machine learning', {
  limit: 3
});

// Perform RAG
const rag = await knowledgeBase.performRAG('explain machine learning');
console.log(rag.augmentedQuery); // Query with context
console.log(rag.documents); // Retrieved documents
```

**Research References:**
- [RAG Paper (Lewis et al.)](https://arxiv.org/abs/2005.11401)
- [LangChain RAG Guide](https://js.langchain.com/docs/use_cases/question_answering/)
- [Vector Database Comparison](https://github.com/erikbern/ann-benchmarks)
- [Pinecone Documentation](https://docs.pinecone.io/)
- [Weaviate Documentation](https://weaviate.io/developers/weaviate)

## Configuration

All advanced features are configured via `backend/src/config/advancedAI.js`:

```javascript
const config = require('./config/advancedAI');

// Check if a provider is enabled
if (config.providers.openai.enabled) {
  // Use OpenAI
}

// Get plugin settings
const pluginPaths = config.plugins.pluginPaths;

// Get conversation settings
const maxContext = config.conversations.maxContextMessages;
```

## Environment Variables

Add to your `backend/.env`:

```bash
# Multi-Model Support
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=...

# Vector Database (optional)
VECTOR_DB_PROVIDER=memory  # or 'pinecone', 'weaviate'
PINECONE_API_KEY=...
PINECONE_ENV=...
PINECONE_INDEX=ai-assistant
WEAVIATE_URL=http://localhost:8080
WEAVIATE_API_KEY=...

# Plugin System
ENABLE_PLUGINS=true
AUTO_LOAD_PLUGINS=true
```

## Implementation Roadmap

### Phase 1: Multi-Model Support (Next PR)
- [ ] Implement OpenAI GPT provider
- [ ] Implement Google Gemini provider
- [ ] Add model selection UI
- [ ] Add cost tracking
- [ ] Add model comparison features

### Phase 2: Plugin System (Subsequent PR)
- [ ] Implement plugin loader
- [ ] Create example plugins
- [ ] Build plugin marketplace UI
- [ ] Add plugin security sandbox
- [ ] Create plugin developer documentation

### Phase 3: Advanced Conversations (Subsequent PR)
- [ ] Add conversation persistence to disk/database
- [ ] Implement conversation search
- [ ] Add conversation export (Markdown, PDF)
- [ ] Build conversation management UI
- [ ] Add conversation sharing

### Phase 4: Knowledge Base & RAG (Subsequent PR)
- [ ] Implement Pinecone integration
- [ ] Implement Weaviate integration
- [ ] Add embedding generation
- [ ] Build document upload UI
- [ ] Add RAG toggle in chat interface

## Testing

Each component includes test-ready foundations:

```bash
# Test model provider
cd backend
node -e "const {registry} = require('./src/services/modelProvider'); console.log(registry.list());"

# Test plugin system
node -e "const {pluginRegistry} = require('./src/services/pluginSystem'); console.log(pluginRegistry.list());"

# Test conversation manager
node -e "const {conversationManager} = require('./src/services/conversationManager'); const c = conversationManager.createConversation(); c.addMessage('user', 'test'); console.log(c.toJSON());"

# Test knowledge base
node -e "const {knowledgeBase} = require('./src/services/knowledgeBase'); knowledgeBase.indexDocument('test doc'); console.log('KB ready');"
```

## Best Practices

1. **Provider Abstraction** - Always use the provider interface, never call APIs directly
2. **Plugin Isolation** - Plugins should not directly access core systems
3. **Context Management** - Respect token limits when building conversation context
4. **Knowledge Chunking** - Keep document chunks under 1000 characters for better retrieval
5. **Error Handling** - All async operations should have proper try-catch blocks

## Resources & References

### Academic Papers
- [Retrieval-Augmented Generation (RAG)](https://arxiv.org/abs/2005.11401)
- [In-Context Learning](https://arxiv.org/abs/2301.00234)
- [Constitutional AI](https://arxiv.org/abs/2212.08073)

### Industry Documentation
- [OpenAI API Reference](https://platform.openai.com/docs)
- [Anthropic Claude Documentation](https://docs.anthropic.com/)
- [Google Gemini AI](https://ai.google.dev/docs)
- [LangChain.js Documentation](https://js.langchain.com/)

### Open Source Projects
- [LangChain](https://github.com/langchain-ai/langchainjs)
- [AutoGPT](https://github.com/Significant-Gravitas/Auto-GPT)
- [GPT Engineer](https://github.com/AntonOsika/gpt-engineer)

## Contributing

To extend these foundation systems:

1. Follow the established interfaces (`ModelProvider`, `Plugin`, `KnowledgeSource`)
2. Add comprehensive JSDoc comments
3. Include usage examples
4. Reference relevant academic papers or industry standards
5. Write tests for new functionality

## Support

For questions or issues with the advanced AI foundation:
1. Check this documentation first
2. Review the code comments in each service file
3. Open an issue on GitHub with [Advanced-AI] prefix
4. Join community discussions

---

**Note:** This is foundation code. Full implementations will be added in subsequent PRs as outlined in the roadmap above.
