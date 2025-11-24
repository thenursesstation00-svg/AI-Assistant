const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// GET /api/admin/reports - list saved archive reports
router.get('/reports', (req, res) => {
  try{
    const reportsRoot = path.resolve(__dirname, '../../backend/archives_report');
    if(!fs.existsSync(reportsRoot)) return res.json({ reports: [] });
    const files = fs.readdirSync(reportsRoot).filter(f => f.endsWith('.json'));
    const reports = files.map(f => {
      try{
        const raw = fs.readFileSync(path.join(reportsRoot, f), 'utf8');
        const obj = JSON.parse(raw || '{}');
        return { file: f, query: obj.query || null, runTime: obj.runTime || null, itemCount: (obj.items && obj.items.length) || 0 };
      }catch(e){
        return { file: f, error: 'invalid_json' };
      }
    });
    res.json({ reports });
  }catch(e){
    console.error('reports list error', e && e.message);
    res.status(500).json({ error: 'server_error' });
  }
});

module.exports = router;

// GET /api/admin/reports/:file - return full report JSON
router.get('/reports/:file', (req, res) => {
  try{
    const reportsRoot = path.resolve(__dirname, '../../backend/archives_report');
    const f = req.params.file;
    const p = path.join(reportsRoot, f);
    if(!fs.existsSync(p)) return res.status(404).json({ error: 'not_found' });
    const raw = fs.readFileSync(p, 'utf8');
    res.setHeader('Content-Type','application/json');
    res.send(raw);
  }catch(e){
    console.error('reports get file error', e && e.message);
    res.status(500).json({ error: 'server_error' });
  }
});

// GET /api/admin/artifacts/:repo/:file - return artifact (meta.json or README.md)
router.get('/artifacts/:repo/:file', (req, res) => {
  try{
    const archivesRoot = path.resolve(__dirname, '../../backend/backend_archives');
    const repo = req.params.repo; // owner__repo
    const file = req.params.file;
    const p = path.join(archivesRoot, repo, file);
    if(!fs.existsSync(p)) return res.status(404).json({ error: 'not_found' });
    const raw = fs.readFileSync(p);
    if(file.toLowerCase().endsWith('.json')) res.setHeader('Content-Type','application/json');
    else res.setHeader('Content-Type','text/plain; charset=utf-8');
    res.send(raw);
  }catch(e){
    console.error('artifact get error', e && e.message);
    res.status(500).json({ error: 'server_error' });
  }
});
