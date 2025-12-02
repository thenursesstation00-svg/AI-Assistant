const express = require('express');
const router = express.Router();
const orchestrator = require('../services/agents/orchestrator');

// GET /api/agents - List all agents
router.get('/', (req, res) => {
  try {
    const agents = orchestrator.getAllAgents();
    res.json(agents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/agents - Create and start a new agent
router.post('/', async (req, res) => {
  try {
    const { type, config } = req.body;
    
    if (!type) {
      return res.status(400).json({ error: 'Agent type is required' });
    }

    const agent = orchestrator.createAgent(type, config);
    
    // Start the agent asynchronously (fire and forget from HTTP perspective)
    orchestrator.startAgent(agent.id).catch(err => {
      console.error(`[Agent Error] Agent ${agent.id} failed:`, err);
    });

    res.status(201).json(agent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/agents/:id - Get details for a specific agent
router.get('/:id', (req, res) => {
  try {
    const agent = orchestrator.getAgent(req.params.id);
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    res.json(agent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
