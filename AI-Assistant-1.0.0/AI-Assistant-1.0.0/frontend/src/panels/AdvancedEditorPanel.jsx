// Advanced Intelligent Editor Panel
// Integrates AI-powered editing, self-learning, and external editor bridges

import React, { useState, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';

export default function AdvancedEditorPanel() {
  const [code, setCode] = useState('// AI-Powered Editor\n// This editor learns from your edits and can self-improve\n\nfunction example() {\n  console.log("Start coding...");\n}\n');
  const [language, setLanguage] = useState('javascript');
  const [theme, setTheme] = useState('vs-dark');
  const [filePath, setFilePath] = useState('untitled.js');
  const [aiInsights, setAiInsights] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [externalEditors, setExternalEditors] = useState([]);
  const [learningStats, setLearningStats] = useState(null);
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadLearningStats();
    loadExternalEditorStatus();
  }, []);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    
    editor.updateOptions({
      fontSize: 14,
      minimap: { enabled: true },
      scrollBeyondLastLine: false,
      wordWrap: 'on',
      automaticLayout: true,
      suggestOnTriggerCharacters: true,
      quickSuggestions: true,
      formatOnType: true,
      formatOnPaste: true
    });

    // Record edit action for learning
    editor.onDidChangeModelContent(() => {
      recordEditAction();
    });
  };

  const recordEditAction = async () => {
    try {
      await fetch('http://127.0.0.1:3001/api/ai/record-action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': window.__APP_CONFIG__?.BACKEND_API_KEY || localStorage.getItem('backend_api_key')
        },
        body: JSON.stringify({
          type: 'code_edit',
          context: { language, filePath },
          parameters: { autoFormat: true },
          metadata: { codeLength: code.length }
        })
      });
    } catch (error) {
      console.error('Failed to record action:', error);
    }
  };

  const analyzeCode = async () => {
    setIsAnalyzing(true);
    try {
      const response = await fetch('http://127.0.0.1:3001/api/ai/analyze-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': window.__APP_CONFIG__?.BACKEND_API_KEY || localStorage.getItem('backend_api_key')
        },
        body: JSON.stringify({ code, language, filePath })
      });

      const data = await response.json();
      setAiInsights(data.analysis?.improvements || []);
    } catch (error) {
      console.error('Analysis failed:', error);
      setAiInsights([{ type: 'error', suggestion: 'Analysis failed', priority: 'low' }]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const applyAiImprovements = async () => {
    if (aiInsights.length === 0) {
      alert('Run code analysis first');
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:3001/api/ai/improve-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': window.__APP_CONFIG__?.BACKEND_API_KEY || localStorage.getItem('backend_api_key')
        },
        body: JSON.stringify({ 
          code, 
          language, 
          filePath,
          improvements: aiInsights 
        })
      });

      const data = await response.json();
      if (data.improved) {
        setCode(data.improved);
        alert('Code improvements applied! Check the diff.');
      }
    } catch (error) {
      console.error('Improvement failed:', error);
      alert('Failed to apply improvements');
    }
  };

  const openInExternalEditor = async (editorType) => {
    try {
      const response = await fetch('http://127.0.0.1:3001/api/ai/open-external', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': window.__APP_CONFIG__?.BACKEND_API_KEY || localStorage.getItem('backend_api_key')
        },
        body: JSON.stringify({ 
          editor: editorType, 
          filePath,
          content: code,
          language
        })
      });

      const data = await response.json();
      if (data.url) {
        window.open(data.url, '_blank');
      }
      alert(`Opening in ${editorType}... Session ID: ${data.sessionId}`);
    } catch (error) {
      console.error('Failed to open external editor:', error);
      alert('Failed to open external editor');
    }
  };

  const loadLearningStats = async () => {
    try {
      const response = await fetch('http://127.0.0.1:3001/api/ai/learning-stats', {
        headers: {
          'x-api-key': window.__APP_CONFIG__?.BACKEND_API_KEY || localStorage.getItem('backend_api_key')
        }
      });
      const data = await response.json();
      setLearningStats(data.stats);
    } catch (error) {
      console.error('Failed to load learning stats:', error);
    }
  };

  const loadExternalEditorStatus = async () => {
    try {
      const response = await fetch('http://127.0.0.1:3001/api/ai/external-sessions', {
        headers: {
          'x-api-key': window.__APP_CONFIG__?.BACKEND_API_KEY || localStorage.getItem('backend_api_key')
        }
      });
      const data = await response.json();
      setExternalEditors(data.sessions || []);
    } catch (error) {
      console.error('Failed to load external editor status:', error);
    }
  };

  const formatCode = () => {
    if (editorRef.current) {
      editorRef.current.getAction('editor.action.formatDocument').run();
    }
  };

  const saveFile = async () => {
    try {
      const response = await fetch('http://127.0.0.1:3001/api/ai/save-file', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': window.__APP_CONFIG__?.BACKEND_API_KEY || localStorage.getItem('backend_api_key')
        },
        body: JSON.stringify({ filePath, content: code })
      });

      if (response.ok) {
        alert('File saved successfully!');
      }
    } catch (error) {
      console.error('Save failed:', error);
      alert('Failed to save file');
    }
  };

  const openFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const text = await file.text();
    setCode(text);
    setFilePath(file.name);
    
    const ext = file.name.split('.').pop();
    const langMap = {
      'js': 'javascript',
      'ts': 'typescript',
      'py': 'python',
      'java': 'java',
      'cs': 'csharp',
      'cpp': 'cpp',
      'go': 'go',
      'rs': 'rust',
      'html': 'html',
      'css': 'css',
      'json': 'json',
      'md': 'markdown',
      'sql': 'sql'
    };
    setLanguage(langMap[ext] || 'javascript');
  };

  const triggerSelfOptimization = async () => {
    try {
      const response = await fetch('http://127.0.0.1:3001/api/ai/self-optimize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': window.__APP_CONFIG__?.BACKEND_API_KEY || localStorage.getItem('backend_api_key')
        }
      });

      const data = await response.json();
      alert(`Self-optimization complete!\nOptimizations applied: ${data.appliedOptimizations}\nCheck insights for details.`);
      loadLearningStats();
    } catch (error) {
      console.error('Self-optimization failed:', error);
      alert('Self-optimization failed');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#1e1e1e' }}>
      {/* Header */}
      <div style={{
        padding: '8px 12px',
        backgroundColor: '#2d2d30',
        borderBottom: '1px solid #3e3e42',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', fontWeight: '500', color: '#cccccc' }}>🧠 AI-Powered Editor</span>
          <input
            type="text"
            value={filePath}
            onChange={(e) => setFilePath(e.target.value)}
            style={{
              padding: '4px 8px',
              fontSize: '11px',
              backgroundColor: '#3c3c3c',
              border: '1px solid #3e3e42',
              borderRadius: '3px',
              color: '#cccccc',
              width: '200px'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            style={{
              padding: '4px 8px',
              fontSize: '11px',
              backgroundColor: '#3c3c3c',
              border: '1px solid #3e3e42',
              borderRadius: '3px',
              color: '#cccccc',
              cursor: 'pointer'
            }}
          >
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="csharp">C#</option>
            <option value="cpp">C++</option>
            <option value="go">Go</option>
            <option value="rust">Rust</option>
            <option value="html">HTML</option>
            <option value="css">CSS</option>
            <option value="json">JSON</option>
            <option value="markdown">Markdown</option>
            <option value="sql">SQL</option>
          </select>

          <input
            type="file"
            ref={fileInputRef}
            onChange={openFile}
            style={{ display: 'none' }}
          />
          <button onClick={() => fileInputRef.current?.click()} style={buttonStyle}>📂 Open</button>
          <button onClick={saveFile} style={buttonStyle}>💾 Save</button>
          <button onClick={formatCode} style={buttonStyle}>✨ Format</button>
        </div>
      </div>

      {/* Main Editor */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
        <div style={{ flex: 3 }}>
          <Editor
            height="100%"
            language={language}
            value={code}
            theme={theme}
            onChange={(value) => setCode(value || '')}
            onMount={handleEditorDidMount}
            options={{
              selectOnLineNumbers: true,
              roundedSelection: false,
              readOnly: false,
              cursorStyle: 'line',
              automaticLayout: true,
            }}
          />
        </div>

        {/* AI Insights Sidebar */}
        <div style={{
          flex: 1,
          backgroundColor: '#252526',
          borderLeft: '1px solid #3e3e42',
          padding: '12px',
          overflowY: 'auto'
        }}>
          <h3 style={{ color: '#cccccc', fontSize: '12px', marginTop: 0 }}>🤖 AI Insights</h3>
          
          <div style={{ marginBottom: '12px' }}>
            <button 
              onClick={analyzeCode} 
              disabled={isAnalyzing}
              style={{...buttonStyle, width: '100%', marginBottom: '8px'}}
            >
              {isAnalyzing ? '⏳ Analyzing...' : '🔍 Analyze Code'}
            </button>
            <button 
              onClick={applyAiImprovements}
              disabled={aiInsights.length === 0}
              style={{...buttonStyle, width: '100%', marginBottom: '8px'}}
            >
              ✅ Apply Improvements
            </button>
            <button 
              onClick={triggerSelfOptimization}
              style={{...buttonStyle, width: '100%', backgroundColor: '#0e639c'}}
            >
              🧬 Self-Optimize AI
            </button>
          </div>

          {aiInsights.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ color: '#cccccc', fontSize: '11px' }}>Improvements</h4>
              {aiInsights.map((insight, idx) => (
                <div key={idx} style={{
                  padding: '8px',
                  marginBottom: '8px',
                  backgroundColor: '#1e1e1e',
                  border: `1px solid ${insight.priority === 'high' ? '#f14c4c' : '#3e3e42'}`,
                  borderRadius: '3px'
                }}>
                  <div style={{ color: '#569cd6', fontSize: '10px', fontWeight: 'bold' }}>
                    {insight.type.toUpperCase()} {insight.priority === 'high' && '⚠️'}
                  </div>
                  <div style={{ color: '#cccccc', fontSize: '10px', marginTop: '4px' }}>
                    {insight.suggestion}
                  </div>
                </div>
              ))}
            </div>
          )}

          <h4 style={{ color: '#cccccc', fontSize: '11px' }}>📖 External Editors</h4>
          <button onClick={() => openInExternalEditor('github')} style={{...buttonStyle, width: '100%', marginBottom: '4px'}}>
            🐙 GitHub
          </button>
          <button onClick={() => openInExternalEditor('codespaces')} style={{...buttonStyle, width: '100%', marginBottom: '4px'}}>
            ☁️ Codespaces
          </button>
          <button onClick={() => openInExternalEditor('vscode')} style={{...buttonStyle, width: '100%', marginBottom: '4px'}}>
            📘 VS Code
          </button>
          <button onClick={() => openInExternalEditor('codesandbox')} style={{...buttonStyle, width: '100%', marginBottom: '4px'}}>
            📦 CodeSandbox
          </button>

          {learningStats && (
            <div style={{ marginTop: '16px', padding: '8px', backgroundColor: '#1e1e1e', borderRadius: '3px' }}>
              <h4 style={{ color: '#cccccc', fontSize: '11px', marginTop: 0 }}>📊 Learning Stats</h4>
              <div style={{ fontSize: '10px', color: '#858585' }}>
                <div>Actions: {learningStats.totalActions}</div>
                <div>Success Rate: {(learningStats.successRate * 100).toFixed(1)}%</div>
                <div>Avg Quality: {(learningStats.avgQuality * 100).toFixed(1)}%</div>
                <div>Strategies: {learningStats.strategiesLearned}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div style={{
        padding: '4px 12px',
        backgroundColor: '#007acc',
        borderTop: '1px solid #3e3e42',
        fontSize: '10px',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between'
      }}>
        <span>Lines: {code.split('\n').length} | Chars: {code.length}</span>
        <span>Language: {language} | {filePath}</span>
        <span>AI Learning: Active ✓</span>
      </div>
    </div>
  );
}

const buttonStyle = {
  padding: '4px 10px',
  fontSize: '11px',
  backgroundColor: '#3e3e42',
  color: '#cccccc',
  border: 'none',
  borderRadius: '3px',
  cursor: 'pointer'
};
