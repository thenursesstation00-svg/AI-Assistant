const AnthropicProvider = require('./anthropic.provider');
const OpenAIProvider = require('./openai.provider');
const ProviderConfigRepository = require('../../db/repositories/providerConfigRepo');

/**
 * Provider Registry
 * Manages AI provider instances and provides factory methods
 * Singleton pattern to ensure consistent provider instances across requests
 */
class ProviderRegistry {
  constructor() {
    // Cache of active provider instances
    this.providers = new Map();
    
    // Database repository for provider configurations
    this.configRepo = new ProviderConfigRepository();
    
    // Map of provider names to their implementation classes
    this.providerClasses = {
      anthropic: AnthropicProvider,
      openai: OpenAIProvider,
      // Future providers:
      // google: GoogleAIProvider,
      // cohere: CohereProvider,
      // ollama: OllamaProvider,
    };
  }
  
  /**
   * Initialize a provider from database configuration
   * @param {string} providerName - Provider identifier (e.g., 'anthropic', 'openai')
   * @returns {Promise<BaseAIProvider>} Initialized provider instance
   * @throws {Error} If provider not configured, inactive, or unsupported
   */
  async loadProvider(providerName) {
    const config = this.configRepo.getProviderConfig(providerName);
    
    if (!config) {
      throw new Error(`Provider '${providerName}' not found in database. Run seedProviders.js to initialize.`);
    }
    
    if (!config.is_active) {
      throw new Error(`Provider '${providerName}' is inactive. Activate it via Settings or set API key.`);
    }
    
    if (!config.api_key) {
      throw new Error(`Provider '${providerName}' has no API key configured. Add key via Settings.`);
    }
    
    const ProviderClass = this.providerClasses[providerName];
    if (!ProviderClass) {
      throw new Error(`Provider '${providerName}' is not implemented. Available: ${Object.keys(this.providerClasses).join(', ')}`);
    }
    
    const provider = new ProviderClass({
      name: providerName,
      apiKey: config.api_key,
      endpoint: config.api_endpoint,
      defaultModel: config.default_model,
      options: config.options,
    });
    
    // Cache the provider instance
    this.providers.set(providerName, provider);
    console.log(`✓ Loaded provider: ${providerName} (model: ${config.default_model})`);
    
    return provider;
  }
  
  /**
   * Get provider instance (loads from DB if not cached)
   * @param {string} providerName - Provider identifier
   * @returns {Promise<BaseAIProvider>} Provider instance
   */
  async getProvider(providerName) {
    if (this.providers.has(providerName)) {
      return this.providers.get(providerName);
    }
    return await this.loadProvider(providerName);
  }
  
  /**
   * Reload provider from database (useful after config changes)
   * @param {string} providerName - Provider identifier
   * @returns {Promise<BaseAIProvider>} Reloaded provider instance
   */
  async reloadProvider(providerName) {
    this.providers.delete(providerName);
    return await this.loadProvider(providerName);
  }
  
  /**
   * Clear provider from cache
   * @param {string} providerName - Provider identifier
   */
  clearProvider(providerName) {
    this.providers.delete(providerName);
  }
  
  /**
   * Clear all cached providers
   */
  clearAll() {
    this.providers.clear();
  }
  
  /**
   * Get list of available provider types (implemented classes)
   * @returns {Array<string>} Array of provider names
   */
  getAvailableProviders() {
    return Object.keys(this.providerClasses);
  }
  
  /**
   * Get all active providers from database
   * @returns {Array<Object>} Array of provider configs
   */
  getActiveProviders() {
    return this.configRepo.getAllProviders({ provider_type: 'ai', is_active: true });
  }
  
  /**
   * Get all configured providers (active and inactive)
   * @returns {Array<Object>} Array of provider configs
   */
  getAllConfiguredProviders() {
    return this.configRepo.getAllProviders({ provider_type: 'ai' });
  }
  
  /**
   * Test if a provider is available and configured
   * @param {string} providerName - Provider identifier
   * @returns {boolean} True if provider can be loaded
   */
  isProviderAvailable(providerName) {
    try {
      const config = this.configRepo.getProviderConfig(providerName);
      return config && config.is_active && config.api_key && this.providerClasses[providerName];
    } catch {
      return false;
    }
  }
  
  /**
   * Get default provider (first active provider found)
   * @returns {Promise<{name: string, provider: BaseAIProvider}>} Default provider
   * @throws {Error} If no active providers found
   */
  async getDefaultProvider() {
    const activeProviders = this.getActiveProviders();
    if (activeProviders.length === 0) {
      throw new Error('No active AI providers configured. Add API keys via Settings.');
    }
    
    const defaultConfig = activeProviders[0];
    const provider = await this.getProvider(defaultConfig.provider_name);
    
    return {
      name: defaultConfig.provider_name,
      provider,
    };
  }
}

// Export singleton instance
const registry = new ProviderRegistry();
module.exports = registry;
