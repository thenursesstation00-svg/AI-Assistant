const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

function safeReadJSON(p){ try{ return JSON.parse(fs.readFileSync(p,'utf8')); }catch(e){ return null; } }
function safeWriteJSON(p,obj){ fs.writeFileSync(p, JSON.stringify(obj, null, 2), 'utf8'); }

function runCommand(cmd, opts = {}){
  return new Promise((resolve) => {
    exec(cmd, { timeout: opts.timeout || 60000, maxBuffer: 1024 * 1024 }, (err, stdout, stderr) => {
      resolve({ err, stdout: stdout && String(stdout), stderr: stderr && String(stderr) });
    });
  });
}

function startAvWorker({ metaRoot, intervalMs = 15000 } = {}){
  if(!process.env.AV_SCAN_CMD){
    console.log('AV worker: AV_SCAN_CMD not set; worker disabled');
    return { stop: ()=>{} };
  }
  metaRoot = metaRoot || path.resolve(__dirname, '../../uploads/meta');
  if(!fs.existsSync(metaRoot)) fs.mkdirSync(metaRoot, { recursive: true });

  let running = true;
  async function loopOnce(){
    try{
      const files = fs.readdirSync(metaRoot).filter(f => f.endsWith('.json'));
      for(const f of files){
        if(!running) break;
        const p = path.join(metaRoot, f);
        const meta = safeReadJSON(p);
        if(!meta) continue;
        const scan = meta.scan || {};
        if(scan.status === 'queued'){
          // claim it
          meta.scan = { status: 'scanning', started_at: new Date().toISOString() };
          safeWriteJSON(p, meta);
          const filePath = meta.path;
          let cmd = process.env.AV_SCAN_CMD;
          if(cmd.includes('{path}')) cmd = cmd.replace(/\{path\}/g, filePath);
          else cmd = `${cmd} "${filePath}"`;
          console.log('AV worker: scanning', filePath);
          try{
            const { err, stdout, stderr } = await runCommand(cmd, { timeout: 120000 });
            if(err){
              meta.scan = { status: 'failed', error: err.message || String(err), output: (stdout||'') + (stderr||''), finished_at: new Date().toISOString() };
            } else {
              // success; many scanners return non-empty stdout for findings — keep output but mark ok
              meta.scan = { status: 'ok', output: (stdout||'') + (stderr||''), finished_at: new Date().toISOString() };
            }
          }catch(e){
            meta.scan = { status: 'failed', error: e && e.message, finished_at: new Date().toISOString() };
          }
          safeWriteJSON(p, meta);
        }
      }
    }catch(e){ console.error('AV worker loop err', e && e.message); }
  }

  const handle = setInterval(() => { loopOnce(); }, intervalMs);
  // run immediately once
  loopOnce();
  return {
    stop: () => { running = false; clearInterval(handle); }
  };
}

module.exports = { startAvWorker };
