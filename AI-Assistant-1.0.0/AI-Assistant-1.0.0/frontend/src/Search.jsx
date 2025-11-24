import React, { useState } from 'react';
import { API_URL, getBackendApiKeyAsync } from './config';

export default function Search(){
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [provider, setProvider] = useState(null);
  const [cached, setCached] = useState(false);
  const [searchTime, setSearchTime] = useState(null);
  const [error, setError] = useState(null);

  async function runSearch(){
    if(!q) return;
    setLoading(true);
    setError(null);
    const startTime = Date.now();
    try{
      const headers = { 'Content-Type': 'application/json' };
      const key = await getBackendApiKeyAsync();
      if(key) headers['x-api-key'] = key;
      const res = await fetch(`${API_URL}/api/search?q=${encodeURIComponent(q)}`, { headers });
      if(!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setProvider(data.provider || null);
      setResults(data.results || []);
      setCached(data.cached || false);
      setSearchTime(Date.now() - startTime);
    }catch(e){
      console.error('search error', e);
      setError(e.message);
      setResults([]);
    }finally{ setLoading(false); }
  }

  const getDomain = (url) => {
    try { return new URL(url).hostname; } catch { return url; }
  };

  return (
    <div style={{ padding: 12, border: '1px solid #eee', marginTop: 12, maxWidth: 400 }}>
      <h3>Web Search</h3>
      <div style={{ display: 'flex', gap: 8 }}>
        <input 
          style={{ flex: 1 }} 
          value={q} 
          onChange={(e)=>setQ(e.target.value)} 
          placeholder="Search the web..."
          onKeyPress={(e) => e.key === 'Enter' && runSearch()}
        />
        <button onClick={runSearch} disabled={loading}>{loading ? 'Searching...' : 'Search'}</button>
      </div>
      
      {error && (
        <div style={{ marginTop: 8, padding: 8, background: '#fee', color: '#c33', fontSize: 12, borderRadius: 4 }}>
          Error: {error}
        </div>
      )}
      
      {(provider || searchTime) && (
        <div style={{ marginTop: 8, fontSize: 12, color: '#666', display: 'flex', gap: 12, alignItems: 'center' }}>
          {provider && <span>Provider: {provider}</span>}
          {cached && <span style={{ background: '#e8f5e8', color: '#2d5a2d', padding: '2px 6px', borderRadius: 3 }}>Cached</span>}
          {searchTime && <span>{searchTime}ms</span>}
        </div>
      )}
      
      <div style={{ marginTop: 12, maxHeight: 300, overflowY: 'auto' }}>
        {results.map((r,i)=> (
          <div key={i} style={{ padding: 8, borderBottom: '1px solid #f2f2f2' }}>
            <a href={r.link || '#'} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
              <strong style={{ color: '#1a73e8', fontSize: 14 }}>{r.title}</strong>
            </a>
            <div style={{ fontSize: 13, color: '#444', marginTop: 2, lineHeight: 1.4 }}>{r.snippet}</div>
            <div style={{ fontSize: 11, color: '#006621', marginTop: 2 }}>
              {r.link && getDomain(r.link)} • {r.source}
            </div>
          </div>
        ))}
        {results.length === 0 && !loading && !error && q && (
          <div style={{ padding: 16, textAlign: 'center', color: '#666', fontSize: 13 }}>
            No results found
          </div>
        )}
      </div>
    </div>
  );
}
