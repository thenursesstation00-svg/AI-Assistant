/**
 * Advanced AI Configuration
 * 
 * Central configuration for multi-model support, plugins, and knowledge bases
 */

module.exports = {
  /**
   * Model Providers Configuration
   */
  providers: {
    // Anthropic Claude
    anthropic: {
      enabled: !!process.env.ANTHROPIC_API_KEY,
      apiKey: process.env.ANTHROPIC_API_KEY,
      defaultModel: 'claude-sonnet-4-20250514',
      models: [
        'claude-3-opus-20240229',
        'claude-3-sonnet-20240229',
        'claude-3-haiku-20240307',
        'claude-sonnet-4-20250514'
      ]
    },

    // OpenAI GPT (to be implemented)
    openai: {
      enabled: !!process.env.OPENAI_API_KEY,
      apiKey: process.env.OPENAI_API_KEY,
      defaultModel: 'gpt-4-turbo-preview',
      models: [
        'gpt-4-turbo-preview',
        'gpt-4',
        'gpt-3.5-turbo'
      ]
    },

    // Google Gemini (to be implemented)
    gemini: {
      enabled: !!process.env.GEMINI_API_KEY,
      apiKey: process.env.GEMINI_API_KEY,
      defaultModel: 'gemini-pro',
      models: [
        'gemini-pro',
        'gemini-pro-vision'
      ]
    }
  },

  /**
   * Default provider to use
   */
  defaultProvider: 'anthropic',

  /**
   * Plugin Configuration
   */
  plugins: {
    enabled: process.env.ENABLE_PLUGINS !== 'false',
    pluginPaths: [
      './plugins',
      './custom-plugins'
    ],
    autoLoad: process.env.AUTO_LOAD_PLUGINS !== 'false',
    sandboxed: true
  },

  /**
   * Conversation Management
   */
  conversations: {
    // Maximum messages to keep in context
    maxContextMessages: 20,
    
    // Approximate token limit for context
    maxContextTokens: 4000,
    
    // Auto-save conversations
    autoSave: true,
    
    // Storage location for conversations
    storageDir: './data/conversations',
    
    // Enable conversation search
    enableSearch: true
  },

  /**
   * Knowledge Base Configuration
   */
  knowledgeBase: {
    // Default source
    defaultSource: 'memory',
    
    // Vector database settings
    vectorDb: {
      provider: process.env.VECTOR_DB_PROVIDER || 'memory', // 'memory', 'pinecone', 'weaviate'
      
      // Pinecone config
      pinecone: {
        apiKey: process.env.PINECONE_API_KEY,
        environment: process.env.PINECONE_ENV,
        indexName: process.env.PINECONE_INDEX || 'ai-assistant'
      },
      
      // Weaviate config
      weaviate: {
        url: process.env.WEAVIATE_URL || 'http://localhost:8080',
        apiKey: process.env.WEAVIATE_API_KEY
      }
    },
    
    // Document chunking settings
    chunking: {
      chunkSize: 1000,
      overlap: 200
    },
    
    // RAG settings
    rag: {
      enabled: true,
      maxDocuments: 3,
      minScore: 0.7
    }
  },

  /**
   * Model Features
   */
  features: {
    // Enable streaming responses
    streaming: true,
    
    // Enable function calling
    functionCalling: true,
    
    // Enable vision capabilities
    vision: false,
    
    // Enable web search integration
    webSearch: !!process.env.SERPAPI_KEY || !!process.env.GOOGLE_CSE_KEY
  },

  /**
   * Usage Tracking
   */
  tracking: {
    enabled: true,
    logTokenUsage: true,
    logCosts: true
  }
};
