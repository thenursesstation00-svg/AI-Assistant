const express = require('express');
const router = express.Router();
const providerRegistry = require('../services/providers/registry');
const ProviderConfigRepository = require('../db/repositories/providerConfigRepo');

const configRepo = new ProviderConfigRepository();

/**
 * GET /api/providers
 * Get all configured providers (AI only)
 */
router.get('/', (req, res) => {
  try {
    const { active_only } = req.query;
    const filters = { provider_type: 'ai' };
    
    if (active_only === 'true') {
      filters.is_active = true;
    }
    
    const providers = configRepo.getAllProviders(filters);
    
    // Sanitize: don't send API keys to client
    const sanitized = providers.map(p => ({
      provider_name: p.provider_name,
      display_name: p.display_name,
      provider_type: p.provider_type,
      is_active: p.is_active,
      default_model: p.default_model,
      api_endpoint: p.api_endpoint,
      options: p.options,
      has_api_key: !!p.api_key,
      created_at: p.created_at,
      updated_at: p.updated_at,
    }));
    
    res.json({
      success: true,
      providers: sanitized,
      available_types: providerRegistry.getAvailableProviders(),
    });
  } catch (error) {
    console.error('Error fetching providers:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch providers',
      message: error.message,
    });
  }
});

/**
 * GET /api/providers/:name
 * Get specific provider configuration
 */
router.get('/:name', (req, res) => {
  try {
    const { name } = req.params;
    const provider = configRepo.getProviderConfig(name);
    
    if (!provider) {
      return res.status(404).json({
        success: false,
        error: `Provider '${name}' not found`,
      });
    }
    
    // Sanitize: don't send API key
    const sanitized = {
      provider_name: provider.provider_name,
      display_name: provider.display_name,
      provider_type: provider.provider_type,
      is_active: provider.is_active,
      default_model: provider.default_model,
      api_endpoint: provider.api_endpoint,
      options: provider.options,
      has_api_key: !!provider.api_key,
      created_at: provider.created_at,
      updated_at: provider.updated_at,
    };
    
    res.json({
      success: true,
      provider: sanitized,
    });
  } catch (error) {
    console.error('Error fetching provider:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch provider',
      message: error.message,
    });
  }
});

/**
 * GET /api/providers/:name/models
 * Get supported models for a provider
 */
router.get('/:name/models', async (req, res) => {
  try {
    const { name } = req.params;
    
    // Check if provider is available
    if (!providerRegistry.isProviderAvailable(name)) {
      return res.status(400).json({
        success: false,
        error: `Provider '${name}' is not available or not configured`,
      });
    }
    
    const provider = await providerRegistry.getProvider(name);
    const models = await provider.getSupportedModels();
    
    res.json({
      success: true,
      provider: name,
      models,
    });
  } catch (error) {
    console.error('Error fetching models:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch models',
      message: error.message,
    });
  }
});

/**
 * POST /api/providers/:name/validate
 * Validate API key for a provider
 * Body: { api_key: string }
 */
router.post('/:name/validate', async (req, res) => {
  try {
    const { name } = req.params;
    const { api_key } = req.body;
    
    if (!api_key) {
      return res.status(400).json({
        success: false,
        error: 'api_key is required',
      });
    }
    
    // Check if provider type exists
    const availableProviders = providerRegistry.getAvailableProviders();
    if (!availableProviders.includes(name)) {
      return res.status(400).json({
        success: false,
        error: `Provider '${name}' is not implemented. Available: ${availableProviders.join(', ')}`,
      });
    }
    
    // Create temporary provider instance with the provided key
    const ProviderClass = providerRegistry.providerClasses[name];
    const tempProvider = new ProviderClass({
      name,
      apiKey: api_key,
    });
    
    // Validate the key
    const isValid = await tempProvider.validateConfig();
    
    res.json({
      success: true,
      valid: isValid,
      provider: name,
    });
  } catch (error) {
    console.error('Error validating provider:', error);
    res.status(500).json({
      success: false,
      valid: false,
      error: 'Validation failed',
      message: error.message,
    });
  }
});

/**
 * PUT /api/providers/:name/config
 * Update provider configuration
 * Body: { api_key?: string, default_model?: string, api_endpoint?: string, options?: Object, is_active?: boolean }
 */
router.put('/:name/config', async (req, res) => {
  try {
    const { name } = req.params;
    const { api_key, default_model, api_endpoint, options, is_active } = req.body;
    
    // Get existing config
    const existing = configRepo.getProviderConfig(name);
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: `Provider '${name}' not found. Initialize it first via seedProviders.js`,
      });
    }
    
    // Update API key if provided
    if (api_key !== undefined) {
      configRepo.updateApiKey(name, api_key);
    }
    
    // Update other fields
    const updates = {};
    if (default_model !== undefined) updates.default_model = default_model;
    if (api_endpoint !== undefined) updates.api_endpoint = api_endpoint;
    if (options !== undefined) updates.options = JSON.stringify(options);
    
    if (Object.keys(updates).length > 0) {
      configRepo.updateProviderConfig(name, updates);
    }
    
    // Toggle active state if requested
    if (is_active !== undefined && is_active !== existing.is_active) {
      configRepo.toggleProviderActive(name);
    }
    
    // Clear cached provider to force reload
    providerRegistry.clearProvider(name);
    
    // Fetch updated config
    const updated = configRepo.getProviderConfig(name);
    
    res.json({
      success: true,
      message: `Provider '${name}' updated successfully`,
      provider: {
        provider_name: updated.provider_name,
        display_name: updated.display_name,
        is_active: updated.is_active,
        default_model: updated.default_model,
        api_endpoint: updated.api_endpoint,
        options: updated.options,
        has_api_key: !!updated.api_key,
      },
    });
  } catch (error) {
    console.error('Error updating provider:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update provider',
      message: error.message,
    });
  }
});

/**
 * DELETE /api/providers/:name/config
 * Remove API key and deactivate provider
 */
router.delete('/:name/config', (req, res) => {
  try {
    const { name } = req.params;
    
    const existing = configRepo.getProviderConfig(name);
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: `Provider '${name}' not found`,
      });
    }
    
    // Remove API key
    configRepo.updateApiKey(name, null);
    
    // Deactivate if active
    if (existing.is_active) {
      configRepo.toggleProviderActive(name);
    }
    
    // Clear cache
    providerRegistry.clearProvider(name);
    
    res.json({
      success: true,
      message: `Provider '${name}' API key removed and provider deactivated`,
    });
  } catch (error) {
    console.error('Error removing provider config:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove provider config',
      message: error.message,
    });
  }
});

module.exports = router;
