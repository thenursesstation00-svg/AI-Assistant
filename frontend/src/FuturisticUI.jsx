// FuturisticUI.jsx - Next-gen personal assistant interface
import React, { useState, useEffect, useMemo, useRef } from 'react';
import useWindowManager from './components/WindowManager';
import Window from './components/Window';
import './FuturisticUI.css';

// Import window content components
import ChatWindow from './windows/ChatWindow';
import DevToolsWindow from './windows/DevToolsWindow';
import FileExplorerWindow from './windows/FileExplorerWindow';
import AgentManagerWindow from './windows/AgentManagerWindow';
import TerminalWindow from './windows/TerminalWindow';
import SystemMonitorWindow from './windows/SystemMonitorWindow';
import ReflectionWindow from './windows/ReflectionWindow';
import DeveloperControlPanelWindow from './windows/DeveloperControlPanelWindow';

export default function FuturisticUI() {
  const windowManager = useWindowManager({
    initialWindows: [
      {
        id: 'chat-1',
        title: 'AI Assistant',
        icon: '🤖',
        type: 'chat',
        x: 100,
        y: 100,
        width: 600,
        height: 700
      },
      {
        id: 'devtools-1',
        title: 'Developer Tools',
        icon: '⚡',
        type: 'devtools',
        x: 750,
        y: 100,
        width: 800,
        height: 600
      }
    ]
  });

  const [particles, setParticles] = useState([]);
  const [time, setTime] = useState(new Date());
  const sessionRef = useRef(`sess_${Date.now()}`);

  const sharedUiState = useMemo(() => ({
    sessionId: sessionRef.current,
    activeWindow: windowManager.activeWindow,
    windows: windowManager.windows
  }), [windowManager.activeWindow, windowManager.windows]);

  // Generate floating particles
  useEffect(() => {
    const newParticles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: Math.random() * 100 + '%',
      animationDelay: Math.random() * 15 + 's',
      animationDuration: (10 + Math.random() * 10) + 's'
    }));
    setParticles(newParticles);

    // Update time
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Dock items configuration
  const dockItems = [
    { id: 'chat', icon: '💬', label: 'Chat', type: 'chat' },
    { id: 'devtools', icon: '⚡', label: 'Dev Tools', type: 'devtools' },
    { id: 'files', icon: '📁', label: 'Files', type: 'files' },
    { id: 'agents', icon: '🤖', label: 'AI Agents', type: 'agents' },
    { id: 'terminal', icon: '💻', label: 'Terminal', type: 'terminal' },
    { id: 'monitor', icon: '📊', label: 'System', type: 'monitor' },
    { id: 'reflection', icon: '🧠', label: 'Reflection', type: 'reflection' },
    { id: 'control-panel', icon: '🛠', label: 'Control', type: 'controlPanel' },
    { id: 'settings', icon: '⚙️', label: 'Settings', type: 'settings' }
  ];

  // Handle dock item click
  const handleDockClick = (type) => {
    const windowConfigs = {
      chat: { title: 'AI Assistant', icon: '💬', width: 600, height: 700 },
      devtools: { title: 'Developer Tools', icon: '⚡', width: 900, height: 650 },
      files: { title: 'File Explorer', icon: '📁', width: 700, height: 600 },
      agents: { title: 'AI Agent Manager', icon: '🤖', width: 800, height: 700 },
      terminal: { title: 'Terminal', icon: '💻', width: 800, height: 500 },
      monitor: { title: 'System Monitor', icon: '📊', width: 600, height: 500 },
      reflection: { title: 'Personal Reflection', icon: '🧠', width: 700, height: 650 },
      controlPanel: { title: 'Developer Control Panel', icon: '🛠', width: 900, height: 650 },
      settings: { title: 'Settings', icon: '⚙️', width: 600, height: 500 }
    };

    const config = windowConfigs[type];
    if (config) {
      windowManager.addWindow({ ...config, type });
    }
  };

  // Render window content based on type
  const renderWindowContent = (window) => {
    switch (window.type) {
      case 'chat':
        return <ChatWindow uiState={sharedUiState} />;
      case 'devtools':
        return <DevToolsWindow />;
      case 'files':
        return <FileExplorerWindow />;
      case 'agents':
        return <AgentManagerWindow />;
      case 'terminal':
        return <TerminalWindow />;
      case 'monitor':
        return <SystemMonitorWindow />;
      case 'reflection':
        return <ReflectionWindow />;
      case 'controlPanel':
        return <DeveloperControlPanelWindow uiState={sharedUiState} />;
      default:
        return (
          <div style={{ padding: '20px', textAlign: 'center', color: '#a0a0d0' }}>
            <h3>{window.title}</h3>
            <p>Window content goes here</p>
          </div>
        );
    }
  };

  return (
    <div className="futuristic-ui">
      {/* Floating particles */}
      {particles.map(particle => (
        <div
          key={particle.id}
          className="particle"
          style={{
            left: particle.left,
            animationDelay: particle.animationDelay,
            animationDuration: particle.animationDuration
          }}
        />
      ))}

      {/* Status bar */}
      <div className="status-bar">
        <div className="status-bar-left">
          <div className="status-item active">
            <span>🌐</span>
            <span>AI Assistant Online</span>
          </div>
          <div className="status-item">
            <span>📡</span>
            <span>MCP Connected</span>
          </div>
          <div className="status-item">
            <span>⚡</span>
            <span>{windowManager.windows.filter(w => !w.minimized).length} Active Windows</span>
          </div>
        </div>
        <div className="status-bar-right">
          <div className="status-item">
            <span>🤖</span>
            <span>3 Agents Running</span>
          </div>
          <div className="status-item">
            <span>💾</span>
            <span>Auto-save: ON</span>
          </div>
          <div className="status-item active">
            <span>🕐</span>
            <span>{time.toLocaleTimeString()}</span>
          </div>
        </div>
      </div>

      {/* Windows */}
      {windowManager.windows.map(window => (
        <Window
          key={window.id}
          {...window}
          active={window.id === windowManager.activeWindow}
          onMouseDown={windowManager.handleMouseDown}
          onClose={windowManager.closeWindow}
          onMinimize={windowManager.minimizeWindow}
          onMaximize={windowManager.maximizeWindow}
        >
          {renderWindowContent(window)}
        </Window>
      ))}

      {/* Minimized windows preview */}
      {windowManager.windows.filter(w => w.minimized).length > 0 && (
        <div className="minimized-windows">
          {windowManager.windows.filter(w => w.minimized).map(window => (
            <div
              key={window.id}
              className="minimized-preview"
              onClick={() => windowManager.restoreWindow(window.id)}
            >
              <div style={{ fontSize: '20px', marginBottom: '4px' }}>{window.icon}</div>
              <div style={{ color: '#a0a0d0' }}>{window.title}</div>
            </div>
          ))}
        </div>
      )}

      {/* Dock */}
      <div className="futuristic-dock">
        {dockItems.map(item => (
          <div
            key={item.id}
            className={`dock-item ${
              windowManager.windows.some(w => w.type === item.type && !w.minimized) ? 'active' : ''
            }`}
            onClick={() => handleDockClick(item.type)}
          >
            {item.icon}
            <div className="dock-label">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
