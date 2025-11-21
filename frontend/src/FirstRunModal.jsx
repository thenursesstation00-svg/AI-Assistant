import React, { useState } from 'react';
import { setBackendApiKeyAsync } from './config';

export default function FirstRunModal({ visible, onClose }){
  const [key, setKey] = useState('');
  const [saving, setSaving] = useState(false);

  if(!visible) return null;

  async function save(){
    setSaving(true);
    await setBackendApiKeyAsync(key || '');
    setSaving(false);
    onClose && onClose();
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
      <div style={{ background: '#fff', padding: 20, width: 480, borderRadius: 8 }}>
        <h3>Welcome — enter your Backend API Key</h3>
        <p style={{ color: '#666' }}>To use the packaged app, please provide the `BACKEND_API_KEY` so the app can authenticate to your backend. This value will be stored securely in your OS credential store.</p>
        <input style={{ width: '100%', padding: 8, marginTop: 8 }} value={key} onChange={(e)=>setKey(e.target.value)} placeholder="Enter x-api-key" />
        <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
          <button onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save and Continue'}</button>
          <button onClick={onClose} disabled={saving}>Skip for now</button>
        </div>
      </div>
    </div>
  );
}
