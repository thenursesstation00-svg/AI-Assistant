import React, { useState, useEffect } from 'react';
import { getBackendApiKeyAsync, setBackendApiKeyAsync } from './config';

export default function Settings(){
  const [key, setKey] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(()=>{
    let mounted = true;
    (async ()=>{
      const k = await getBackendApiKeyAsync();
      if(mounted) setKey(k || '');
    })();
    return ()=>{ mounted = false };
  },[]);

  async function save(){
    await setBackendApiKeyAsync(key || '');
    setSaved(true);
    setTimeout(()=>setSaved(false), 2000);
  }

  return (
    <div style={{ padding: 12, border: '1px solid #ddd', marginBottom: 12 }}>
      <h3>App Settings</h3>
      <label>Backend API Key (x-api-key header)</label>
      <input style={{ width: '100%' }} value={key} onChange={(e)=>setKey(e.target.value)} />
      <div style={{ marginTop: 8 }}>
        <button onClick={save}>Save</button>
        {saved && <span style={{ marginLeft: 8 }}>Saved</span>}
      </div>
      <p style={{ fontSize: 12, color: '#666' }}>In packaged apps your key is stored securely in the OS credential store. During development the value falls back to localStorage.</p>
    </div>
  );
}
