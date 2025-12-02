import React, { useEffect, useState } from 'react';
import { API_URL, getBackendApiKeyAsync } from '../config';

export default function GitPanel() {
  const [loading, setLoading] = useState(false);
  const [changes, setChanges] = useState([]);
  const [commitMessage, setCommitMessage] = useState('');
  const [commitStatus, setCommitStatus] = useState(null);

  const withHeaders = async (json = false) => {
    const headers = json ? { 'Content-Type': 'application/json' } : {};
    const key = await getBackendApiKeyAsync();
    if (key) headers['x-api-key'] = key;
    return headers;
  };

  const refreshStatus = async () => {
    setLoading(true);
    setCommitStatus(null);
    try {
      const headers = await withHeaders();
      const res = await fetch(`${API_URL}/api/git/status`, { headers });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'git status failed');
      setChanges(data.changes || []);
    } catch (err) {
      setCommitStatus(`Status error: ${err.message}`);
      setChanges([]);
    } finally {
      setLoading(false);
    }
  };

  const commit = async () => {
    if (!commitMessage.trim()) {
      alert('Commit message is required.');
      return;
    }
    setCommitStatus('Committing...');
    try {
      const headers = await withHeaders(true);
      const res = await fetch(`${API_URL}/api/git/commit`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ message: commitMessage })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'commit failed');
      setCommitStatus('Commit successful.');
      setCommitMessage('');
      refreshStatus();
    } catch (err) {
      setCommitStatus(`Commit error: ${err.message}`);
    }
  };

  const gitAction = async (action) => {
    setCommitStatus(`${action}ing...`);
    try {
      const headers = await withHeaders(true);
      const res = await fetch(`${API_URL}/api/git/${action}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({})
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || `${action} failed`);
      setCommitStatus(`${action.charAt(0).toUpperCase() + action.slice(1)} successful.`);
      refreshStatus();
    } catch (err) {
      setCommitStatus(`${action} error: ${err.message}`);
    }
  };

  useEffect(() => {
    refreshStatus();
  }, []);

  return (
    <div style={{ padding: '12px', color: '#ddd', fontSize: 13, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <div>
          <h3 style={{ margin: 0 }}>Git Controls</h3>
          <div style={{ fontSize: 11, opacity: 0.8 }}>
            Manage repo, stage changes, commit, pull & push from here.
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            onClick={refreshStatus}
            style={{
              padding: '4px 10px',
              fontSize: 11,
              backgroundColor: '#3e3e42',
              color: '#ccc',
              border: 'none',
              borderRadius: 3,
              cursor: 'pointer'
            }}
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {commitStatus && (
        <div style={{ fontSize: 11, color: commitStatus.includes('error') ? '#ff6b6b' : '#4ecdc4', marginBottom: 4 }}>
          {commitStatus}
        </div>
      )}

      <div style={{ flex: 1, overflow: 'auto', marginBottom: 8 }}>
        <div style={{ fontSize: 12, color: '#ccc', marginBottom: 6 }}>
          Changed files ({changes.length})
        </div>
        {changes.length === 0 && (
          <div style={{ fontSize: 12, color: '#777' }}>
            Working tree clean. Nothing to commit.
          </div>
        )}
        {changes.map((c, i) => (
          <div
            key={`${c.file}-${i}`}
            style={{
              padding: '4px 6px',
              borderBottom: '1px solid #333',
              fontSize: 12,
              fontFamily: 'monospace',
              display: 'flex',
              gap: 8
            }}
          >
            <span style={{ minWidth: 28, color: c.status && c.status.includes('M') ? '#ffd866' : '#aaffaa' }}>
              {c.status || '?'}
            </span>
            <span>{c.file}</span>
          </div>
        ))}
      </div>

      <div style={{ borderTop: '1px solid #3e3e42', paddingTop: 8 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <button
            onClick={() => gitAction('pull')}
            disabled={loading}
            style={{
              padding: '6px 12px',
              fontSize: 12,
              backgroundColor: '#3e3e42',
              color: '#ccc',
              border: 'none',
              borderRadius: 3,
              cursor: loading ? 'default' : 'pointer',
              opacity: loading ? 0.6 : 1
            }}
          >
            ⬇ Pull
          </button>
          <button
            onClick={() => gitAction('push')}
            disabled={loading}
            style={{
              padding: '6px 12px',
              fontSize: 12,
              backgroundColor: '#3e3e42',
              color: '#ccc',
              border: 'none',
              borderRadius: 3,
              cursor: loading ? 'default' : 'pointer',
              opacity: loading ? 0.6 : 1
            }}
          >
            ⬆ Push
          </button>
        </div>

        <div style={{ marginBottom: 6 }}>
          <textarea
            value={commitMessage}
            onChange={(e) => setCommitMessage(e.target.value)}
            placeholder="Commit message..."
            style={{
              width: '100%',
              minHeight: 48,
              backgroundColor: '#1e1e1e',
              border: '1px solid #3e3e42',
              borderRadius: 4,
              color: '#eee',
              fontSize: 12,
              padding: 6,
              resize: 'vertical'
            }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            onClick={commit}
            disabled={!commitMessage.trim() || loading}
            style={{
              padding: '6px 12px',
              fontSize: 12,
              backgroundColor: '#0e639c',
              color: '#fff',
              border: 'none',
              borderRadius: 3,
              cursor: !commitMessage.trim() || loading ? 'default' : 'pointer',
              opacity: !commitMessage.trim() || loading ? 0.7 : 1
            }}
          >
            ✅ Commit all changes
          </button>
        </div>
      </div>
    </div>
  );
}
