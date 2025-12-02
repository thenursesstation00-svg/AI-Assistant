import React, { useState, useEffect } from 'react';
import { getBackendApiKeyAsync } from '../config';
import './ControlPanel.css';

export default function ControlPanel() {
  const [activeTab, setActiveTab] = useState('overview');
  const [systemStats, setSystemStats] = useState({ cpu: 0, memory: 0, uptime: 0 });
  const [logs, setLogs] = useState([]);
  const [terminalInput, setTerminalInput] = useState('');
  const [terminalOutput, setTerminalOutput] = useState([]);
  const [tools, setTools] = useState([]);
  const [agents, setAgents] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const apiKey = await getBackendApiKeyAsync();
        const res = await fetch('http://127.0.0.1:3001/api/system-stats/stats', {
          headers: { 'x-api-key': apiKey }
        });
        if (res.ok) {
          const data = await res.json();
          setSystemStats(data);
        }
      } catch (err) {
        console.error('Stats fetch error:', err);
      }
    };

    const fetchTools = async () => {
      try {
        const apiKey = await getBackendApiKeyAsync();
        const res = await fetch('http://127.0.0.1:3001/api/tools', {
          headers: { 'x-api-key': apiKey }
        });
        if (res.ok) {
          const data = await res.json();
          setTools(data);
        }
      } catch (err) {
        console.error('Tools fetch error:', err);
      }
    };

    const fetchAgents = async () => {
      try {
        const apiKey = await getBackendApiKeyAsync();
        const res = await fetch('http://127.0.0.1:3001/api/agents', {
          headers: { 'x-api-key': apiKey }
        });
        if (res.ok) {
          const data = await res.json();
          setAgents(data);
        }
      } catch (err) {
        console.error('Agents fetch error:', err);
      }
    };

    fetchStats();
    fetchTools();
    fetchAgents();
    const interval = setInterval(() => {
      fetchStats();
      fetchAgents();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleTerminalSubmit = async (e) => {
    e.preventDefault();
    if (!terminalInput.trim()) return;

    const cmd = terminalInput;
    setTerminalOutput(prev => [...prev, { type: 'input', content: cmd }]);
    setTerminalInput('');

    try {
      const apiKey = await getBackendApiKeyAsync();
      const res = await fetch('http://127.0.0.1:3001/api/terminal/exec', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-api-key': apiKey 
        },
        body: JSON.stringify({ command: cmd })
      });
      
      const data = await res.json();
      setTerminalOutput(prev => [...prev, { 
        type: data.success ? 'success' : 'error', 
        content: data.output 
      }]);
    } catch (err) {
      setTerminalOutput(prev => [...prev, { type: 'error', content: err.message }]);
    }
  };

  const executeTool = async (toolName) => {
    try {
      const apiKey = await getBackendApiKeyAsync();
      const res = await fetch(`http://127.0.0.1:3001/api/tools/${toolName}/execute`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-api-key': apiKey 
        },
        body: JSON.stringify({ args: {} }) // TODO: Add args UI
      });
      const data = await res.json();
      alert(JSON.stringify(data, null, 2));
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const startAgent = async (type) => {
    try {
      const apiKey = await getBackendApiKeyAsync();
      const res = await fetch('http://127.0.0.1:3001/api/agents', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-api-key': apiKey 
        },
        body: JSON.stringify({ type, config: {} })
      });
      if (res.ok) {
        // Refresh agents list immediately
        const agentsRes = await fetch('http://127.0.0.1:3001/api/agents', {
          headers: { 'x-api-key': apiKey }
        });
        if (agentsRes.ok) {
          setAgents(await agentsRes.json());
        }
      }
    } catch (err) {
      console.error('Error starting agent:', err);
    }
  };

  return (
    <div className="control-panel">
      <div className="cp-sidebar">
        <div className="cp-brand">
          <span className="cp-icon">⚡</span>
          <span className="cp-title">NEXUS</span>
        </div>
        <nav className="cp-nav">
          <button 
            className={`cp-nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`cp-nav-item ${activeTab === 'terminal' ? 'active' : ''}`}
            onClick={() => setActiveTab('terminal')}
          >
            Terminal
          </button>
          <button 
            className={`cp-nav-item ${activeTab === 'agents' ? 'active' : ''}`}
            onClick={() => setActiveTab('agents')}
          >
            Agents
          </button>
          <button 
            className={`cp-nav-item ${activeTab === 'ai-tools' ? 'active' : ''}`}
            onClick={() => setActiveTab('ai-tools')}
          >
            AI Tools
          </button>
          <button 
            className={`cp-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            Settings
          </button>
        </nav>
        <div className="cp-status">
          <div className="status-item">
            <span className="label">CPU</span>
            <div className="bar-container">
              <div className="bar" style={{ width: `${systemStats.cpu}%` }}></div>
            </div>
          </div>
          <div className="status-item">
            <span className="label">MEM</span>
            <div className="bar-container">
              <div className="bar" style={{ width: `${systemStats.memory}%` }}></div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="cp-content">
        <header className="cp-header">
          <h2 className="view-title">{activeTab.toUpperCase()}</h2>
          <div className="cp-actions">
            <button className="cp-btn">Connect</button>
            <button className="cp-btn primary">Deploy</button>
          </div>
        </header>
        
        <main className="cp-main-view">
          {activeTab === 'overview' && (
            <div className="overview-grid">
              <div className="card metric-card">
                <h3>Backend Status</h3>
                <div className="status-indicator online">Online</div>
                <p>Port: 3001</p>
                <p className="text-muted small">{systemStats.hostname} ({systemStats.platform})</p>
              </div>
              <div className="card metric-card">
                <h3>Active Agents</h3>
                <div className="big-number">3</div>
                <p>Idle: 2, Working: 1</p>
              </div>
              <div className="card log-card">
                <h3>System Logs</h3>
                <div className="log-viewer">
                  {logs.length === 0 ? <span className="text-muted">No recent logs...</span> : logs.map((l, i) => <div key={i}>{l}</div>)}
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'terminal' && (
            <div className="terminal-placeholder">
              <div className="terminal-output">
                <div className="terminal-history">
                  {terminalOutput.map((line, i) => (
                    <div key={i} className={`term-line ${line.type}`}>
                      {line.type === 'input' ? <span className="prompt">user@nexus:~$ </span> : ''}
                      {line.content}
                    </div>
                  ))}
                </div>
              </div>
              <form onSubmit={handleTerminalSubmit} className="terminal-input-form">
                <span className="prompt">user@nexus:~$</span>
                <input 
                  type="text" 
                  value={terminalInput}
                  onChange={(e) => setTerminalInput(e.target.value)}
                  autoFocus
                  className="terminal-input"
                />
              </form>
            </div>
          )}

          {activeTab === 'agents' && (
            <div className="agents-view">
              <div className="agents-actions">
                <button className="cp-btn" onClick={() => startAgent('researcher')}>Start Researcher</button>
                <button className="cp-btn" onClick={() => startAgent('coder')}>Start Coder</button>
                <button className="cp-btn" onClick={() => startAgent('generic')}>Start Generic Task</button>
              </div>
              <div className="agents-list">
                {agents.length === 0 && <p className="text-muted">No active agents.</p>}
                {agents.map(agent => (
                  <div key={agent.id} className={`agent-card ${agent.status}`}>
                    <div className="agent-header">
                      <h4>{agent.type.toUpperCase()}</h4>
                      <span className={`status-badge ${agent.status}`}>{agent.status}</span>
                    </div>
                    <div className="agent-progress">
                      <div className="progress-bar" style={{ width: `${agent.progress}%` }}></div>
                    </div>
                    <div className="agent-logs">
                      {agent.logs.slice(-3).map((log, i) => (
                        <div key={i} className="log-line small">{log.message}</div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'ai-tools' && (
            <div className="tools-grid">
              {tools.length === 0 && <p className="text-muted">No tools registered.</p>}
              {tools.map(tool => (
                <div key={tool.name} className="tool-card">
                  <h4>{tool.name}</h4>
                  <p>{tool.description}</p>
                  <button className="cp-btn small" onClick={() => executeTool(tool.name)}>Run</button>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
