import React, { useState } from 'react';
import TerminalPanel from '../panels/TerminalPanel';
import GitPanel from '../panels/GitPanel';
import SystemPanel from '../panels/SystemPanel';

export default function DeveloperControlPanelWindow({ uiState }) {
  const [activeTab, setActiveTab] = useState('terminal');

  const tabs = [
    { id: 'terminal', label: 'Terminal', icon: '⚡' },
    { id: 'git', label: 'Git', icon: '🌱' },
    { id: 'system', label: 'System', icon: '📊' }
  ];

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'git':
        return <GitPanel />;
      case 'system':
        return <SystemPanel />;
      case 'terminal':
      default:
        return <TerminalPanel uiState={uiState} />;
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: '#1b1b1f',
        borderRadius: 8,
        border: '1px solid rgba(0,240,255,0.25)',
        overflow: 'hidden'
      }}
    >
      <div
        style={{
          padding: '8px 12px',
          borderBottom: '1px solid rgba(0,240,255,0.18)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(90deg, rgba(0,240,255,0.12), rgba(180,0,255,0.12))'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 15 }}>🛠</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#f5f5f5' }}>
              Developer Control Panel
            </div>
            <div style={{ fontSize: 11, color: '#aaaaaa' }}>
              AI-native workspace for commands, Git & system
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid #3e3e42',
          backgroundColor: '#252526'
        }}
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                padding: '6px 10px',
                fontSize: 12,
                border: 'none',
                cursor: 'pointer',
                color: isActive ? '#ffffff' : '#cccccc',
                backgroundColor: isActive ? '#007acc' : 'transparent',
                borderBottom: isActive ? '2px solid #00f0ff' : '2px solid transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div style={{ flex: 1, minHeight: 0 }}>{renderActiveTab()}</div>
    </div>
  );
}
