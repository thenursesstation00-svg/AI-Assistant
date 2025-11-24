// frontend/src/Workspace.jsx
// Multi-panel workspace with draggable/resizable panels - Phase 4

import React, { useState, useEffect } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import ChatPanel from './panels/ChatPanel';
import EditorPanel from './panels/EditorPanel';
import TerminalPanel from './panels/TerminalPanel';
import CredentialManager from './CredentialManager';
import { getBackendApiKeyAsync } from './config';
import 'react-grid-layout/css/styles.css';
// Note: resizable.css is included in styles.css in newer versions

const ResponsiveGridLayout = WidthProvider(Responsive);

const DEFAULT_LAYOUTS = {
  lg: [
    { i: 'chat', x: 0, y: 0, w: 6, h: 12, minW: 3, minH: 6 },
    { i: 'editor', x: 6, y: 0, w: 6, h: 6, minW: 3, minH: 4 },
    { i: 'terminal', x: 6, y: 6, w: 6, h: 6, minW: 3, minH: 3 }
  ],
  md: [
    { i: 'chat', x: 0, y: 0, w: 8, h: 10, minW: 4, minH: 6 },
    { i: 'editor', x: 0, y: 10, w: 8, h: 6, minW: 4, minH: 4 },
    { i: 'terminal', x: 0, y: 16, w: 8, h: 4, minW: 4, minH: 3 }
  ],
  sm: [
    { i: 'chat', x: 0, y: 0, w: 6, h: 10 },
    { i: 'editor', x: 0, y: 10, w: 6, h: 6 },
    { i: 'terminal', x: 0, y: 16, w: 6, h: 4 }
  ]
};

export default function Workspace({ onShowCredentials, onBackToClassic }) {
  const [layouts, setLayouts] = useState(DEFAULT_LAYOUTS);
  const [showCredentials, setShowCredentials] = useState(false);
  const [visiblePanels, setVisiblePanels] = useState({
    chat: true,
    editor: true,
    terminal: true
  });

  // Load saved layout from database on mount
  useEffect(() => {
    loadLayout();
  }, []);

  const loadLayout = async () => {
    try {
      const apiKey = await getBackendApiKeyAsync();
      const response = await fetch('http://127.0.0.1:3001/api/workspace/layout', {
        headers: { 'x-api-key': apiKey || '' }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.layout) {
          setLayouts(data.layout);
        }
      }
    } catch (err) {
      console.log('No saved layout, using defaults');
    }
  };

  const saveLayout = async (newLayouts) => {
    try {
      const apiKey = await getBackendApiKeyAsync();
      await fetch('http://127.0.0.1:3001/api/workspace/layout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey || ''
        },
        body: JSON.stringify({ layout: newLayouts })
      });
    } catch (err) {
      console.error('Failed to save layout:', err);
    }
  };

  const handleLayoutChange = (layout, allLayouts) => {
    setLayouts(allLayouts);
    saveLayout(allLayouts);
  };

  const togglePanel = (panelId) => {
    setVisiblePanels(prev => ({
      ...prev,
      [panelId]: !prev[panelId]
    }));
  };

  const resetLayout = () => {
    setLayouts(DEFAULT_LAYOUTS);
    saveLayout(DEFAULT_LAYOUTS);
  };

  return (
    <div style={{ 
      height: '100vh', 
      width: '100vw',
      backgroundColor: '#1e1e1e',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Toolbar */}
      <div style={{
        height: '48px',
        backgroundColor: '#2d2d30',
        borderBottom: '1px solid #3e3e42',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <h1 style={{ 
            margin: 0, 
            fontSize: '16px', 
            fontWeight: '600',
            color: '#cccccc'
          }}>
            AI Assistant Workspace
          </h1>
          
          <div style={{ 
            height: '24px', 
            width: '1px', 
            backgroundColor: '#3e3e42' 
          }} />
          
          {/* Panel toggles */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {['chat', 'editor', 'terminal'].map(panel => (
              <button
                key={panel}
                onClick={() => togglePanel(panel)}
                style={{
                  padding: '4px 12px',
                  fontSize: '12px',
                  backgroundColor: visiblePanels[panel] ? '#0e639c' : '#3e3e42',
                  color: '#cccccc',
                  border: 'none',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  textTransform: 'capitalize'
                }}
              >
                {panel}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={onBackToClassic}
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              backgroundColor: '#3e3e42',
              color: '#cccccc',
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer'
            }}
          >
            ◀ Classic
          </button>
          
          <button
            onClick={resetLayout}
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              backgroundColor: '#3e3e42',
              color: '#cccccc',
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer'
            }}
          >
            Reset Layout
          </button>
          
          <button
            onClick={() => {
              if (onShowCredentials) {
                onShowCredentials();
              } else {
                setShowCredentials(true);
              }
            }}
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              backgroundColor: '#0e639c',
              color: 'white',
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer'
            }}
          >
            🔑 Credentials
          </button>
        </div>
      </div>

      {/* Grid Layout */}
      <div style={{ flex: 1, overflow: 'auto', padding: '8px' }}>
        <ResponsiveGridLayout
          className="layout"
          layouts={layouts}
          breakpoints={{ lg: 1200, md: 996, sm: 768 }}
          cols={{ lg: 12, md: 8, sm: 6 }}
          rowHeight={30}
          onLayoutChange={handleLayoutChange}
          draggableHandle=".panel-header"
          isDraggable={true}
          isResizable={true}
        >
          {visiblePanels.chat && (
            <div key="chat" style={{ backgroundColor: '#252526', border: '1px solid #3e3e42', borderRadius: '4px', overflow: 'hidden' }}>
              <ChatPanel />
            </div>
          )}
          
          {visiblePanels.editor && (
            <div key="editor" style={{ backgroundColor: '#252526', border: '1px solid #3e3e42', borderRadius: '4px', overflow: 'hidden' }}>
              <EditorPanel />
            </div>
          )}
          
          {visiblePanels.terminal && (
            <div key="terminal" style={{ backgroundColor: '#252526', border: '1px solid #3e3e42', borderRadius: '4px', overflow: 'hidden' }}>
              <TerminalPanel />
            </div>
          )}
        </ResponsiveGridLayout>
      </div>

      <CredentialManager visible={showCredentials} onClose={() => setShowCredentials(false)} />
    </div>
  );
}
