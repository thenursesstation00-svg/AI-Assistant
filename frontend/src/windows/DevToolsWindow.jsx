// DevToolsWindow.jsx - Code editor + terminal
import React, { useState } from 'react';
import Editor from '@monaco-editor/react';

export default function DevToolsWindow() {
  const [activeTab, setActiveTab] = useState('editor');
  const [code, setCode] = useState('// Write your code here\nconsole.log("Hello from AI Assistant!");');
  const [language, setLanguage] = useState('javascript');
  const [terminalOutput, setTerminalOutput] = useState([
    { type: 'info', text: '🚀 Terminal initialized' },
    { type: 'success', text: 'Ready for commands...' }
  ]);
  const [terminalInput, setTerminalInput] = useState('');

  const languages = [
    { id: 'javascript', label: 'JavaScript', icon: '📜' },
    { id: 'typescript', label: 'TypeScript', icon: '🔷' },
    { id: 'python', label: 'Python', icon: '🐍' },
    { id: 'java', label: 'Java', icon: '☕' },
    { id: 'cpp', label: 'C++', icon: '⚙️' },
    { id: 'rust', label: 'Rust', icon: '🦀' },
    { id: 'go', label: 'Go', icon: '🔵' }
  ];

  const handleTerminalSubmit = async (e) => {
    e.preventDefault();
    if (!terminalInput.trim()) return;

    setTerminalOutput(prev => [...prev, { type: 'command', text: `$ ${terminalInput}` }]);
    
    // Simulate command execution
    setTimeout(() => {
      setTerminalOutput(prev => [...prev, { 
        type: 'output', 
        text: `Command "${terminalInput}" executed successfully` 
      }]);
    }, 300);
    
    setTerminalInput('');
  };

  return (
    <div className="devtools-window">
      <div className="devtools-tabs">
        <button
          className={`devtools-tab ${activeTab === 'editor' ? 'active' : ''}`}
          onClick={() => setActiveTab('editor')}
        >
          💻 Code Editor
        </button>
        <button
          className={`devtools-tab ${activeTab === 'terminal' ? 'active' : ''}`}
          onClick={() => setActiveTab('terminal')}
        >
          📟 Terminal
        </button>
        <button
          className={`devtools-tab ${activeTab === 'git' ? 'active' : ''}`}
          onClick={() => setActiveTab('git')}
        >
          🔀 Git
        </button>
      </div>

      {activeTab === 'editor' && (
        <div className="editor-panel">
          <div className="editor-toolbar">
            <select
              className="language-select"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              {languages.map(lang => (
                <option key={lang.id} value={lang.id}>
                  {lang.icon} {lang.label}
                </option>
              ))}
            </select>
            <button className="toolbar-btn">▶️ Run</button>
            <button className="toolbar-btn">💾 Save</button>
            <button className="toolbar-btn">🤖 AI Assist</button>
          </div>
          <Editor
            height="calc(100% - 50px)"
            language={language}
            value={code}
            onChange={(value) => setCode(value || '')}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              fontFamily: 'JetBrains Mono, Fira Code, monospace',
              lineNumbers: 'on',
              roundedSelection: false,
              scrollBeyondLastLine: false,
              automaticLayout: true
            }}
          />
        </div>
      )}

      {activeTab === 'terminal' && (
        <div className="terminal-panel">
          <div className="terminal-output">
            {terminalOutput.map((line, idx) => (
              <div key={idx} className={`terminal-line ${line.type}`}>
                {line.text}
              </div>
            ))}
          </div>
          <form onSubmit={handleTerminalSubmit} className="terminal-input-form">
            <span className="terminal-prompt">$</span>
            <input
              type="text"
              className="terminal-input"
              value={terminalInput}
              onChange={(e) => setTerminalInput(e.target.value)}
              placeholder="Enter command..."
              autoFocus
            />
          </form>
        </div>
      )}

      {activeTab === 'git' && (
        <div className="git-panel">
          <div className="git-section">
            <h3>📊 Repository Status</h3>
            <div className="git-status">
              <div className="git-info">✅ Clean working tree</div>
              <div className="git-info">🌿 Branch: main</div>
              <div className="git-info">📍 3 commits ahead</div>
            </div>
          </div>
          <div className="git-section">
            <h3>🔄 Recent Commits</h3>
            <div className="commit-list">
              <div className="commit-item">
                <div className="commit-hash">#a3f9c2</div>
                <div className="commit-message">Add futuristic UI system</div>
              </div>
              <div className="commit-item">
                <div className="commit-hash">#b7e5d1</div>
                <div className="commit-message">Implement file upload</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .devtools-window {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: rgba(10, 10, 30, 0.4);
        }
        .devtools-tabs {
          display: flex;
          gap: 8px;
          padding: 12px;
          border-bottom: 1px solid rgba(0, 240, 255, 0.2);
        }
        .devtools-tab {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(0, 240, 255, 0.2);
          border-radius: 8px;
          padding: 8px 16px;
          color: #a0a0d0;
          cursor: pointer;
          transition: all 0.3s;
        }
        .devtools-tab.active {
          background: linear-gradient(135deg, rgba(0, 240, 255, 0.2), rgba(180, 0, 255, 0.2));
          border-color: #00f0ff;
          color: #00f0ff;
          box-shadow: 0 0 15px rgba(0, 240, 255, 0.3);
        }
        .editor-panel, .terminal-panel, .git-panel {
          flex: 1;
          overflow: hidden;
        }
        .editor-toolbar {
          display: flex;
          gap: 12px;
          padding: 12px;
          background: rgba(0, 0, 0, 0.3);
          border-bottom: 1px solid rgba(0, 240, 255, 0.1);
        }
        .language-select, .toolbar-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(0, 240, 255, 0.3);
          border-radius: 6px;
          padding: 6px 12px;
          color: #e0e0f0;
          cursor: pointer;
        }
        .toolbar-btn:hover {
          background: rgba(0, 240, 255, 0.2);
          border-color: #00f0ff;
        }
        .terminal-panel {
          display: flex;
          flex-direction: column;
          padding: 16px;
        }
        .terminal-output {
          flex: 1;
          overflow-y: auto;
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
          line-height: 1.6;
        }
        .terminal-line {
          padding: 4px 0;
          color: #a0a0d0;
        }
        .terminal-line.command { color: #00f0ff; }
        .terminal-line.success { color: #00ff88; }
        .terminal-line.error { color: #ff4466; }
        .terminal-line.info { color: #ffaa00; }
        .terminal-input-form {
          display: flex;
          gap: 8px;
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid rgba(0, 240, 255, 0.2);
        }
        .terminal-prompt {
          color: #00f0ff;
          font-family: 'JetBrains Mono', monospace;
          font-weight: bold;
        }
        .terminal-input {
          flex: 1;
          background: transparent;
          border: none;
          color: #e0e0f0;
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
          outline: none;
        }
        .git-panel {
          padding: 20px;
          overflow-y: auto;
        }
        .git-section {
          margin-bottom: 24px;
        }
        .git-section h3 {
          color: #00f0ff;
          margin-bottom: 12px;
        }
        .git-status, .commit-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .git-info, .commit-item {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(0, 240, 255, 0.2);
          border-radius: 8px;
          padding: 12px;
          color: #e0e0f0;
        }
        .commit-item {
          display: flex;
          gap: 12px;
          align-items: center;
        }
        .commit-hash {
          font-family: 'JetBrains Mono', monospace;
          color: #b400ff;
          font-weight: bold;
        }
      `}</style>
    </div>
  );
}
