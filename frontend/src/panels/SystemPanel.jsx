import React, { useEffect, useState } from 'react';
import { API_URL, getBackendApiKeyAsync } from '../config';

export default function SystemPanel() {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchInfo = async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = await buildHeaders();
      const res = await fetch(`${API_URL}/api/system/info`, { headers });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setInfo(data);
    } catch (err) {
      setError(err.message);
      setInfo(null);
    } finally {
      setLoading(false);
    }
  };

  const buildHeaders = async () => {
    const headers = {};
    const key = await getBackendApiKeyAsync();
    if (key) headers['x-api-key'] = key;
    return headers;
  };

  useEffect(() => {
    fetchInfo();
  }, []);

  return (
    <div style={{ padding: '12px', color: '#ddd', fontSize: 13 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <h3 style={{ margin: 0 }}>System Overview</h3>
        <button
          onClick={fetchInfo}
          style={{
            padding: '2px 8px',
            fontSize: 11,
            backgroundColor: '#3e3e42',
            color: '#ccc',
            border: 'none',
            borderRadius: 3,
            cursor: 'pointer'
          }}
        >
          Refresh
        </button>
      </div>

      {loading && <div style={{ opacity: 0.8 }}>Loading system info...</div>}
      {error && <div style={{ color: '#ff6b6b', fontSize: 12 }}>Error: {error}</div>}

      {info && !loading && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, opacity: 0.8 }}>OS</div>
            <div>{info.os_version || info.os}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, opacity: 0.8 }}>CPU</div>
            <div>{info.cpu}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, opacity: 0.8 }}>Memory</div>
            <div>
              {info.memory?.used_gb} / {info.memory?.total_gb} GB ({info.memory?.percent}%)
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, opacity: 0.8 }}>Uptime</div>
            <div>{info.uptime}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, opacity: 0.8 }}>Hostname</div>
            <div>{info.hostname}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, opacity: 0.8 }}>Git Branch</div>
            <div>{info.app?.git_branch || 'N/A'}</div>
          </div>
        </div>
      )}
    </div>
  );
}
