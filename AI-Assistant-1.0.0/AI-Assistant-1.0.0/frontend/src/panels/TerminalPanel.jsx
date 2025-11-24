// frontend/src/panels/TerminalPanel.jsx
// Integrated terminal with xterm.js

import React, { useEffect, useRef, useState } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { getBackendApiKeyAsync } from '../config';
import '@xterm/xterm/css/xterm.css';

export default function TerminalPanel() {
  const terminalRef = useRef(null);
  const xtermRef = useRef(null);
  const fitAddonRef = useRef(null);
  const [currentCommand, setCurrentCommand] = useState('');
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  useEffect(() => {
    if (!terminalRef.current || xtermRef.current) return;

    // Initialize xterm
    const term = new Terminal({
      cursorBlink: true,
      fontSize: 13,
      fontFamily: 'Consolas, "Courier New", monospace',
      theme: {
        background: '#1e1e1e',
        foreground: '#cccccc',
        cursor: '#ffffff',
        black: '#000000',
        red: '#cd3131',
        green: '#0dbc79',
        yellow: '#e5e510',
        blue: '#2472c8',
        magenta: '#bc3fbc',
        cyan: '#11a8cd',
        white: '#e5e5e5',
        brightBlack: '#666666',
        brightRed: '#f14c4c',
        brightGreen: '#23d18b',
        brightYellow: '#f5f543',
        brightBlue: '#3b8eea',
        brightMagenta: '#d670d6',
        brightCyan: '#29b8db',
        brightWhite: '#e5e5e5'
      },
      rows: 20,
      cols: 80
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalRef.current);
    fitAddon.fit();

    xtermRef.current = term;
    fitAddonRef.current = fitAddon;

    // Welcome message
    term.writeln('\x1b[1;32mAI Assistant Terminal\x1b[0m');
    term.writeln('Type commands to execute on the backend server.\n');
    writePrompt(term);

    // Handle input
    let currentLine = '';
    term.onData((data) => {
      const code = data.charCodeAt(0);

      if (code === 13) { // Enter
        term.write('\r\n');
        if (currentLine.trim()) {
          executeCommand(currentLine.trim(), term);
          setCommandHistory(prev => [...prev, currentLine.trim()]);
          setHistoryIndex(-1);
        } else {
          writePrompt(term);
        }
        currentLine = '';
        setCurrentCommand('');
      } else if (code === 127) { // Backspace
        if (currentLine.length > 0) {
          currentLine = currentLine.slice(0, -1);
          term.write('\b \b');
          setCurrentCommand(currentLine);
        }
      } else if (code === 27) { // Escape sequences (arrow keys)
        // Handle arrow keys for history navigation
        if (data === '\x1b[A') { // Up arrow
          if (historyIndex < commandHistory.length - 1) {
            const newIndex = historyIndex + 1;
            setHistoryIndex(newIndex);
            const histCmd = commandHistory[commandHistory.length - 1 - newIndex];
            // Clear current line
            term.write('\r\x1b[K');
            writePrompt(term);
            term.write(histCmd);
            currentLine = histCmd;
            setCurrentCommand(currentLine);
          }
        } else if (data === '\x1b[B') { // Down arrow
          if (historyIndex > 0) {
            const newIndex = historyIndex - 1;
            setHistoryIndex(newIndex);
            const histCmd = commandHistory[commandHistory.length - 1 - newIndex];
            term.write('\r\x1b[K');
            writePrompt(term);
            term.write(histCmd);
            currentLine = histCmd;
            setCurrentCommand(currentLine);
          } else if (historyIndex === 0) {
            setHistoryIndex(-1);
            term.write('\r\x1b[K');
            writePrompt(term);
            currentLine = '';
            setCurrentCommand('');
          }
        }
      } else if (code >= 32 && code <= 126) { // Printable characters
        currentLine += data;
        term.write(data);
        setCurrentCommand(currentLine);
      }
    });

    // Handle resize
    const resizeObserver = new ResizeObserver(() => {
      fitAddon.fit();
    });
    resizeObserver.observe(terminalRef.current);

    return () => {
      resizeObserver.disconnect();
      term.dispose();
    };
  }, []);

  const writePrompt = (term) => {
    term.write('\r\n\x1b[1;36m❯\x1b[0m ');
  };

  const executeCommand = async (command, term) => {
    try {
      const apiKey = await getBackendApiKeyAsync();
      const response = await fetch('http://127.0.0.1:3001/api/command', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey || ''
        },
        body: JSON.stringify({ command })
      });

      const data = await response.json();
      
      if (data.success) {
        // Write output line by line
        const lines = data.output.split('\n');
        lines.forEach(line => {
          term.writeln(line);
        });
      } else {
        term.writeln(`\x1b[1;31mError: ${data.error || data.output}\x1b[0m`);
      }
    } catch (error) {
      term.writeln(`\x1b[1;31mFailed to execute command: ${error.message}\x1b[0m`);
    }
    
    writePrompt(term);
  };

  const clearTerminal = () => {
    if (xtermRef.current) {
      xtermRef.current.clear();
      writePrompt(xtermRef.current);
    }
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
        <span style={{ fontSize: '13px', fontWeight: '500', color: '#cccccc' }}>⚡ Terminal</span>
        
        <button
          onClick={clearTerminal}
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
          Clear
        </button>
      </div>

      <div 
        ref={terminalRef} 
        style={{ 
          flex: 1, 
          padding: '8px',
          overflow: 'hidden'
        }} 
      />
    </div>
  );
}
