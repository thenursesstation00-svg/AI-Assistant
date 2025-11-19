const express = require('express');
const fs = require('fs');
const path = require('path');
const { likelySecret } = require('../utils/sensitive');
const { gitBranchBackup, gitCommitAll } = require('../utils/gitUtils');
const { execSync } = require('child_process');

const router = express.Router();

const pendingRoot = path.resolve(__dirname, '../../data/pending_patches');
if(!fs.existsSync(pendingRoot)) fs.mkdirSync(pendingRoot, { recursive: true });

// POST /api/admin/upload-patch
// body: { patch: string, description?: string }
router.post('/upload-patch', async (req, res) => {
  try{
    const { patch, description } = req.body || {};
    if(!patch || typeof patch !== 'string') return res.status(400).json({ error: 'missing_patch' });

    // quick sensitive check
    if(likelySecret(patch)){
      const id = `${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
      const payload = { id, patch, description, created_at: new Date().toISOString(), sensitive: true };
      const pfile = path.join(pendingRoot, `${id}.json`);
      fs.writeFileSync(pfile, JSON.stringify(payload, null, 2), 'utf8');
      return res.json({ status: 'pending', id });
    }

    // attempt to apply patch safely using git apply --check first
    const repoRoot = path.resolve(__dirname, '../../');
    const tmpPatch = path.join(pendingRoot, `tmp-${Date.now()}.patch`);
    fs.writeFileSync(tmpPatch, patch, 'utf8');
    try{
      execSync(`git -C "${repoRoot}" apply --check "${tmpPatch}"`, { stdio: 'pipe' });
    }catch(e){
      fs.unlinkSync(tmpPatch);
      return res.status(400).json({ error: 'patch_check_failed', detail: (e && e.message) || String(e) });
    }

    // create backup branch
    const backup = gitBranchBackup(repoRoot, 'upload-patch');
    try{
      execSync(`git -C "${repoRoot}" apply "${tmpPatch}"`, { stdio: 'inherit' });
    }catch(e){
      fs.unlinkSync(tmpPatch);
      return res.status(500).json({ error: 'apply_failed', detail: (e && e.message) || String(e) });
    }
    fs.unlinkSync(tmpPatch);
    const committed = gitCommitAll(repoRoot, `Apply uploaded patch${description?': '+description:''}`);
    return res.json({ status: 'applied', backupBranch: backup, committed });
  }catch(e){
    console.error('upload-patch err', e && e.message);
    res.status(500).json({ error: 'server_error' });
  }
});

module.exports = router;
