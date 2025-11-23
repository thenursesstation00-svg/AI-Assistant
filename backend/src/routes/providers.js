// backend/src/routes/providers.js
// AI Provider management endpoints

const express = require('express');
const router = express.Router();
const providerRegistry = require('../services/ai/registry');

// GET /api/providers - List all available providers
router.get('/', (req, res) => {
  try {
    const providers = providerRegistry.list();
    res.json({ providers });
  } catch (error) {
    console.error('Error listing providers:', error);
    res.status(500).json({ error: 'server_error', message: error.message });
  }
});

// GET /api/providers/:name - Get specific provider details
router.get('/:name', (req, res) => {
  try {
    const { name } = req.params;
    
    if (!providerRegistry.has(name)) {
      return res.status(404).json({ error: 'provider_not_found' });
    }

    const provider = providerRegistry.get(name);
    const models = provider.getSupportedModels();
    const configured = provider.isConfigured();

    res.json({
      name,
      configured,
      models
    });
  } catch (error) {
    console.error('Error getting provider:', error);
    res.status(500).json({ error: 'server_error', message: error.message });
  }
});

// POST /api/providers/validate - Validate all providers
router.post('/validate', async (req, res) => {
  try {
    const results = await providerRegistry.validateAll();
    res.json({ validation: results });
  } catch (error) {
    console.error('Error validating providers:', error);
    res.status(500).json({ error: 'server_error', message: error.message });
  }
});

// POST /api/providers/:name/validate - Validate specific provider
router.post('/:name/validate', async (req, res) => {
  try {
    const { name } = req.params;
    
    if (!providerRegistry.has(name)) {
      return res.status(404).json({ error: 'provider_not_found' });
    }

    const provider = providerRegistry.get(name);
    
    if (!provider.isConfigured()) {
      return res.status(400).json({ error: 'provider_not_configured' });
    }

    const isValid = await provider.validateConnection();
    
    res.json({ 
      provider: name,
      valid: isValid
    });
  } catch (error) {
    console.error('Error validating provider:', error);
    res.status(500).json({ error: 'server_error', message: error.message });
  }
});

// POST /api/providers/chat - Send chat to specified provider
router.post('/chat', async (req, res) => {
  try {
    const { provider, messages, options = {} } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages_required' });
    }

    const response = await providerRegistry.chat(provider, messages, options);
    
    res.json(response);
  } catch (error) {
    console.error('Error in provider chat:', error);
    res.status(500).json({ error: 'server_error', message: error.message });
  }
});

module.exports = router;
