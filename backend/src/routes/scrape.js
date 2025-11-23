// backend/src/routes/scrape.js
// Web scraping API endpoints

const express = require('express');
const router = express.Router();
const scraper = require('../services/scraper');

/**
 * POST /api/scrape
 * Scrape a single URL
 * Body: { url, options }
 */
router.post('/', async (req, res) => {
  try {
    if (!scraper.isAvailable()) {
      return res.status(503).json({
        success: false,
        error: 'Scraping service not available. Install Puppeteer: npm install puppeteer'
      });
    }

    const { url, options = {} } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'URL is required'
      });
    }

    // Validate URL
    try {
      new URL(url);
    } catch (e) {
      return res.status(400).json({
        success: false,
        error: 'Invalid URL format'
      });
    }

    const result = await scraper.scrapeUrl(url, options);
    res.json(result);

  } catch (error) {
    console.error('Scrape error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/scrape/multiple
 * Scrape multiple URLs
 * Body: { urls, options }
 */
router.post('/multiple', async (req, res) => {
  try {
    if (!scraper.isAvailable()) {
      return res.status(503).json({
        success: false,
        error: 'Scraping service not available'
      });
    }

    const { urls, options = {} } = req.body;

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'URLs array is required'
      });
    }

    if (urls.length > 10) {
      return res.status(400).json({
        success: false,
        error: 'Maximum 10 URLs allowed per request'
      });
    }

    const results = await scraper.scrapeMultiple(urls, options);
    res.json({
      success: true,
      results
    });

  } catch (error) {
    console.error('Multiple scrape error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/scrape/links
 * Extract all links from a URL
 * Body: { url }
 */
router.post('/links', async (req, res) => {
  try {
    if (!scraper.isAvailable()) {
      return res.status(503).json({
        success: false,
        error: 'Scraping service not available'
      });
    }

    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'URL is required'
      });
    }

    const result = await scraper.extractLinks(url);
    res.json(result);

  } catch (error) {
    console.error('Link extraction error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/scrape/status
 * Check if scraping service is available
 */
router.get('/status', (req, res) => {
  res.json({
    available: scraper.isAvailable(),
    service: scraper.isAvailable() ? 'puppeteer' : 'none'
  });
});

module.exports = router;
