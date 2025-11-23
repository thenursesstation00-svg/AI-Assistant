// SystemMonitorWindow.jsx - System resource monitoring
import React, { useState, useEffect } from 'react';

export default function SystemMonitorWindow() {
  const [cpuUsage, setCpuUsage] = useState(45);
  const [ramUsage, setRamUsage] = useState(62);
  const [diskUsage, setDiskUsage] = useState(38);
  const [networkIn, setNetworkIn] = useState(0);
  const [networkOut, setNetworkOut] = useState(0);

  const [processes, setProcesses] = useState([
    { pid: 1234, name: 'AI Assistant', cpu: 18, mem: 420, icon: '🤖' },
    { pid: 5678, name: 'Code Assistant Agent', cpu: 15, mem: 280, icon: '⚡' },
    { pid: 9012, name: 'Chrome', cpu: 22, mem: 1200, icon: '🌐' },
    { pid: 3456, name: 'VS Code', cpu: 12, mem: 680, icon: '💻' },
    { pid: 7890, name: 'Node.js Server', cpu: 8, mem: 340, icon: '🟢' },
    { pid: 2345, name: 'File Watcher', cpu: 5, mem: 120, icon: '👁️' },
    { pid: 6789, name: 'Security Scanner', cpu: 20, mem: 450, icon: '🔒' }
  ]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setCpuUsage(prev => Math.max(10, Math.min(90, prev + (Math.random() - 0.5) * 10)));
      setRamUsage(prev => Math.max(20, Math.min(95, prev + (Math.random() - 0.5) * 5)));
      setNetworkIn(Math.random() * 100);
      setNetworkOut(Math.random() * 50);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const formatBytes = (bytes) => {
    if (bytes < 1024) return `${bytes} MB`;
    return `${(bytes / 1024).toFixed(1)} GB`;
  };

  return (
    <div className="system-monitor">
      <div className="monitor-grid">
        {/* CPU Usage */}
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-icon">⚡</span>
            <span className="metric-title">CPU Usage</span>
          </div>
          <div className="metric-value">{cpuUsage.toFixed(1)}%</div>
          <div className="progress-bar">
            <div
              className="progress-fill cpu"
              style={{ width: `${cpuUsage}%` }}
            />
          </div>
          <div className="metric-info">8 cores @ 3.5 GHz</div>
        </div>

        {/* RAM Usage */}
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-icon">💾</span>
            <span className="metric-title">Memory</span>
          </div>
          <div className="metric-value">{ramUsage.toFixed(1)}%</div>
          <div className="progress-bar">
            <div
              className="progress-fill ram"
              style={{ width: `${ramUsage}%` }}
            />
          </div>
          <div className="metric-info">{formatBytes(ramUsage * 160)} / 16 GB</div>
        </div>

        {/* Disk Usage */}
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-icon">💿</span>
            <span className="metric-title">Disk</span>
          </div>
          <div className="metric-value">{diskUsage}%</div>
          <div className="progress-bar">
            <div
              className="progress-fill disk"
              style={{ width: `${diskUsage}%` }}
            />
          </div>
          <div className="metric-info">234 GB free / 512 GB</div>
        </div>

        {/* Network */}
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-icon">📡</span>
            <span className="metric-title">Network</span>
          </div>
          <div className="network-stats">
            <div className="network-stat">
              <span className="network-label">↓ In:</span>
              <span className="network-value">{networkIn.toFixed(1)} KB/s</span>
            </div>
            <div className="network-stat">
              <span className="network-label">↑ Out:</span>
              <span className="network-value">{networkOut.toFixed(1)} KB/s</span>
            </div>
          </div>
        </div>
      </div>

      {/* Process List */}
      <div className="process-section">
        <div className="section-header">
          <h3>🔄 Running Processes</h3>
          <div className="process-sort">
            <button className="sort-btn active">CPU</button>
            <button className="sort-btn">Memory</button>
          </div>
        </div>
        <div className="process-list">
          <div className="process-header">
            <div className="col-icon"></div>
            <div className="col-name">Name</div>
            <div className="col-pid">PID</div>
            <div className="col-cpu">CPU</div>
            <div className="col-mem">Memory</div>
          </div>
          {processes
            .sort((a, b) => b.cpu - a.cpu)
            .map(proc => (
              <div key={proc.pid} className="process-item">
                <div className="col-icon">{proc.icon}</div>
                <div className="col-name">{proc.name}</div>
                <div className="col-pid">{proc.pid}</div>
                <div className="col-cpu">
                  <div className="cpu-badge">{proc.cpu}%</div>
                </div>
                <div className="col-mem">{formatBytes(proc.mem)}</div>
              </div>
            ))}
        </div>
      </div>

      <style jsx>{`
        .system-monitor {
          height: 100%;
          background: rgba(10, 10, 30, 0.4);
          padding: 20px;
          overflow-y: auto;
        }
        .monitor-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }
        .metric-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(0, 240, 255, 0.2);
          border-radius: 12px;
          padding: 16px;
        }
        .metric-header {
          display: flex;
          gap: 8px;
          align-items: center;
          margin-bottom: 12px;
        }
        .metric-icon {
          font-size: 24px;
        }
        .metric-title {
          color: #a0a0d0;
          font-size: 13px;
          text-transform: uppercase;
          font-weight: 600;
        }
        .metric-value {
          color: #00f0ff;
          font-size: 32px;
          font-weight: bold;
          margin-bottom: 12px;
        }
        .progress-bar {
          height: 8px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 8px;
        }
        .progress-fill {
          height: 100%;
          transition: width 0.5s;
        }
        .progress-fill.cpu {
          background: linear-gradient(90deg, #00f0ff, #b400ff);
        }
        .progress-fill.ram {
          background: linear-gradient(90deg, #00ff88, #00f0ff);
        }
        .progress-fill.disk {
          background: linear-gradient(90deg, #ffaa00, #ff4466);
        }
        .metric-info {
          color: #a0a0d0;
          font-size: 12px;
        }
        .network-stats {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 12px;
        }
        .network-stat {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px;
          background: rgba(0, 240, 255, 0.05);
          border-radius: 6px;
        }
        .network-label {
          color: #a0a0d0;
          font-size: 13px;
        }
        .network-value {
          color: #00f0ff;
          font-weight: 600;
        }
        .process-section {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(0, 240, 255, 0.2);
          border-radius: 12px;
          padding: 16px;
        }
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }
        .section-header h3 {
          color: #00f0ff;
          margin: 0;
        }
        .process-sort {
          display: flex;
          gap: 8px;
        }
        .sort-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(0, 240, 255, 0.2);
          border-radius: 6px;
          padding: 6px 12px;
          color: #a0a0d0;
          cursor: pointer;
          font-size: 12px;
          transition: all 0.3s;
        }
        .sort-btn.active {
          background: rgba(0, 240, 255, 0.2);
          border-color: #00f0ff;
          color: #00f0ff;
        }
        .process-list {
          font-size: 13px;
        }
        .process-header, .process-item {
          display: grid;
          grid-template-columns: 40px 1fr 80px 80px 100px;
          gap: 12px;
          padding: 10px 12px;
          align-items: center;
        }
        .process-header {
          color: #a0a0d0;
          font-weight: 600;
          text-transform: uppercase;
          font-size: 11px;
          border-bottom: 1px solid rgba(0, 240, 255, 0.2);
        }
        .process-item {
          border-bottom: 1px solid rgba(0, 240, 255, 0.1);
          transition: all 0.3s;
        }
        .process-item:hover {
          background: rgba(0, 240, 255, 0.05);
        }
        .col-icon {
          font-size: 20px;
        }
        .col-name {
          color: #e0e0f0;
        }
        .col-pid {
          color: #a0a0d0;
          font-family: 'JetBrains Mono', monospace;
        }
        .cpu-badge {
          display: inline-block;
          background: linear-gradient(135deg, rgba(0, 240, 255, 0.2), rgba(180, 0, 255, 0.2));
          border: 1px solid #00f0ff;
          border-radius: 4px;
          padding: 2px 8px;
          color: #00f0ff;
          font-weight: 600;
        }
        .col-mem {
          color: #e0e0f0;
        }
      `}</style>
    </div>
  );
}
