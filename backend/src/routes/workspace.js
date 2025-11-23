// backend/src/routes/workspace.js
// API routes for workspace layout persistence

const express = require('express');
const router = express.Router();
const { getDatabase } = require('../database/db');

/**
 * GET /api/workspace/layout
 * Retrieve saved workspace layout for user
 */
router.get('/layout', (req, res) => {
  try {
    const db = getDatabase();
    // For now, we'll use a default user ID
    // TODO: Replace with authenticated user ID when auth is implemented
    const userId = 'default_user';

    const layout = db.prepare(`
      SELECT layout_data, updated_at 
      FROM layout_configs 
      WHERE user_id = ? 
      ORDER BY updated_at DESC 
      LIMIT 1
    `).get(userId);

    if (layout) {
      res.json({
        success: true,
        layout: JSON.parse(layout.layout_data),
        updatedAt: layout.updated_at
      });
    } else {
      // Return null if no layout saved (will use defaults)
      res.json({
        success: true,
        layout: null
      });
    }
  } catch (error) {
    console.error('Error loading workspace layout:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load workspace layout'
    });
  }
});

/**
 * POST /api/workspace/layout
 * Save workspace layout for user
 * Body: { layout: { lg: [...], md: [...], sm: [...] } }
 */
router.post('/layout', (req, res) => {
  try {
    const db = getDatabase();
    const { layout } = req.body;

    if (!layout || typeof layout !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Invalid layout data'
      });
    }

    // Validate layout structure (should have lg, md, sm breakpoints)
    if (!layout.lg || !layout.md || !layout.sm) {
      return res.status(400).json({
        success: false,
        error: 'Layout must contain lg, md, and sm breakpoints'
      });
    }

    const userId = 'default_user';
    const layoutData = JSON.stringify(layout);
    const timestamp = new Date().toISOString();

    // Check if layout exists for user
    const existing = db.prepare(`
      SELECT id FROM layout_configs WHERE user_id = ?
    `).get(userId);

    if (existing) {
      // Update existing layout
      db.prepare(`
        UPDATE layout_configs 
        SET layout_data = ?, updated_at = ? 
        WHERE user_id = ?
      `).run(layoutData, timestamp, userId);
    } else {
      // Insert new layout
      db.prepare(`
        INSERT INTO layout_configs (user_id, layout_data, created_at, updated_at)
        VALUES (?, ?, ?, ?)
      `).run(userId, layoutData, timestamp, timestamp);
    }

    res.json({
      success: true,
      message: 'Workspace layout saved successfully',
      updatedAt: timestamp
    });
  } catch (error) {
    console.error('Error saving workspace layout:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save workspace layout'
    });
  }
});

/**
 * DELETE /api/workspace/layout
 * Reset workspace layout to defaults (delete saved layout)
 */
router.delete('/layout', (req, res) => {
  try {
    const db = getDatabase();
    const userId = 'default_user';

    const result = db.prepare(`
      DELETE FROM layout_configs WHERE user_id = ?
    `).run(userId);

    res.json({
      success: true,
      message: 'Workspace layout reset to defaults',
      deleted: result.changes > 0
    });
  } catch (error) {
    console.error('Error resetting workspace layout:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reset workspace layout'
    });
  }
});

module.exports = router;
