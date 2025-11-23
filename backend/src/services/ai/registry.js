// backend/src/services/ai/registry.js
// AI Provider Registry - manages multiple AI providers

const AnthropicProvider = require('./providers/anthropic');
const OpenAIProvider = require('./providers/openai');

class ProviderRegistry {
  constructor() {
    this.providers = new Map();
    this.defaultProvider = null;
    this._initialized = false;
  }

  /**
   * Initialize all available providers
   */
  initialize() {
    if (this._initialized) return;

    // Register Anthropic (always available as it's the default)
    if (process.env.ANTHROPIC_API_KEY) {
      this.register('anthropic', new AnthropicProvider({
        apiKey: process.env.ANTHROPIC_API_KEY
      }));
      if (!this.defaultProvider) {
        this.defaultProvider = 'anthropic';
      }
    }

    // Register OpenAI if configured
    if (process.env.OPENAI_API_KEY) {
      this.register('openai', new OpenAIProvider({
        apiKey: process.env.OPENAI_API_KEY
      }));
    }

    this._initialized = true;
    console.log(`✅ AI Provider Registry initialized with ${this.providers.size} providers`);
  }

  /**
   * Register a new provider
   * @param {String} name - Provider name
   * @param {AIProvider} provider - Provider instance
   */
  register(name, provider) {
    this.providers.set(name, provider);
    console.log(`📝 Registered AI provider: ${name}`);
  }

  /**
   * Get a provider by name
   * @param {String} name - Provider name
   * @returns {AIProvider}
   */
  get(name) {
    if (!this._initialized) {
      this.initialize();
    }

    const provider = this.providers.get(name);
    if (!provider) {
      throw new Error(`Provider not found: ${name}`);
    }
    return provider;
  }

  /**
   * Get default provider
   * @returns {AIProvider}
   */
  getDefault() {
    if (!this._initialized) {
      this.initialize();
    }

    if (!this.defaultProvider) {
      throw new Error('No default provider configured');
    }
    return this.get(this.defaultProvider);
  }

  /**
   * Set default provider
   * @param {String} name - Provider name
   */
  setDefault(name) {
    if (!this.providers.has(name)) {
      throw new Error(`Cannot set default to non-existent provider: ${name}`);
    }
    this.defaultProvider = name;
  }

  /**
   * List all registered providers
   * @returns {Array<Object>}
   */
  list() {
    if (!this._initialized) {
      this.initialize();
    }

    return Array.from(this.providers.entries()).map(([name, provider]) => ({
      name,
      configured: provider.isConfigured(),
      models: provider.getSupportedModels(),
      isDefault: name === this.defaultProvider
    }));
  }

  /**
   * Check if a provider is available
   * @param {String} name
   * @returns {Boolean}
   */
  has(name) {
    if (!this._initialized) {
      this.initialize();
    }
    return this.providers.has(name);
  }

  /**
   * Validate all configured providers
   * @returns {Promise<Object>} Validation results
   */
  async validateAll() {
    if (!this._initialized) {
      this.initialize();
    }

    const results = {};
    
    for (const [name, provider] of this.providers.entries()) {
      if (provider.isConfigured()) {
        try {
          results[name] = await provider.validateConnection();
        } catch (error) {
          results[name] = false;
        }
      } else {
        results[name] = null; // Not configured
      }
    }

    return results;
  }

  /**
   * Send chat request using specified provider
   * @param {String} providerName - Provider to use
   * @param {Array} messages - Chat messages
   * @param {Object} options - Provider options
   * @returns {Promise<Object>}
   */
  async chat(providerName, messages, options = {}) {
    const provider = providerName ? this.get(providerName) : this.getDefault();
    return await provider.chat(messages, options);
  }

  /**
   * Stream chat request using specified provider
   * @param {String} providerName - Provider to use
   * @param {Array} messages - Chat messages
   * @param {Object} options - Provider options
   * @returns {AsyncGenerator}
   */
  async *streamChat(providerName, messages, options = {}) {
    const provider = providerName ? this.get(providerName) : this.getDefault();
    yield* provider.streamChat(messages, options);
  }
}

// Singleton instance
const registry = new ProviderRegistry();

module.exports = registry;
