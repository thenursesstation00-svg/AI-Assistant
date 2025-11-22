/**
 * Multi-Model Provider Abstraction Layer
 * 
 * This module provides a unified interface for interacting with multiple AI model providers
 * (Anthropic Claude, OpenAI GPT, Google Gemini, local models, etc.)
 * 
 * References:
 * - OpenAI API: https://platform.openai.com/docs/api-reference
 * - Anthropic Claude: https://docs.anthropic.com/claude/reference/
 * - Google Gemini: https://ai.google.dev/docs
 * - Hugging Face: https://huggingface.co/docs/transformers/
 */

/**
 * Base interface for all model providers
 * @interface ModelProvider
 */
class ModelProvider {
  constructor(config = {}) {
    this.config = config;
    this.name = '';
    this.models = [];
    this.capabilities = [];
  }

  /**
   * Send a message and get a response
   * @param {Array} messages - Array of message objects
   * @param {Object} options - Provider-specific options
   * @returns {Promise<Object>} Normalized response
   */
  async chat(messages, options = {}) {
    throw new Error('chat() must be implemented by provider');
  }

  /**
   * Stream a response
   * @param {Array} messages - Array of message objects
   * @param {Object} options - Provider-specific options
   * @returns {AsyncIterator} Stream of response chunks
   */
  async *stream(messages, options = {}) {
    throw new Error('stream() must be implemented by provider');
  }

  /**
   * Get available models
   * @returns {Promise<Array>} List of available models
   */
  async listModels() {
    return this.models;
  }

  /**
   * Validate configuration
   * @returns {Boolean} True if config is valid
   */
  validateConfig() {
    return !!this.config.apiKey;
  }

  /**
   * Get provider capabilities
   * @returns {Array<String>} List of capabilities
   */
  getCapabilities() {
    return this.capabilities;
  }

  /**
   * Normalize response format across providers
   * @param {Object} rawResponse - Provider-specific response
   * @returns {Object} Normalized response
   */
  normalizeResponse(rawResponse) {
    return {
      content: '',
      model: '',
      usage: { input_tokens: 0, output_tokens: 0 },
      provider: this.name,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Anthropic Claude Provider
 */
class AnthropicProvider extends ModelProvider {
  constructor(config) {
    super(config);
    this.name = 'anthropic';
    this.models = [
      'claude-3-opus-20240229',
      'claude-3-sonnet-20240229',
      'claude-3-haiku-20240307',
      'claude-sonnet-4-20250514'
    ];
    this.capabilities = ['chat', 'stream', 'vision', 'function-calling'];
  }

  async chat(messages, options = {}) {
    const Anthropic = require('@anthropic-ai/sdk');
    const client = new Anthropic({ apiKey: this.config.apiKey });
    
    const response = await client.messages.create({
      model: options.model || 'claude-sonnet-4-20250514',
      max_tokens: options.max_tokens || 1200,
      messages: messages,
      ...options
    });

    return this.normalizeResponse(response);
  }

  normalizeResponse(rawResponse) {
    return {
      content: rawResponse.content[0].text,
      model: rawResponse.model,
      usage: {
        input_tokens: rawResponse.usage.input_tokens,
        output_tokens: rawResponse.usage.output_tokens
      },
      provider: this.name,
      timestamp: new Date().toISOString(),
      raw: rawResponse
    };
  }
}

/**
 * OpenAI GPT Provider (foundation for future implementation)
 */
class OpenAIProvider extends ModelProvider {
  constructor(config) {
    super(config);
    this.name = 'openai';
    this.models = [
      'gpt-4-turbo-preview',
      'gpt-4',
      'gpt-3.5-turbo',
      'gpt-4-vision-preview'
    ];
    this.capabilities = ['chat', 'stream', 'vision', 'function-calling', 'embeddings'];
  }

  async chat(messages, options = {}) {
    // Foundation for OpenAI integration
    // To implement: npm install openai
    throw new Error('OpenAI provider not yet implemented. Add openai package and implement.');
  }
}

/**
 * Google Gemini Provider (foundation for future implementation)
 */
class GeminiProvider extends ModelProvider {
  constructor(config) {
    super(config);
    this.name = 'gemini';
    this.models = [
      'gemini-pro',
      'gemini-pro-vision',
      'gemini-ultra'
    ];
    this.capabilities = ['chat', 'stream', 'vision', 'multimodal'];
  }

  async chat(messages, options = {}) {
    // Foundation for Gemini integration
    // To implement: npm install @google/generative-ai
    throw new Error('Gemini provider not yet implemented. Add @google/generative-ai package and implement.');
  }
}

/**
 * Provider Registry - Manages all available providers
 */
class ProviderRegistry {
  constructor() {
    this.providers = new Map();
    this.defaultProvider = null;
  }

  /**
   * Register a new provider
   * @param {String} name - Provider name
   * @param {ModelProvider} provider - Provider instance
   */
  register(name, provider) {
    this.providers.set(name, provider);
    if (!this.defaultProvider) {
      this.defaultProvider = name;
    }
  }

  /**
   * Get a provider by name
   * @param {String} name - Provider name
   * @returns {ModelProvider} Provider instance
   */
  get(name) {
    return this.providers.get(name);
  }

  /**
   * Get default provider
   * @returns {ModelProvider} Default provider instance
   */
  getDefault() {
    return this.providers.get(this.defaultProvider);
  }

  /**
   * List all registered providers
   * @returns {Array<String>} List of provider names
   */
  list() {
    return Array.from(this.providers.keys());
  }

  /**
   * Set default provider
   * @param {String} name - Provider name
   */
  setDefault(name) {
    if (this.providers.has(name)) {
      this.defaultProvider = name;
    } else {
      throw new Error(`Provider ${name} not found`);
    }
  }
}

// Initialize global registry
const registry = new ProviderRegistry();

// Auto-register Anthropic if API key is available
if (process.env.ANTHROPIC_API_KEY) {
  registry.register('anthropic', new AnthropicProvider({
    apiKey: process.env.ANTHROPIC_API_KEY
  }));
}

module.exports = {
  ModelProvider,
  AnthropicProvider,
  OpenAIProvider,
  GeminiProvider,
  ProviderRegistry,
  registry
};
