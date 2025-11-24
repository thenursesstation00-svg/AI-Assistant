const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');

function safeReadJSON(p){ try{ return JSON.parse(fs.readFileSync(p,'utf8')); }catch(e){ return null; } }
function safeWriteJSON(p,obj){ fs.writeFileSync(p, JSON.stringify(obj, null, 2), 'utf8'); }

function runCommand(cmdPath, args = [], opts = {}){
  return new Promise((resolve) => {
    execFile(cmdPath, args, { timeout: opts.timeout || 60000, maxBuffer: 1024 * 1024 }, (err, stdout, stderr) => {
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
          
          // Parse AV_SCAN_CMD to extract command and arguments
          const cmdEnv = process.env.AV_SCAN_CMD;
          let cmdPath, cmdArgs;
          
          if (cmdEnv.includes('{path}')) {
            // Split command and replace placeholder
            const parts = cmdEnv.split(/\s+/);
            cmdPath = parts[0];
            cmdArgs = parts.slice(1).map(arg => arg.replace(/\{path\}/g, filePath));
          } else {
            // Simple command with file as last argument
            const parts = cmdEnv.split(/\s+/);
            cmdPath = parts[0];
            cmdArgs = parts.slice(1).concat([filePath]);
          }
          
          console.log('AV worker: scanning', filePath, 'with command:', cmdPath, cmdArgs);
          try{
            const { err, stdout, stderr } = await runCommand(cmdPath, cmdArgs, { timeout: 120000 });
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
