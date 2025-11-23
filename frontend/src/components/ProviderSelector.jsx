// frontend/src/components/ProviderSelector.jsx
// AI Provider selection dropdown with model selection

import React, { useState, useEffect } from 'react';
import { getBackendApiKeyAsync } from '../config';

export default function ProviderSelector({ selectedProvider, onProviderChange, selectedModel, onModelChange }) {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      const apiKey = await getBackendApiKeyAsync();
      
      if (!apiKey) {
        console.warn('No API key found - using default providers list');
        // Fallback to default providers if no API key
        setProviders([
          { name: 'anthropic', configured: false, isDefault: true, models: [] },
          { name: 'openai', configured: false, models: [] }
        ]);
        setLoading(false);
        return;
      }
      
      const response = await fetch('http://127.0.0.1:3001/api/providers', {
        headers: { 'x-api-key': apiKey }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch providers: ${response.status}`);
      }

      const data = await response.json();
      setProviders(data.providers || []);
      
      // Set default provider if none selected
      if (!selectedProvider && data.providers && data.providers.length > 0) {
        const defaultProvider = data.providers.find(p => p.isDefault) || data.providers[0];
        onProviderChange(defaultProvider.name);
        
        // Set default model
        if (defaultProvider.models && defaultProvider.models.length > 0) {
          onModelChange(defaultProvider.models[0].id);
        }
      }
    } catch (err) {
      console.error('Provider fetch error:', err);
      // Fallback to basic providers on error
      setProviders([
        { name: 'anthropic', configured: false, isDefault: true, models: [] },
        { name: 'openai', configured: false, models: [] }
      ]);
      setError(null); // Don't show error to user, use fallback instead
    } finally {
      setLoading(false);
    }
  };

  const currentProvider = providers.find(p => p.name === selectedProvider);
  const availableModels = currentProvider?.models || [];

  const handleProviderChange = (e) => {
    const newProvider = e.target.value;
    onProviderChange(newProvider);
    
    // Auto-select first model for new provider
    const provider = providers.find(p => p.name === newProvider);
    if (provider && provider.models && provider.models.length > 0) {
      onModelChange(provider.models[0].id);
    }
  };

  if (loading) {
    return <div style={{ fontSize: '12px', color: '#666' }}>Loading providers...</div>;
  }

  if (error) {
    return <div style={{ fontSize: '12px', color: '#c33' }}>Error: {error}</div>;
  }

  return (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <label style={{ fontSize: '13px', fontWeight: '500', color: '#555' }}>
          Provider:
        </label>
        <select
          value={selectedProvider || ''}
          onChange={handleProviderChange}
          style={{
            padding: '6px 8px',
            fontSize: '13px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            backgroundColor: 'white',
            cursor: 'pointer'
          }}
        >
          {providers.map(provider => (
            <option key={provider.name} value={provider.name}>
              {provider.name.charAt(0).toUpperCase() + provider.name.slice(1)}
              {!provider.configured && ' (not configured)'}
              {provider.isDefault && ' ⭐'}
            </option>
          ))}
        </select>
      </div>

      {availableModels.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <label style={{ fontSize: '13px', fontWeight: '500', color: '#555' }}>
            Model:
          </label>
          <select
            value={selectedModel || ''}
            onChange={(e) => onModelChange(e.target.value)}
            style={{
              padding: '6px 8px',
              fontSize: '13px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              backgroundColor: 'white',
              cursor: 'pointer'
            }}
          >
            {availableModels.map(model => (
              <option key={model.id} value={model.id}>
                {model.name}
                {model.contextWindow && ` (${model.contextWindow / 1000}k)`}
              </option>
            ))}
          </select>
        </div>
      )}

      {currentProvider && !currentProvider.configured && (
        <div style={{
          fontSize: '12px',
          color: '#f80',
          backgroundColor: '#fff3e0',
          padding: '4px 8px',
          borderRadius: '3px'
        }}>
          ⚠ Not configured - add API key in settings
        </div>
      )}
    </div>
  );
}
