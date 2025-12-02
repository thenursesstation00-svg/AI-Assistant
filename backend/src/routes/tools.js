const express = require('express');
const router = express.Router();
const toolRegistry = require('../services/tools/registry');

router.get('/', (req, res) => {
  try {
    const tools = toolRegistry.list();
    res.json(tools);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:name/execute', async (req, res) => {
  const { name } = req.params;
  const { args } = req.body;
  
  // Get persona from request (assuming middleware sets it, or default)
  const context = {
    personaId: req.apiKeyRole || 'default',
    user: req.user
  };

  try {
    const result = await toolRegistry.execute(name, args || {}, context);
    res.json({ success: true, result });
  } catch (error) {
    console.error(`Tool execution error (${name}):`, error);
    res.status(400).json({ 
      success: false, 
      error: error.message 
    });
  }
});

module.exports = router;
