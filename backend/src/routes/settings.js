const express = require('express');
const router = express.Router();
const { getDatabase } = require('../database/db');

// GET /api/settings
router.get('/', (req, res) => {
  const db = getDatabase();
  try {
    const settings = db.prepare('SELECT * FROM ui_preferences').all();
    // Convert to object
    const settingsObj = settings.reduce((acc, curr) => {
      acc[curr.preference_key] = curr.preference_value;
      return acc;
    }, {});
    res.json(settingsObj);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/settings
router.post('/', (req, res) => {
  const db = getDatabase();
  const { key, value } = req.body;
  if (!key || value === undefined) {
    return res.status(400).json({ error: 'Missing key or value' });
  }
  
  try {
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO ui_preferences (preference_key, preference_value, updated_at)
      VALUES (?, ?, datetime('now'))
    `);
    stmt.run(key, String(value));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
