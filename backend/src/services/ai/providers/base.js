// backend/src/services/ai/providers/base.js
// Abstract base class for AI providers

class AIProvider {
  constructor(config = {}) {
    this.config = config;
    this.apiKey = config.apiKey || null;
  }

  /**
   * Send a chat completion request
   * @param {Array} messages - Array of message objects with role and content
   * @param {Object} options - Provider-specific options
   * @returns {Promise<Object>} Response with content and metadata
   */
  async chat(messages, options = {}) {
    throw new Error('chat() must be implemented by provider');
  }

  /**
   * Stream a chat completion response
   * @param {Array} messages - Array of message objects
   * @param {Object} options - Provider-specific options
   * @returns {AsyncGenerator} Stream of response chunks
   */
  async *streamChat(messages, options = {}) {
    throw new Error('streamChat() must be implemented by provider');
  }

  /**
   * Get list of available models for this provider
   * @returns {Array<Object>} List of model objects with id, name, description
   */
  getSupportedModels() {
    throw new Error('getSupportedModels() must be implemented by provider');
  }

  /**
   * Validate API key and connection
   * @returns {Promise<Boolean>} True if valid
   */
  async validateConnection() {
    throw new Error('validateConnection() must be implemented by provider');
  }

  /**
   * Normalize provider-specific response to common format
   * @param {Object} response - Provider-specific response
   * @returns {Object} Normalized response
   */
  normalizeResponse(response) {
    return {
      content: '',
      role: 'assistant',
      model: '',
      usage: {
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0
      },
      finish_reason: 'stop',
      raw: response
    };
  }

  /**
   * Calculate estimated cost for request
   * @param {Number} promptTokens
   * @param {Number} completionTokens
   * @param {String} model
   * @returns {Number} Cost in USD
   */
  calculateCost(promptTokens, completionTokens, model) {
    return 0; // Override in subclass
  }

  /**
   * Get provider name
   * @returns {String}
   */
  getName() {
    throw new Error('getName() must be implemented by provider');
  }

  /**
   * Check if provider is configured and ready
   * @returns {Boolean}
   */
  isConfigured() {
    return !!this.apiKey;
  }
}

module.exports = AIProvider;
