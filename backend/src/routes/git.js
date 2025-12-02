const express = require('express');
const router = express.Router();
const gitService = require('../services/gitService');

router.get('/status', async (req, res) => {
  try {
    const changes = await gitService.getStatus();
    res.json({ success: true, changes });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/commit', async (req, res) => {
  const message = (req.body && req.body.message) || '';
  if (!message.trim()) {
    return res.status(400).json({ success: false, error: 'Commit message required' });
  }

  try {
    const output = await gitService.commitAll(message);
    res.json({ success: true, output });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post('/pull', async (req, res) => {
  try {
    const output = await gitService.pull();
    res.json({ success: true, output });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post('/push', async (req, res) => {
  try {
    const output = await gitService.push();
    res.json({ success: true, output });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

module.exports = router;