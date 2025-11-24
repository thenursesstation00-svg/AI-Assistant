const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const router = express.Router();
const requireRole = require('../middleware/apiKeyAuth').requireRole || (()=> (req,res,next)=>next());

const dataRoot = path.resolve(__dirname, '../../data');
if(!fs.existsSync(dataRoot)) fs.mkdirSync(dataRoot, { recursive: true });
const keysFile = path.join(dataRoot, 'api_keys.json');
function load(){ try{ if(!fs.existsSync(keysFile)) return []; return JSON.parse(fs.readFileSync(keysFile,'utf8')||'[]'); }catch(e){ return []; } }
function save(items){ fs.writeFileSync(keysFile, JSON.stringify(items, null, 2), 'utf8'); }

// GET /api/admin/api-keys
router.get('/api-keys', requireRole('admin'), (req, res) => {
  const items = load();
  res.json({ items });
});

// POST /api/admin/api-keys { role }
router.post('/api-keys', requireRole('admin'), (req, res) => {
  try{
    const { role = 'admin' } = req.body || {};
    const key = crypto.randomBytes(24).toString('hex');
    const id = Date.now() + '-' + Math.random().toString(36).slice(2,8);
    const item = { id, key, role, created_at: new Date().toISOString() };
    const items = load();
    items.push(item);
    save(items);
    // return created key once
    res.json({ item });
  }catch(e){ console.error('create api key err', e && e.message); res.status(500).json({ error: 'server_error' }); }
});

module.exports = router;
