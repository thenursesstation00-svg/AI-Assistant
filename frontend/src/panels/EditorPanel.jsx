// frontend/src/panels/EditorPanel.jsx
// Monaco Editor (VS Code engine) panel

import React, { useState, useRef } from 'react';
import Editor from '@monaco-editor/react';

export default function EditorPanel() {
  const [code, setCode] = useState('// Welcome to AI Assistant Code Editor\n// Start coding here...\n\nfunction hello() {\n  console.log("Hello from AI Assistant!");\n}\n');
  const [language, setLanguage] = useState('javascript');
  const [theme, setTheme] = useState('vs-dark');
  const editorRef = useRef(null);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    
    // Configure editor options
    editor.updateOptions({
      fontSize: 13,
      minimap: { enabled: true },
      scrollBeyondLastLine: false,
      wordWrap: 'on',
      automaticLayout: true
    });
  };

  const formatCode = () => {
    if (editorRef.current) {
      editorRef.current.getAction('editor.action.formatDocument').run();
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="panel-header" style={{
        padding: '8px 12px',
        backgroundColor: '#2d2d30',
        borderBottom: '1px solid #3e3e42',
        cursor: 'move',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span style={{ fontSize: '13px', fontWeight: '500', color: '#cccccc' }}>📝 Editor</span>
        
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

          <button
            onClick={formatCode}
            style={{
              padding: '4px 10px',
              fontSize: '11px',
              backgroundColor: '#3e3e42',
              color: '#cccccc',
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer'
            }}
          >
            Format
          </button>

          <button
            onClick={copyCode}
            style={{
              padding: '4px 10px',
              fontSize: '11px',
              backgroundColor: '#3e3e42',
              color: '#cccccc',
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer'
            }}
          >
            Copy
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'hidden' }}>
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

      <div style={{
        padding: '6px 12px',
        backgroundColor: '#007acc',
        borderTop: '1px solid #3e3e42',
        fontSize: '11px',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between'
      }}>
        <span>Lines: {code.split('\n').length}</span>
        <span>Characters: {code.length}</span>
      </div>
    </div>
  );
}
