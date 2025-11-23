import React, { useState, useEffect } from 'react';
import './PluginManager.css';

const PluginManager = () => {
  const [plugins, setPlugins] = useState({
    braveSearch: {
      name: 'Brave Search',
      description: 'Privacy-focused web search API',
      enabled: false,
      apiKey: '',
      envKey: 'BRAVE_API_KEY',
      testEndpoint: '/api/search?q=test&provider=brave',
      status: 'unconfigured'
    },
    serpApi: {
      name: 'SerpAPI',
      description: 'Google Search API wrapper',
      enabled: false,
      apiKey: '',
      envKey: 'SERPAPI_KEY',
      testEndpoint: '/api/search?q=test&provider=serpapi',
      status: 'unconfigured'
    },
    puppeteer: {
      name: 'Puppeteer Scraper',
      description: 'Web scraping and automation',
      enabled: false,
      apiKey: '',
      envKey: null, // No API key needed
      testEndpoint: '/api/scrape',
      status: 'unconfigured'
    },
    googleCSE: {
      name: 'Google Custom Search',
      description: 'Google Custom Search Engine',
      enabled: false,
      apiKey: '',
      cseId: '',
      envKey: 'GOOGLE_CSE_KEY',
      cseEnvKey: 'GOOGLE_CSE_CX',
      testEndpoint: '/api/search?q=test&provider=google',
      status: 'unconfigured'
    }
  });

  const [testing, setTesting] = useState({});
  const [showApiKey, setShowApiKey] = useState({});

  useEffect(() => {
    // Load saved plugin configurations from localStorage
    const savedConfig = localStorage.getItem('pluginConfig');
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        setPlugins(prev => ({
          ...prev,
          ...parsed
        }));
      } catch (err) {
        console.error('Failed to load plugin config:', err);
      }
    }
  }, []);

  const saveConfig = (updatedPlugins) => {
    localStorage.setItem('pluginConfig', JSON.stringify(updatedPlugins));
    setPlugins(updatedPlugins);
  };

  const togglePlugin = (pluginKey) => {
    const updatedPlugins = {
      ...plugins,
      [pluginKey]: {
        ...plugins[pluginKey],
        enabled: !plugins[pluginKey].enabled
      }
    };
    saveConfig(updatedPlugins);
  };

  const updateApiKey = (pluginKey, value) => {
    const updatedPlugins = {
      ...plugins,
      [pluginKey]: {
        ...plugins[pluginKey],
        apiKey: value,
        status: value ? 'configured' : 'unconfigured'
      }
    };
    saveConfig(updatedPlugins);
  };

  const updateCseId = (pluginKey, value) => {
    const updatedPlugins = {
      ...plugins,
      [pluginKey]: {
        ...plugins[pluginKey],
        cseId: value
      }
    };
    saveConfig(updatedPlugins);
  };

  const testPlugin = async (pluginKey) => {
    setTesting(prev => ({ ...prev, [pluginKey]: true }));
    const plugin = plugins[pluginKey];

    try {
      let endpoint = plugin.testEndpoint;
      let options = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': localStorage.getItem('BACKEND_API_KEY') || ''
        }
      };

      // Special handling for Puppeteer (POST request)
      if (pluginKey === 'puppeteer') {
        endpoint = '/api/scrape';
        options.method = 'POST';
        options.body = JSON.stringify({
          url: 'https://example.com',
          options: { waitForSelector: 'body' }
        });
      }

      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${baseUrl}${endpoint}`, options);
      
      if (response.ok) {
        const data = await response.json();
        const updatedPlugins = {
          ...plugins,
          [pluginKey]: {
            ...plugins[pluginKey],
            status: 'working'
          }
        };
        saveConfig(updatedPlugins);
        alert(`✅ ${plugin.name} is working correctly!`);
      } else {
        const error = await response.text();
        const updatedPlugins = {
          ...plugins,
          [pluginKey]: {
            ...plugins[pluginKey],
            status: 'error'
          }
        };
        saveConfig(updatedPlugins);
        alert(`❌ ${plugin.name} test failed: ${error}`);
      }
    } catch (err) {
      const updatedPlugins = {
        ...plugins,
        [pluginKey]: {
          ...plugins[pluginKey],
          status: 'error'
        }
      };
      saveConfig(updatedPlugins);
      alert(`❌ ${plugin.name} test failed: ${err.message}`);
    } finally {
      setTesting(prev => ({ ...prev, [pluginKey]: false }));
    }
  };

  const toggleApiKeyVisibility = (pluginKey) => {
    setShowApiKey(prev => ({
      ...prev,
      [pluginKey]: !prev[pluginKey]
    }));
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'working':
        return '✅';
      case 'configured':
        return '🔧';
      case 'error':
        return '❌';
      default:
        return '⚪';
    }
  };

  const exportConfig = () => {
    const config = {};
    Object.entries(plugins).forEach(([key, plugin]) => {
      if (plugin.apiKey) {
        config[plugin.envKey] = plugin.apiKey;
      }
      if (plugin.cseId && plugin.cseEnvKey) {
        config[plugin.cseEnvKey] = plugin.cseId;
      }
    });

    const configText = Object.entries(config)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    const blob = new Blob([configText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plugins.env';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="plugin-manager">
      <div className="plugin-header">
        <h2>Plugin Manager</h2>
        <p>Configure and manage AI Assistant plugins and integrations</p>
        <button onClick={exportConfig} className="export-btn">
          📥 Export Configuration
        </button>
      </div>

      <div className="plugins-grid">
        {Object.entries(plugins).map(([key, plugin]) => (
          <div key={key} className={`plugin-card ${plugin.enabled ? 'enabled' : 'disabled'}`}>
            <div className="plugin-card-header">
              <div className="plugin-title">
                <h3>{plugin.name}</h3>
                <span className="status-icon">{getStatusIcon(plugin.status)}</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={plugin.enabled}
                  onChange={() => togglePlugin(key)}
                />
                <span className="slider"></span>
              </label>
            </div>

            <p className="plugin-description">{plugin.description}</p>

            {plugin.enabled && (
              <div className="plugin-config">
                {plugin.envKey && (
                  <div className="config-field">
                    <label>{plugin.envKey}</label>
                    <div className="api-key-input">
                      <input
                        type={showApiKey[key] ? 'text' : 'password'}
                        value={plugin.apiKey}
                        onChange={(e) => updateApiKey(key, e.target.value)}
                        placeholder={`Enter ${plugin.name} API Key`}
                      />
                      <button
                        className="visibility-btn"
                        onClick={() => toggleApiKeyVisibility(key)}
                      >
                        {showApiKey[key] ? '🙈' : '👁️'}
                      </button>
                    </div>
                  </div>
                )}

                {plugin.cseEnvKey && (
                  <div className="config-field">
                    <label>{plugin.cseEnvKey}</label>
                    <input
                      type="text"
                      value={plugin.cseId || ''}
                      onChange={(e) => updateCseId(key, e.target.value)}
                      placeholder="Enter CSE ID"
                    />
                  </div>
                )}

                {key === 'puppeteer' && (
                  <div className="config-info">
                    <p>✅ Puppeteer is installed and ready to use</p>
                    <small>No API key required for web scraping</small>
                  </div>
                )}

                <button
                  className="test-btn"
                  onClick={() => testPlugin(key)}
                  disabled={testing[key] || (plugin.envKey && !plugin.apiKey)}
                >
                  {testing[key] ? '⏳ Testing...' : '🧪 Test Plugin'}
                </button>
              </div>
            )}

            <div className="plugin-status">
              <span className={`status-badge ${plugin.status}`}>
                {plugin.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="plugin-help">
        <h3>📚 Getting API Keys</h3>
        <ul>
          <li>
            <strong>Brave Search:</strong>{' '}
            <a href="https://brave.com/search/api/" target="_blank" rel="noopener noreferrer">
              Get API Key
            </a>
          </li>
          <li>
            <strong>SerpAPI:</strong>{' '}
            <a href="https://serpapi.com/manage-api-key" target="_blank" rel="noopener noreferrer">
              Get API Key
            </a>
          </li>
          <li>
            <strong>Google CSE:</strong>{' '}
            <a href="https://developers.google.com/custom-search/v1/introduction" target="_blank" rel="noopener noreferrer">
              Get API Key & CSE ID
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default PluginManager;
