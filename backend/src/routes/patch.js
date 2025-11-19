const express = require('express');
const fs = require('fs');
const path = require('path');
const { likelySecret } = require('../utils/sensitive');
const { gitBranchBackup, gitCommitAll } = require('../utils/gitUtils');
const axios = require('axios');
const router = express.Router();

const pendingRoot = path.resolve(__dirname, '../../data/pending_patches');
const backupsRoot = path.resolve(__dirname, '../../data/backups');
if(!fs.existsSync(pendingRoot)) fs.mkdirSync(pendingRoot, { recursive: true });
if(!fs.existsSync(backupsRoot)) fs.mkdirSync(backupsRoot, { recursive: true });

function readFileSafe(filePath){
  if(!fs.existsSync(filePath)) return null;
  return fs.readFileSync(filePath, 'utf8');
}

// POST /api/patch/propose
// body: { filePath, newContent }
router.post('/propose', async (req, res) => {
  try{
    const { filePath, newContent } = req.body;
    if(!filePath || typeof newContent !== 'string') return res.status(400).json({ error: 'missing_params' });
    const abs = path.resolve(process.cwd(), filePath);
    const old = readFileSafe(abs);
    return res.json({ filePath: abs, old: old, proposed: newContent });
  }catch(e){
    console.error('propose err', e && e.message);
    res.status(500).json({ error: 'server_error' });
  }
});

// POST /api/patch/apply
// body: { filePath, newContent, autoApplyIfSafe (bool) }
router.post('/apply', async (req, res) => {
  try{
    const { filePath, newContent, autoApplyIfSafe = false } = req.body;
    if(!filePath || typeof newContent !== 'string') return res.status(400).json({ error: 'missing_params' });
    const abs = path.resolve(process.cwd(), filePath);
    const old = readFileSafe(abs) || '';
    const sensitive = likelySecret(newContent) || likelySecret(old);
    if(sensitive && !autoApplyIfSafe){
      // save pending and notify
      const id = `${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
      const payload = { id, filePath: abs, old, newContent, created_at: new Date().toISOString(), sensitive: true };
      const pfile = path.join(pendingRoot, `${id}.json`);
      fs.writeFileSync(pfile, JSON.stringify(payload, null, 2), 'utf8');
      // optional webhook notification
      const notifyUrl = process.env.BACKEND_NOTIFY_URL;
      if(notifyUrl){
        axios.post(notifyUrl, { type: 'pending_patch', id, filePath: abs, created_at: payload.created_at }).catch(e=>{
          console.error('notify failed', e && e.message);
        });
      }
      return res.json({ status: 'pending', id });
    }

    // if git available, create backup branch
    const repoRoot = path.resolve(__dirname, '../../');
    const backupBranch = gitBranchBackup(repoRoot, 'autosave');
    // write file and commit
    fs.writeFileSync(abs, newContent, 'utf8');
    const committed = gitCommitAll(repoRoot, 'Apply patch via API');
    return res.json({ status: 'applied', backupBranch: backupBranch, committed });
  }catch(e){
    console.error('apply err', e && e.message);
    res.status(500).json({ error: 'server_error' });
  }
});

// GET /api/patch/pending
router.get('/pending', async (req, res) => {
  try{
    const files = fs.readdirSync(pendingRoot).filter(f=>f.endsWith('.json'));
    const items = files.map(f => JSON.parse(fs.readFileSync(path.join(pendingRoot,f),'utf8')));
    res.json({ items });
  }catch(e){ console.error('pending list err', e && e.message); res.status(500).json({ error:'server_error'}); }
});

// POST /api/patch/pending/:id/approve
// require admin role to approve pending patches when role-based keys are used
const requireRole = require('../middleware/apiKeyAuth').requireRole || (()=> (req,res,next)=>next());
router.post('/pending/:id/approve', requireRole('admin'), async (req, res) => {
  try{
    const id = req.params.id;
    const file = path.join(pendingRoot, `${id}.json`);
    if(!fs.existsSync(file)) return res.status(404).json({ error: 'not_found' });
    const payload = JSON.parse(fs.readFileSync(file,'utf8'));
    const abs = payload.filePath;
    const old = payload.old || '';
    const newContent = payload.newContent;
    const repoRoot = path.resolve(__dirname, '../../');
    const backupBranch = gitBranchBackup(repoRoot, 'pending-approve');
    fs.writeFileSync(abs, newContent, 'utf8');
    const committed = gitCommitAll(repoRoot, `Apply approved pending patch ${id}`);
    fs.unlinkSync(file);
    return res.json({ status: 'applied', backupBranch, committed });
  }catch(e){ console.error('approve err', e && e.message); res.status(500).json({ error:'server_error'}); }
});

// POST /api/patch/pending/:id/reject
router.post('/pending/:id/reject', async (req, res) => {
  try{
    const id = req.params.id;
    const file = path.join(pendingRoot, `${id}.json`);
    if(!fs.existsSync(file)) return res.status(404).json({ error: 'not_found' });
    fs.unlinkSync(file);
    return res.json({ status: 'rejected' });
  }catch(e){ console.error('reject err', e && e.message); res.status(500).json({ error:'server_error'}); }
});

module.exports = router;
