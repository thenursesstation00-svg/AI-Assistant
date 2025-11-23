const express = require('express');
const keyPoolManager = require('../services/keyPoolManager');

const router = express.Router();

/**
 * GET /api/keypool/stats
 * Get statistics for all provider key pools
 */
router.get('/stats', (req, res) => {
  try {
    const stats = keyPoolManager.getAllStats();
    res.json({ success: true, stats });
  } catch (error) {
    console.error('Error getting key pool stats:', error);
    res.status(500).json({ error: 'server_error', details: error.message });
  }
});

/**
 * GET /api/keypool/:provider/status
 * Get detailed status for a specific provider's key pool
 */
router.get('/:provider/status', (req, res) => {
  try {
    const { provider } = req.params;
    const status = keyPoolManager.getPoolStatus(provider);
    
    if (!status) {
      return res.status(404).json({ 
        error: 'not_found', 
        message: `No key pool found for provider: ${provider}` 
      });
    }
    
    res.json({ success: true, provider, status });
  } catch (error) {
    console.error(`Error getting status for ${req.params.provider}:`, error);
    res.status(500).json({ error: 'server_error', details: error.message });
  }
});

/**
 * POST /api/keypool/:provider/reset
 * Reset failure counts for a provider (admin function)
 */
router.post('/:provider/reset', (req, res) => {
  try {
    const { provider } = req.params;
    keyPoolManager.resetFailures(provider);
    res.json({ 
      success: true, 
      message: `Reset failure counts for ${provider}` 
    });
  } catch (error) {
    console.error(`Error resetting ${req.params.provider}:`, error);
    res.status(500).json({ error: 'server_error', details: error.message });
  }
});

module.exports = router;
