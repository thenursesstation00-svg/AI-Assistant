// backend/src/routes/composePrompt.js
const express = require('express');
const router = express.Router();
const { composeSystemPrompt, getActivePersona } = require('../services/personalityOrchestrator');

// Accepts a CFE snapshot and returns a system prompt and persona meta
router.post('/', async (req, res) => {
  try {
    const cfe = req.body;
    const systemPrompt = composeSystemPrompt(cfe);
    const persona = getActivePersona();
    res.json({ system_prompt: systemPrompt, persona });
  } catch (err) {
    console.error('compose_prompt error:', err);
    res.status(500).json({ error: 'Failed to compose system prompt' });
  }
});

module.exports = router;
