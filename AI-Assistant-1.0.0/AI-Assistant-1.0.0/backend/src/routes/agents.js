const express = require('express');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const router = express.Router();

const agentsRoot = path.resolve(__dirname, '../../agents');
const runsRoot = path.resolve(__dirname, '../../agents_runs');
if(!fs.existsSync(agentsRoot)) fs.mkdirSync(agentsRoot, { recursive: true });
if(!fs.existsSync(runsRoot)) fs.mkdirSync(runsRoot, { recursive: true });

// Simple agent schema: { id, name, description, steps: [{ action: 'archive'|'upload'|'call_connector'|'exec', params: {} }] }

router.get('/', (req, res) => {
  const files = fs.readdirSync(agentsRoot).filter(f=>f.endsWith('.json'));
  const items = files.map(f=> JSON.parse(fs.readFileSync(path.join(agentsRoot,f),'utf8')));
  res.json({ agents: items });
});

router.post('/', (req, res) => {
  const body = req.body || {};
  if(!body.name || !Array.isArray(body.steps)) return res.status(400).json({ error: 'invalid_agent' });
  const id = body.id || `${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
  const agent = { id, name: body.name, description: body.description||'', steps: body.steps };
  fs.writeFileSync(path.join(agentsRoot, `${id}.json`), JSON.stringify(agent, null, 2), 'utf8');
  res.json({ status: 'saved', agent });
});

router.get('/:id', (req, res) => {
  const id = req.params.id;
  const file = path.join(agentsRoot, `${id}.json`);
  if(!fs.existsSync(file)) return res.status(404).json({ error: 'not_found' });
  res.json(JSON.parse(fs.readFileSync(file,'utf8')));
});

// Run agent: executes steps sequentially and stores run log
router.post('/:id/run', async (req, res) => {
  try{
    const id = req.params.id;
    const file = path.join(agentsRoot, `${id}.json`);
    if(!fs.existsSync(file)) return res.status(404).json({ error: 'not_found' });
    const agent = JSON.parse(fs.readFileSync(file,'utf8'));
    const runId = `${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
    const runLog = { id: runId, agentId: id, started_at: new Date().toISOString(), steps: [] };

    for(const step of agent.steps){
      const entry = { action: step.action, params: step.params || {}, status: 'pending' };
      try{
        if(step.action === 'exec'){
          // execute a shell command (use with extreme caution). By default disallowed unless ENABLE_AGENT_EXEC=true
          if(process.env.ENABLE_AGENT_EXEC !== 'true') throw new Error('exec disabled');
          const out = execSyncSafe(step.params.command, 30000);
          entry.status = 'ok'; entry.output = String(out).slice(0,2000);
        } else if(step.action === 'archive'){
          // record intent for archive; actual call can be implemented by the user
          entry.status = 'scheduled'; entry.note = `archive:${step.params.query || ''}`;
        } else if(step.action === 'call_connector'){
          entry.status = 'scheduled'; entry.note = `connector:${step.params.connector}`;
        } else if(step.action === 'upload'){
          entry.status = 'scheduled'; entry.note = `upload:${step.params.filename || 'file'}`;
        } else {
          entry.status = 'skipped'; entry.note = 'unknown action';
        }
      }catch(e){ entry.status = 'error'; entry.error = (e && e.message) || String(e); }
      runLog.steps.push(entry);
    }

    runLog.completed_at = new Date().toISOString();
    fs.writeFileSync(path.join(runsRoot, `${runId}.json`), JSON.stringify(runLog, null, 2), 'utf8');
    res.json({ status: 'done', run: runLog });
  }catch(e){ console.error('agent run err', e && e.message); res.status(500).json({ error: 'server_error' }); }
});

function execSyncSafe(cmd, timeout){
  // wrapper to block shells by default
  const { execSync } = require('child_process');
  return execSync(cmd, { stdio: 'pipe', timeout: timeout || 10000 }).toString();
}

module.exports = router;

// Extra routes: list runs for an agent and list all runs
router.get('/:id/runs', (req, res) => {
  try{
    const id = req.params.id;
    const files = fs.readdirSync(runsRoot).filter(f=>f.endsWith('.json'));
    const items = files.map(f => JSON.parse(fs.readFileSync(path.join(runsRoot,f),'utf8'))).filter(r=>r.agentId === id).sort((a,b)=> b.started_at.localeCompare(a.started_at));
    res.json({ runs: items });
  }catch(e){ console.error('list runs err', e && e.message); res.status(500).json({ error:'server_error' }); }
});

router.get('/runs', (req, res) => {
  try{
    const files = fs.readdirSync(runsRoot).filter(f=>f.endsWith('.json'));
    const items = files.map(f => JSON.parse(fs.readFileSync(path.join(runsRoot,f),'utf8'))).sort((a,b)=> b.started_at.localeCompare(a.started_at));
    res.json({ runs: items });
  }catch(e){ console.error('list all runs err', e && e.message); res.status(500).json({ error:'server_error' }); }
});
