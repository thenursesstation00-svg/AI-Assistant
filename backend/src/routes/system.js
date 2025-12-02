const express = require('express');
const router = express.Router();
const { getDatabase } = require('../database/db');
const { collectSystemInfo } = require('../services/systemInfo');

// GET /api/system/info
router.get('/info', async (req, res) => {
  try {
    const info = await collectSystemInfo();
    res.json(info);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to collect system info' });
  }
});

// GET /api/v1/personas
// Note: This route might be mounted under /api/system or /api/v1 depending on server.js
// If mounted under /api/system, it would be /api/system/personas.
// The roadmap says /api/v1/personas. I'll handle that in server.js mounting.
// For now, I'll put the handler here and export it.

router.get('/personas', (req, res) => {
  const db = getDatabase();
  // Assuming we might have a personas table later, but for now we can return hardcoded or from policies
  // Or maybe we query unique persona_ids from persona_policies
  try {
    const personas = db.prepare('SELECT DISTINCT persona_id FROM persona_policies').all();
    res.json({ personas: personas.map(p => p.persona_id) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
