const express = require('express');
const { searchNormalized } = require('../services/searchProvider');

const router = express.Router();

// Simple per-IP in-memory rate limiter for search route to avoid excessive provider calls
const RATE_LIMIT_WINDOW_MS = parseInt(process.env.SEARCH_RATE_WINDOW_MS || '60000', 10); // 1 minute
const RATE_LIMIT_MAX = parseInt(process.env.SEARCH_RATE_MAX || '5', 10); // 5 reqs per window
const rlMap = new Map();

function isRateLimited(ip){
  const now = Date.now();
  const entry = rlMap.get(ip) || { ts: now, count: 0 };
  if(now - entry.ts > RATE_LIMIT_WINDOW_MS){
    entry.ts = now; entry.count = 1;
    rlMap.set(ip, entry);
    return false;
  }
  entry.count += 1;
  rlMap.set(ip, entry);
  return entry.count > RATE_LIMIT_MAX;
}

router.get('/', async (req, res) => {
  const q = req.query.q;
  if(!q) return res.status(400).json({ error: 'query required' });

  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  if(isRateLimited(ip)) return res.status(429).json({ error: 'rate_limited', message: 'Too many search requests, slow down' });

  try{
    const data = await searchNormalized(q, { hl: req.query.hl });
    res.json(data);
  }catch(e){
    console.error('search error', e && e.message);
    res.status(500).json({ error: 'search_failed', details: e && e.message });
  }
});

module.exports = router;
