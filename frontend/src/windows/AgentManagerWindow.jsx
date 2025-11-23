// AgentManagerWindow.jsx - AI Agent orchestration
import React, { useState } from 'react';

export default function AgentManagerWindow() {
  const [agents, setAgents] = useState([
    { id: 1, name: 'Code Assistant', status: 'active', task: 'Reviewing backend routes', cpu: 15, icon: '🤖' },
    { id: 2, name: 'File Watcher', status: 'active', task: 'Monitoring /src directory', cpu: 5, icon: '👁️' },
    { id: 3, name: 'Test Runner', status: 'idle', task: 'Waiting for changes', cpu: 2, icon: '🧪' },
    { id: 4, name: 'Security Scanner', status: 'running', task: 'Scanning dependencies', cpu: 22, icon: '🔒' },
    { id: 5, name: 'Documentation Bot', status: 'idle', task: 'Ready to generate docs', cpu: 1, icon: '📚' }
  ]);

  const [selectedAgent, setSelectedAgent] = useState(null);
  const [newAgentPrompt, setNewAgentPrompt] = useState('');

  const statusColors = {
    active: '#00ff88',
    running: '#00f0ff',
    idle: '#a0a0d0',
    error: '#ff4466'
  };

  const handleCreateAgent = () => {
    if (!newAgentPrompt.trim()) return;
    
    const newAgent = {
      id: agents.length + 1,
      name: `Custom Agent ${agents.length + 1}`,
      status: 'idle',
      task: newAgentPrompt,
      cpu: 0,
      icon: '✨'
    };
    
    setAgents([...agents, newAgent]);
    setNewAgentPrompt('');
  };

  const handleStopAgent = (id) => {
    setAgents(agents.map(a => a.id === id ? { ...a, status: 'idle', task: 'Stopped', cpu: 0 } : a));
  };

  const handleStartAgent = (id) => {
    setAgents(agents.map(a => a.id === id ? { ...a, status: 'running', task: 'Processing...', cpu: 15 } : a));
  };

  return (
    <div className="agent-manager">
      <div className="agent-header">
        <h2>🤖 AI Agent Manager</h2>
        <div className="agent-stats">
          <div className="stat-item">
            <span>Active: {agents.filter(a => a.status === 'active' || a.status === 'running').length}</span>
          </div>
          <div className="stat-item">
            <span>Total CPU: {agents.reduce((sum, a) => sum + a.cpu, 0)}%</span>
          </div>
        </div>
      </div>

      <div className="agent-content">
        <div className="agent-list">
          {agents.map(agent => (
            <div
              key={agent.id}
              className={`agent-card ${selectedAgent?.id === agent.id ? 'selected' : ''}`}
              onClick={() => setSelectedAgent(agent)}
            >
              <div className="agent-icon">{agent.icon}</div>
              <div className="agent-info">
                <div className="agent-name">{agent.name}</div>
                <div className="agent-task">{agent.task}</div>
                <div className="agent-meta">
                  <span
                    className="agent-status"
                    style={{ color: statusColors[agent.status] }}
                  >
                    ● {agent.status.toUpperCase()}
                  </span>
                  <span className="agent-cpu">CPU: {agent.cpu}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {selectedAgent && (
          <div className="agent-details">
            <h3>{selectedAgent.icon} {selectedAgent.name}</h3>
            <div className="detail-section">
              <div className="detail-label">Status</div>
              <div
                className="detail-value"
                style={{ color: statusColors[selectedAgent.status] }}
              >
                ● {selectedAgent.status.toUpperCase()}
              </div>
            </div>
            <div className="detail-section">
              <div className="detail-label">Current Task</div>
              <div className="detail-value">{selectedAgent.task}</div>
            </div>
            <div className="detail-section">
              <div className="detail-label">CPU Usage</div>
              <div className="detail-value">{selectedAgent.cpu}%</div>
              <div className="cpu-bar">
                <div
                  className="cpu-fill"
                  style={{ width: `${selectedAgent.cpu}%` }}
                />
              </div>
            </div>
            <div className="agent-actions">
              {selectedAgent.status === 'idle' ? (
                <button className="action-btn primary" onClick={() => handleStartAgent(selectedAgent.id)}>
                  ▶️ Start Agent
                </button>
              ) : (
                <button className="action-btn danger" onClick={() => handleStopAgent(selectedAgent.id)}>
                  ⏸️ Stop Agent
                </button>
              )}
              <button className="action-btn">⚙️ Configure</button>
              <button className="action-btn">📊 View Logs</button>
            </div>
          </div>
        )}
      </div>

      <div className="create-agent">
        <input
          type="text"
          className="agent-input"
          value={newAgentPrompt}
          onChange={(e) => setNewAgentPrompt(e.target.value)}
          placeholder="Describe what your new agent should do..."
        />
        <button className="create-btn" onClick={handleCreateAgent}>
          ✨ Create Agent
        </button>
      </div>

      <style jsx>{`
        .agent-manager {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: rgba(10, 10, 30, 0.4);
        }
        .agent-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid rgba(0, 240, 255, 0.2);
        }
        .agent-header h2 {
          color: #00f0ff;
          margin: 0;
        }
        .agent-stats {
          display: flex;
          gap: 20px;
        }
        .stat-item {
          background: rgba(0, 240, 255, 0.1);
          border: 1px solid rgba(0, 240, 255, 0.3);
          border-radius: 6px;
          padding: 6px 12px;
          color: #e0e0f0;
          font-size: 13px;
        }
        .agent-content {
          flex: 1;
          display: flex;
          overflow: hidden;
        }
        .agent-list {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .agent-card {
          display: flex;
          gap: 12px;
          padding: 16px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(0, 240, 255, 0.2);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s;
        }
        .agent-card:hover {
          background: rgba(0, 240, 255, 0.1);
          border-color: #00f0ff;
          transform: translateX(4px);
        }
        .agent-card.selected {
          background: rgba(0, 240, 255, 0.15);
          border-color: #00f0ff;
          box-shadow: 0 0 20px rgba(0, 240, 255, 0.3);
        }
        .agent-icon {
          font-size: 36px;
        }
        .agent-info {
          flex: 1;
        }
        .agent-name {
          color: #e0e0f0;
          font-weight: 600;
          font-size: 16px;
          margin-bottom: 4px;
        }
        .agent-task {
          color: #a0a0d0;
          font-size: 13px;
          margin-bottom: 8px;
        }
        .agent-meta {
          display: flex;
          gap: 16px;
          font-size: 12px;
        }
        .agent-status {
          font-weight: 600;
        }
        .agent-cpu {
          color: #a0a0d0;
        }
        .agent-details {
          width: 320px;
          border-left: 1px solid rgba(0, 240, 255, 0.2);
          padding: 20px;
          background: rgba(0, 0, 0, 0.3);
          overflow-y: auto;
        }
        .agent-details h3 {
          color: #00f0ff;
          margin-bottom: 20px;
        }
        .detail-section {
          margin-bottom: 20px;
        }
        .detail-label {
          color: #a0a0d0;
          font-size: 12px;
          margin-bottom: 6px;
          text-transform: uppercase;
        }
        .detail-value {
          color: #e0e0f0;
          font-size: 14px;
        }
        .cpu-bar {
          margin-top: 8px;
          height: 8px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          overflow: hidden;
        }
        .cpu-fill {
          height: 100%;
          background: linear-gradient(90deg, #00f0ff, #b400ff);
          transition: width 0.3s;
        }
        .agent-actions {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 20px;
        }
        .action-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(0, 240, 255, 0.3);
          border-radius: 6px;
          padding: 10px;
          color: #e0e0f0;
          cursor: pointer;
          transition: all 0.3s;
        }
        .action-btn:hover {
          background: rgba(0, 240, 255, 0.2);
          border-color: #00f0ff;
        }
        .action-btn.primary {
          background: linear-gradient(135deg, #00f0ff, #b400ff);
          border: none;
          font-weight: 600;
        }
        .action-btn.danger {
          background: rgba(255, 68, 102, 0.2);
          border-color: #ff4466;
        }
        .create-agent {
          display: flex;
          gap: 12px;
          padding: 16px;
          border-top: 1px solid rgba(0, 240, 255, 0.2);
        }
        .agent-input {
          flex: 1;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(0, 240, 255, 0.3);
          border-radius: 8px;
          padding: 12px 16px;
          color: #e0e0f0;
          font-size: 14px;
          outline: none;
        }
        .agent-input:focus {
          border-color: #00f0ff;
          box-shadow: 0 0 15px rgba(0, 240, 255, 0.3);
        }
        .create-btn {
          background: linear-gradient(135deg, #00f0ff, #b400ff);
          border: none;
          border-radius: 8px;
          padding: 12px 24px;
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }
        .create-btn:hover {
          transform: scale(1.05);
          box-shadow: 0 0 25px rgba(0, 240, 255, 0.5);
        }
      `}</style>
    </div>
  );
}
