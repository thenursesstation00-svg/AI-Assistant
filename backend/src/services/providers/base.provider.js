/**
 * Base AI Provider Interface
 * All AI providers must implement this interface for consistent behavior
 */
class BaseAIProvider {
  /**
   * @param {Object} config - Provider configuration
   * @param {string} config.name - Provider name (e.g., 'anthropic', 'openai')
   * @param {string} config.apiKey - API key for authentication
   * @param {string} [config.endpoint] - Custom API endpoint
   * @param {string} [config.defaultModel] - Default model to use
   * @param {Object} [config.options] - Provider-specific options
   */
  constructor(config) {
    this.name = config.name;
    this.apiKey = config.apiKey;
    this.endpoint = config.endpoint;
    this.defaultModel = config.defaultModel;
    this.options = config.options || {};
  }
  
  /**
   * Send a message to the AI provider
   * @param {Array<{role: string, content: string}>} messages - Conversation messages
   * @param {Object} [options] - Request options
   * @param {string} [options.model] - Override default model
   * @param {number} [options.temperature] - Response randomness (0-2)
   * @param {number} [options.max_tokens] - Maximum response length
   * @param {string} [options.system] - System prompt
   * @returns {Promise<{content: string, usage: Object, model: string}>}
   * @throws {Error} If not implemented or request fails
   */
  async sendMessage(messages, options = {}) {
    throw new Error(`sendMessage() must be implemented by ${this.name} provider`);
  }
  
  /**
   * Stream a message from the AI provider (for real-time responses)
   * @param {Array<{role: string, content: string}>} messages - Conversation messages
   * @param {Object} [options] - Request options (same as sendMessage)
   * @returns {AsyncGenerator<{chunk: string, done: boolean}>}
   * @throws {Error} If not implemented or streaming not supported
   */
  async *streamMessage(messages, options = {}) {
    throw new Error(`streamMessage() must be implemented by ${this.name} provider`);
  }
  
  /**
   * Validate API key and configuration
   * Makes a minimal API call to verify credentials work
   * @returns {Promise<boolean>} True if configuration is valid
   */
  async validateConfig() {
    throw new Error(`validateConfig() must be implemented by ${this.name} provider`);
  }
  
  /**
   * Get list of supported models
   * @returns {Promise<Array<{id: string, name: string, context_window: number, cost_per_1k_tokens: Object}>>}
   */
  async getSupportedModels() {
    throw new Error(`getSupportedModels() must be implemented by ${this.name} provider`);
  }
  
  /**
   * Normalize provider-specific response to standard format
   * @param {Object} rawResponse - Provider's native response format
   * @returns {{content: string, usage: {prompt_tokens: number, completion_tokens: number, total_tokens: number}, model: string}}
   * @protected
   */
  normalizeResponse(rawResponse) {
    throw new Error(`normalizeResponse() must be implemented by ${this.name} provider`);
  }
  
  /**
   * Calculate estimated cost for a response
   * @param {Object} usage - Token usage object
   * @param {string} model - Model used
   * @returns {number} Estimated cost in USD
   * @protected
   */
  calculateCost(usage, model) {
    // Override in subclass if cost calculation is needed
    return 0;
  }
}

module.exports = BaseAIProvider;
