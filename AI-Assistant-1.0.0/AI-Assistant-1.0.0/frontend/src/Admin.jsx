import React, { useState } from 'react';
import { API_URL } from './api';

export default function Admin(){
  const [query, setQuery] = useState('ai assistant');
  const [results, setResults] = useState(null);
  const [save, setSave] = useState(true);
  const [autoClone, setAutoClone] = useState(false);
  const [message, setMessage] = useState('');
  const [reports, setReports] = useState([]);
    const [uploads, setUploads] = useState([]);
    const [fileToUpload, setFileToUpload] = useState(null);
    const [pendingPatches, setPendingPatches] = useState([]);
    const [agents, setAgents] = useState([]);
    const [agentName, setAgentName] = useState('');
    const [agentStepsText, setAgentStepsText] = useState('');
    const [agentRuns, setAgentRuns] = useState([]);
    const [selectedRun, setSelectedRun] = useState(null);
    const [apiKeys, setApiKeys] = useState([]);

  async function runArchive(){
    setMessage('Running search...');
    const key = prompt('Enter BACKEND_API_KEY for this session');
    const res = await fetch(`${API_URL}/api/admin/archive`, { method:'POST', headers:{'Content-Type':'application/json','x-api-key': key}, body: JSON.stringify({ query, per_page: 5, fetch_readme: true, save, auto_clone: autoClone }) });
    const data = await res.json();
    setResults(data);
    setMessage('Done');
  }

  async function loadReports(){
    const key = prompt('Enter BACKEND_API_KEY to list reports');
    const res = await fetch(`${API_URL}/api/admin/reports`, { headers: { 'x-api-key': key } });
    const data = await res.json();
    setReports(data.reports || []);
  }

  async function viewReport(file){
    const key = prompt('Enter BACKEND_API_KEY to view report');
    const res = await fetch(`${API_URL}/api/admin/reports/${encodeURIComponent(file)}`, { headers: { 'x-api-key': key } });
    if(!res.ok){ setMessage('Could not fetch report'); return; }
    const data = await res.json();
    setResults(data);
    setMessage('Loaded report: '+file);
  }

    async function listUploads(){
      const key = prompt('Enter BACKEND_API_KEY to list uploads');
      const res = await fetch(`${API_URL}/api/admin/uploads`, { headers: { 'x-api-key': key } });
      if(!res.ok){ setMessage('Could not list uploads'); return; }
      const data = await res.json();
      setUploads(data.items || []);
    }

    async function listApiKeys(){
      const key = prompt('Enter BACKEND_API_KEY to list API keys');
      const res = await fetch(`${API_URL}/api/admin/api-keys`, { headers: { 'x-api-key': key } });
      if(!res.ok){ setMessage('Could not list API keys'); return; }
      const data = await res.json();
      setApiKeys(data.items || []);
    }

    async function createApiKey(role){
      const key = prompt('Enter BACKEND_API_KEY to create API key');
      const res = await fetch(`${API_URL}/api/admin/api-keys`, { method: 'POST', headers: { 'x-api-key': key, 'Content-Type':'application/json' }, body: JSON.stringify({ role }) });
      if(!res.ok){ setMessage('Could not create API key'); return; }
      const data = await res.json();
      setMessage('Created key: '+data.item.key);
      listApiKeys();
    }

    async function listPendingPatches(){
      const key = prompt('Enter BACKEND_API_KEY to list pending patches');
      const res = await fetch(`${API_URL}/api/patch/pending`, { headers: { 'x-api-key': key } });
      if(!res.ok){ setMessage('Could not list pending patches'); return; }
      const data = await res.json();
      setPendingPatches(data.items || []);
    }

    async function approvePending(id){
      const key = prompt('Enter BACKEND_API_KEY to approve');
      const res = await fetch(`${API_URL}/api/patch/pending/${encodeURIComponent(id)}/approve`, { method: 'POST', headers: { 'x-api-key': key } });
      if(!res.ok){ setMessage('Approve failed'); return; }
      setMessage('Approved '+id);
      listPendingPatches();
    }

    async function rejectPending(id){
      const key = prompt('Enter BACKEND_API_KEY to reject');
      const res = await fetch(`${API_URL}/api/patch/pending/${encodeURIComponent(id)}/reject`, { method: 'POST', headers: { 'x-api-key': key } });
      if(!res.ok){ setMessage('Reject failed'); return; }
      setMessage('Rejected '+id);
      listPendingPatches();
    }

    async function uploadFile(){
      if(!fileToUpload){ setMessage('Select a file first'); return; }
      const key = prompt('Enter BACKEND_API_KEY to upload');
      const fd = new FormData();
      fd.append('file', fileToUpload);
      const res = await fetch(`${API_URL}/api/admin/upload-file`, { method: 'POST', headers: { 'x-api-key': key }, body: fd });
      if(!res.ok){ setMessage('Upload failed'); return; }
      const data = await res.json();
      setMessage('Uploaded: '+data.meta.filename);
      listUploads();
    }

  async function fetchArtifact(repo, file){
    const key = prompt('Enter BACKEND_API_KEY to fetch artifact');
    const res = await fetch(`${API_URL}/api/admin/artifacts/${encodeURIComponent(repo)}/${encodeURIComponent(file)}`, { headers: { 'x-api-key': key } });
    if(!res.ok){ setMessage('Could not fetch artifact'); return; }
    const text = await res.text();
    setMessage(`Artifact ${file} for ${repo}:\n`+text.slice(0,200));
  }

  async function listAgents(){
    const key = prompt('Enter BACKEND_API_KEY to list agents');
    const res = await fetch(`${API_URL}/api/admin/agents`, { headers: { 'x-api-key': key } });
    if(!res.ok){ setMessage('Could not list agents'); return; }
    const data = await res.json();
    setAgents(data.agents || []);
  }

  async function createAgent(){
    if(!agentName) { setMessage('Agent needs a name'); return; }
    try{
      const steps = JSON.parse(agentStepsText || '[]');
      const key = prompt('Enter BACKEND_API_KEY to create agent');
      const res = await fetch(`${API_URL}/api/admin/agents`, { method: 'POST', headers: { 'x-api-key': key, 'Content-Type':'application/json' }, body: JSON.stringify({ name: agentName, steps }) });
      const data = await res.json();
      setMessage('Agent created: '+data.agent.id);
      listAgents();
    }catch(e){ setMessage('Invalid steps JSON'); }
  }

  async function runAgent(id){
    const key = prompt('Enter BACKEND_API_KEY to run agent');
    const res = await fetch(`${API_URL}/api/admin/agents/${encodeURIComponent(id)}/run`, { method: 'POST', headers: { 'x-api-key': key } });
    if(!res.ok){ setMessage('Could not run agent'); return; }
    const data = await res.json();
    setMessage('Agent run started: '+data.run.id);
  }

  async function listAgentRuns(id){
    const key = prompt('Enter BACKEND_API_KEY to list runs');
    const res = await fetch(`${API_URL}/api/admin/agents/${encodeURIComponent(id)}/runs`, { headers: { 'x-api-key': key } });
    if(!res.ok){ setMessage('Could not list runs'); return; }
    const data = await res.json();
    setAgentRuns(data.runs || []);
  }

  async function viewRun(id){
    const key = prompt('Enter BACKEND_API_KEY to view run');
    const res = await fetch(`${API_URL}/api/admin/agents/runs`, { headers: { 'x-api-key': key } });
    if(!res.ok){ setMessage('Could not fetch runs'); return; }
    const data = await res.json();
    const found = (data.runs||[]).find(r=>r.id===id);
    setSelectedRun(found || null);
  }

  return (
    <div style={{marginTop:20}}>
      <h2>Admin / Archive</h2>
      <div>
        <input value={query} onChange={e=>setQuery(e.target.value)} />
        <label style={{marginLeft:8}}><input type="checkbox" checked={save} onChange={e=>setSave(e.target.checked)} /> Save</label>
        <label style={{marginLeft:8}}><input type="checkbox" checked={autoClone} onChange={e=>setAutoClone(e.target.checked)} /> Auto-clone permissive</label>
        <button onClick={runArchive} style={{marginLeft:8}}>Search GitHub</button>
      </div>
      <div style={{marginTop:8}}>
        <button onClick={loadReports}>List Saved Reports</button>
          <button style={{marginLeft:8}} onClick={listUploads}>List Uploads</button>
        <button style={{marginLeft:8}} onClick={listPendingPatches}>List Pending Patches</button>
      </div>
        <div style={{marginTop:8}}>
          <input type="file" onChange={e=>setFileToUpload(e.target.files[0])} />
          <button onClick={uploadFile} style={{marginLeft:8}}>Upload File</button>
        </div>
        <div style={{marginTop:8}}>
          <h4>API Keys</h4>
          <button onClick={()=>listApiKeys()}>List API Keys</button>
          <button style={{marginLeft:8}} onClick={()=>createApiKey('admin')}>Create Admin Key</button>
          <button style={{marginLeft:8}} onClick={()=>createApiKey('viewer')}>Create Viewer Key</button>
          {apiKeys.length>0 && <ul>
            {apiKeys.map(k=> (
              <li key={k.id}><strong>{k.role}</strong> — {k.key} — {k.created_at}</li>
            ))}
          </ul>}
        </div>
        <div style={{marginTop:12}}>
          <h3>Agents</h3>
          <div>
            <input placeholder="Agent name" value={agentName} onChange={e=>setAgentName(e.target.value)} />
            <button onClick={createAgent} style={{marginLeft:8}}>Create Agent</button>
            <button onClick={listAgents} style={{marginLeft:8}}>List Agents</button>
          </div>
          <div style={{marginTop:8}}>
            <textarea placeholder='Agent steps as JSON array (e.g. [{"action":"archive","params":{"query":"ai assistant"}}])' rows={6} cols={60} value={agentStepsText} onChange={e=>setAgentStepsText(e.target.value)} />
          </div>
          {agents.length>0 && <ul>
            {agents.map(a=> (
              <li key={a.id}>{a.name} — <button onClick={()=>runAgent(a.id)}>Run</button></li>
            ))}
          </ul>}
          {agents.length>0 && <div style={{marginTop:8}}>
            <h4>Agent Runs</h4>
            <ul>
              {agents.map(a=> (
                <li key={a.id} style={{marginBottom:6}}>
                  <strong>{a.name}</strong> — <button onClick={()=>listAgentRuns(a.id)}>List Runs</button>
                  <div style={{marginLeft:12}}>
                    {(agentRuns||[]).filter(r=>r.agentId===a.id).map(run=> (
                      <div key={run.id}>
                        <span style={{fontSize:12}}>{run.id} — {run.started_at}</span>
                        <button style={{marginLeft:8}} onClick={()=>viewRun(run.id)}>View</button>
                      </div>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </div>}
          {selectedRun && <div style={{marginTop:12}}>
            <h4>Run {selectedRun.id}</h4>
            <div>Agent: {selectedRun.agentId}</div>
            <div>Started: {selectedRun.started_at}</div>
            <div>Completed: {selectedRun.completed_at}</div>
            <button style={{marginBottom:8}} onClick={()=>{
              const blob = new Blob([JSON.stringify(selectedRun,null,2)],{type:'application/json'});
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url; a.download = `agent_run_${selectedRun.id}.json`;
              document.body.appendChild(a); a.click(); setTimeout(()=>{document.body.removeChild(a);URL.revokeObjectURL(url);},500);
            }}>Download Run JSON</button>
            <h5>Timeline</h5>
            <ul>
              {selectedRun.steps.map((s,i)=> (
                <li key={i} style={{marginBottom:8}}>
                  <div><strong>{s.action}</strong> — {s.status} {s.started_at ? `— ${s.started_at}` : ''} {s.completed_at ? `→ ${s.completed_at}` : ''}</div>
                  {s.stdout && <div style={{color:'#080',fontSize:12}}><strong>stdout:</strong> <pre style={{whiteSpace:'pre-wrap',maxHeight:100,overflow:'auto'}}>{s.stdout}</pre></div>}
                  {s.stderr && <div style={{color:'#800',fontSize:12}}><strong>stderr:</strong> <pre style={{whiteSpace:'pre-wrap',maxHeight:100,overflow:'auto'}}>{s.stderr}</pre></div>}
                  {s.output && <div style={{fontSize:12}}><strong>output:</strong> <pre style={{whiteSpace:'pre-wrap',maxHeight:100,overflow:'auto'}}>{s.output}</pre></div>}
                </li>
              ))}
            </ul>
          </div>}
        </div>
      {message && <div>{message}</div>}
      {results && <div>
        <div>Found: {results.total_count}</div>
        <ul>
          {(results.items||[]).map((it,i)=> {
            const repoKey = (it.full_name || '').replace('/', '__');
            return (
              <li key={i} style={{marginBottom:6}}>
                <a href={it.url} target='_blank' rel='noreferrer'>{it.full_name}</a>
                <div style={{fontSize:12,color:'#666'}}> {it.license?.name||'no license'} — permissive: {String(it.permissive)} — stars: {it.stars}</div>
                <div style={{marginTop:4}}>
                  {it.readme && <button onClick={()=>fetchArtifact(repoKey,'README.md')}>View README</button>}
                  <button style={{marginLeft:8}} onClick={()=>fetchArtifact(repoKey,'meta.json')}>View meta.json</button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>}
      {reports.length>0 && <div style={{marginTop:12}}>
        <h3>Saved Reports</h3>
        <ul>
          {reports.map(r=> (
            <li key={r.file}>
              <strong style={{cursor:'pointer', color:'blue'}} onClick={()=>viewReport(r.file)}>{r.file}</strong>
               — query: {r.query} — items: {r.itemCount}
            </li>
          ))}
        </ul>
      </div>}
        {uploads.length>0 && <div style={{marginTop:12}}>
          <h3>Uploaded Files</h3>
          <ul>
            {uploads.map(u=> (
              <li key={u.filename}>
                <a href={`${API_URL}/api/admin/uploads/${encodeURIComponent(u.filename)}`} target="_blank" rel="noreferrer">{u.originalname}</a>
                 — {u.mimetype} — {u.size} bytes — {u.uploaded_at}
                 <div style={{fontSize:12,color:'#444'}}>Scan: {u.scan?.status || 'unknown'} {u.scan?.finished_at ? ` — ${u.scan.finished_at}` : ''}</div>
              </li>
            ))}
          </ul>
        </div>}
        {pendingPatches.length>0 && <div style={{marginTop:12}}>
          <h3>Pending Patches</h3>
          <ul>
            {pendingPatches.map(p=> (
              <li key={p.id} style={{marginBottom:8}}>
                <div><strong>{p.id}</strong> — {p.filePath}</div>
                <div style={{fontSize:12}}>{p.created_at} — sensitive: {String(p.sensitive)}</div>
                <div style={{marginTop:4}}>
                  <button onClick={()=>approvePending(p.id)}>Approve</button>
                  <button style={{marginLeft:8}} onClick={()=>rejectPending(p.id)}>Reject</button>
                </div>
              </li>
            ))}
          </ul>
        </div>}
    </div>
  );
}
