// frontend/src/CredentialManager.jsx
// Credential Management UI - Phase 2

import React, { useState, useEffect } from 'react';
import { getBackendApiKeyAsync } from './config';

const PROVIDERS = [
  { id: 'anthropic', name: 'Anthropic Claude', envVar: 'ANTHROPIC_API_KEY' },
  { id: 'openai', name: 'OpenAI GPT', envVar: 'OPENAI_API_KEY' },
  { id: 'google', name: 'Google Gemini', envVar: 'GOOGLE_GEMINI_API_KEY' },
  { id: 'serpapi', name: 'SerpAPI Search', envVar: 'SERPAPI_KEY' },
  { id: 'github', name: 'GitHub', envVar: 'GITHUB_TOKEN' },
];

export default function CredentialManager({ visible, onClose }) {
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingCred, setEditingCred] = useState(null);
  const [testingProvider, setTestingProvider] = useState(null);
  const [testResults, setTestResults] = useState({});

  // Fetch credentials on mount
  useEffect(() => {
    if (visible) {
      fetchCredentials();
    }
  }, [visible]);

  const fetchCredentials = async () => {
    setLoading(true);
    setError(null);
    try {
      const apiKey = await getBackendApiKeyAsync();
      const response = await fetch('http://127.0.0.1:3001/api/credentials', {
        headers: { 'x-api-key': apiKey || '' }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch credentials: ${response.statusText}`);
      }
      
      const data = await response.json();
      setCredentials(data.credentials || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (provider, value) => {
    setLoading(true);
    setError(null);
    try {
      const apiKey = await getBackendApiKeyAsync();
      const method = editingCred ? 'PUT' : 'POST';
      const url = editingCred 
        ? `http://127.0.0.1:3001/api/credentials/${provider}`
        : 'http://127.0.0.1:3001/api/credentials';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey || ''
        },
        body: JSON.stringify({ provider, value })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save credential');
      }

      await fetchCredentials();
      setEditingCred(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (provider) => {
    if (!confirm(`Delete ${provider} credential?`)) return;
    
    setLoading(true);
    setError(null);
    try {
      const apiKey = await getBackendApiKeyAsync();
      const response = await fetch(`http://127.0.0.1:3001/api/credentials/${provider}`, {
        method: 'DELETE',
        headers: { 'x-api-key': apiKey || '' }
      });

      if (!response.ok) {
        throw new Error('Failed to delete credential');
      }

      await fetchCredentials();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTest = async (provider) => {
    setTestingProvider(provider);
    setTestResults({ ...testResults, [provider]: { loading: true } });
    
    try {
      const apiKey = await getBackendApiKeyAsync();
      const response = await fetch(`http://127.0.0.1:3001/api/credentials/${provider}/test`, {
        method: 'POST',
        headers: { 'x-api-key': apiKey || '' }
      });

      const data = await response.json();
      setTestResults({ 
        ...testResults, 
        [provider]: { 
          loading: false, 
          success: data.valid,
          message: data.valid ? 'Connection successful!' : data.error || 'Connection failed'
        } 
      });
    } catch (err) {
      setTestResults({ 
        ...testResults, 
        [provider]: { 
          loading: false, 
          success: false, 
          message: err.message 
        } 
      });
    } finally {
      setTestingProvider(null);
    }
  };

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '24px',
        maxWidth: '700px',
        width: '90%',
        maxHeight: '80vh',
        overflow: 'auto',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>Credential Manager</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#666'
            }}
          >
            ×
          </button>
        </div>

        {error && (
          <div style={{
            padding: '12px',
            backgroundColor: '#fee',
            color: '#c33',
            borderRadius: '4px',
            marginBottom: '16px'
          }}>
            {error}
          </div>
        )}

        {loading && credentials.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            Loading credentials...
          </div>
        ) : (
          <div>
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', marginBottom: '12px' }}>Stored Credentials</h3>
              {credentials.length === 0 ? (
                <p style={{ color: '#666', fontStyle: 'italic' }}>No credentials stored yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {credentials.map(cred => {
                    const providerInfo = PROVIDERS.find(p => p.id === cred.provider);
                    const testResult = testResults[cred.provider];
                    
                    return (
                      <div
                        key={cred.provider}
                        style={{
                          border: '1px solid #ddd',
                          borderRadius: '6px',
                          padding: '16px',
                          backgroundColor: '#f9f9f9'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                              {providerInfo ? providerInfo.name : cred.provider}
                            </div>
                            <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                              {providerInfo ? providerInfo.envVar : cred.provider.toUpperCase()}
                            </div>
                            <div style={{ fontSize: '14px', color: '#999', fontFamily: 'monospace' }}>
                              {cred.value ? '••••••••••••' + cred.value.slice(-4) : 'No value'}
                            </div>
                            {testResult && !testResult.loading && (
                              <div style={{ 
                                marginTop: '8px', 
                                fontSize: '13px',
                                color: testResult.success ? '#2a2' : '#c33'
                              }}>
                                {testResult.success ? '✓ ' : '✗ '}{testResult.message}
                              </div>
                            )}
                          </div>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              onClick={() => handleTest(cred.provider)}
                              disabled={testingProvider === cred.provider}
                              style={{
                                padding: '6px 12px',
                                fontSize: '13px',
                                backgroundColor: '#4CAF50',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                              }}
                            >
                              {testingProvider === cred.provider ? 'Testing...' : 'Test'}
                            </button>
                            <button
                              onClick={() => setEditingCred(cred)}
                              style={{
                                padding: '6px 12px',
                                fontSize: '13px',
                                backgroundColor: '#2196F3',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                              }}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(cred.provider)}
                              style={{
                                padding: '6px 12px',
                                fontSize: '13px',
                                backgroundColor: '#f44336',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div>
              <h3 style={{ fontSize: '18px', marginBottom: '12px' }}>
                {editingCred ? 'Edit Credential' : 'Add New Credential'}
              </h3>
              <CredentialForm
                providers={PROVIDERS}
                onSave={handleSave}
                onCancel={() => setEditingCred(null)}
                initialData={editingCred}
                existingProviders={credentials.map(c => c.provider)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CredentialForm({ providers, onSave, onCancel, initialData, existingProviders }) {
  const [provider, setProvider] = useState(initialData?.provider || '');
  const [value, setValue] = useState('');

  const availableProviders = providers.filter(p => 
    !existingProviders.includes(p.id) || p.id === initialData?.provider
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!provider || !value) return;
    onSave(provider, value);
    setProvider('');
    setValue('');
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div>
        <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
          Provider
        </label>
        <select
          value={provider}
          onChange={(e) => setProvider(e.target.value)}
          disabled={!!initialData}
          required
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px'
          }}
        >
          <option value="">Select a provider...</option>
          {availableProviders.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
          API Key / Token
        </label>
        <input
          type="password"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={initialData ? 'Enter new value (leave blank to keep current)' : 'Enter API key or token'}
          required={!initialData}
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px',
            fontFamily: 'monospace'
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
        {initialData && (
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: '8px 16px',
              backgroundColor: '#999',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          style={{
            padding: '8px 16px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          {initialData ? 'Update' : 'Add'} Credential
        </button>
      </div>
    </form>
  );
}
