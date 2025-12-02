const express = require('express');
const router = express.Router();
const terminalAgent = require('../services/ai/terminalAgent');
const providerRegistry = require('../services/providers/registry');

// POST /api/ai/terminal/plan
// Generates a plan/command for a natural language request
router.post('/terminal/plan', async (req, res) => {
  const { prompt, context } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt required' });

  try {
    const plan = await terminalAgent.plan(prompt, context || {});
    res.json({ command: plan.command, plan });
  } catch (err) {
    console.error('Terminal plan error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/ai/terminal/agent
// Generates a plan and optionally executes it
router.post('/terminal/agent', async (req, res) => {
  const { prompt, context, autoExecute = true } = req.body || {};
  if (!prompt) return res.status(400).json({ error: 'Prompt required' });

  try {
    const result = await terminalAgent.planAndExecute(prompt, { context: context || {}, autoExecute });
    res.json({ success: true, ...result });
  } catch (err) {
    console.error('Terminal agent error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/ai/git/commit-message
// Generates a commit message based on diff
router.post('/git/commit-message', async (req, res) => {
  const { diff } = req.body;
  if (!diff) return res.status(400).json({ error: 'Diff required' });

  try {
    const { provider } = await providerRegistry.getDefaultProvider();
    if (!provider) {
      return res.status(503).json({ error: 'No AI provider configured' });
    }

    const systemPrompt = `You are an expert git commit message generator.
    Follow Conventional Commits format (type(scope): subject).
    Output ONLY the commit message.`;

    const response = await provider.sendMessage([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Generate a commit message for this diff:\n\n${diff.substring(0, 5000)}` }
    ]);

    res.json({ message: response.content });
  } catch (err) {
    console.error('Commit message error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
