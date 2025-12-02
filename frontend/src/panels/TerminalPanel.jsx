// frontend/src/panels/TerminalPanel.jsx
// Integrated terminal with xterm.js

import React, { useEffect, useRef, useState } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { API_URL, getBackendApiKeyAsync } from '../config';
import { buildCfeSnapshotFromWindowManager } from '../utils/cfe';
import '@xterm/xterm/css/xterm.css';

export default function TerminalPanel({ uiState, mode = 'shell' }) {
  const terminalRef = useRef(null);
  const xtermRef = useRef(null);
  const fitAddonRef = useRef(null);
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [commandMode, setCommandMode] = useState(mode);
  const commandHistoryRef = useRef(commandHistory);
  const historyIndexRef = useRef(historyIndex);

  useEffect(() => {
    commandHistoryRef.current = commandHistory;
  }, [commandHistory]);

  useEffect(() => {
    historyIndexRef.current = historyIndex;
  }, [historyIndex]);

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
        const trimmed = currentLine.trim();
        if (trimmed) {
          handleCommand(trimmed, term);
        } else {
          writePrompt(term);
        }
        currentLine = '';
      } else if (code === 127) { // Backspace
        if (currentLine.length > 0) {
          currentLine = currentLine.slice(0, -1);
          term.write('\b \b');
        }
      } else if (code === 27) { // Escape sequences (arrow keys)
        // Handle arrow keys for history navigation
        if (data === '\x1b[A') { // Up arrow
          if (historyIndexRef.current < commandHistoryRef.current.length - 1) {
            const newIndex = historyIndexRef.current + 1;
            setHistoryIndex(newIndex);
            historyIndexRef.current = newIndex;
            const histCmd = commandHistoryRef.current[commandHistoryRef.current.length - 1 - newIndex];
            term.write('\r\x1b[K');
            writePrompt(term);
            term.write(histCmd);
            currentLine = histCmd;
          }
        } else if (data === '\x1b[B') { // Down arrow
          if (historyIndexRef.current > 0) {
            const newIndex = historyIndexRef.current - 1;
            setHistoryIndex(newIndex);
            historyIndexRef.current = newIndex;
            const histCmd = commandHistoryRef.current[commandHistoryRef.current.length - 1 - newIndex];
            term.write('\r\x1b[K');
            writePrompt(term);
            term.write(histCmd);
            currentLine = histCmd;
          } else if (historyIndexRef.current === 0) {
            setHistoryIndex(-1);
            historyIndexRef.current = -1;
            term.write('\r\x1b[K');
            writePrompt(term);
            currentLine = '';
          }
        }
      } else if (code >= 32 && code <= 126) { // Printable characters
        currentLine += data;
        term.write(data);
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
    const modeLabel = commandMode === 'shell' ? 'sh' : 'ai';
    term.write(`\r\n\x1b[1;36m${modeLabel}❯\x1b[0m `);
  };

  const handleCommand = (input, term) => {
    setCommandHistory(prev => {
      const updated = [...prev, input];
      commandHistoryRef.current = updated;
      return updated;
    });
    setHistoryIndex(-1);
    historyIndexRef.current = -1;

    if (commandMode === 'shell') {
      executeShellCommand(input, term);
    } else {
      enqueueAiCommand(input, term);
    }
  };

  const enqueueAiCommand = async (prompt, term) => {
    term.writeln('\x1b[1;35m[AI] Planning command...\x1b[0m');
    try {
      const apiKey = await getBackendApiKeyAsync();
      const context = buildCfeSnapshotFromWindowManager(uiState || {});
      const response = await fetch(`${API_URL}/api/ai/terminal/agent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey || ''
        },
        body: JSON.stringify({ prompt, autoExecute: true, context })
      });

      const payload = await response.json();

      if (!response.ok || payload.success === false) {
        term.writeln(`\x1b[1;31mAI mode error: ${payload.error || response.statusText}\x1b[0m`);
        writePrompt(term);
        return;
      }

      const { plan, execution } = payload;

      if (!plan || !plan.command) {
        term.writeln('\x1b[1;33mAI could not generate a command.\x1b[0m');
        writePrompt(term);
        return;
      }

      const confidenceLabel = plan.confidence ? `${Math.round(plan.confidence * 100)}%` : 'n/a';
      term.writeln(`\x1b[1;35m[AI ${plan.source || 'heuristic'} | ${confidenceLabel}] ${plan.command}\x1b[0m`);
      if (plan.explanation) {
        term.writeln(`\x1b[90m${plan.explanation}\x1b[0m`);
      }

      if (plan.blocked || execution?.blocked) {
        term.writeln('\x1b[1;31mCommand blocked by safety policies.\x1b[0m');
      } else if (execution?.ran) {
        const lines = (execution.output || '').split('\n');
        lines.forEach(line => term.writeln(line));
        if (execution.error) {
          term.writeln(`\x1b[1;33m${execution.error}\x1b[0m`);
        }
      } else {
        term.writeln(`\x1b[1;33mExecution skipped. Run manually:\x1b[0m ${plan.command}`);
      }
    } catch (error) {
      term.writeln(`\x1b[1;31mFailed to run AI workflow: ${error.message}\x1b[0m`);
    }

    writePrompt(term);
  };

  const executeShellCommand = async (command, term) => {
    try {
      const apiKey = await getBackendApiKeyAsync();
      const response = await fetch(`${API_URL}/api/command`, {
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
      xtermRef.current.writeln('\x1b[1;32mAI Developer Terminal\x1b[0m');
      writePrompt(xtermRef.current);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div
        className="panel-header"
        style={{
          padding: '8px 12px',
          backgroundColor: '#2d2d30',
          borderBottom: '1px solid #3e3e42',
          cursor: 'move',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <span style={{ fontSize: '13px', fontWeight: '500', color: '#cccccc' }}>⚡ Developer Terminal</span>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div style={{ fontSize: 11, color: '#ccc', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span>Mode:</span>
            <button
              onClick={() => setCommandMode('shell')}
              style={{
                padding: '2px 8px',
                fontSize: 11,
                backgroundColor: commandMode === 'shell' ? '#007acc' : '#3e3e42',
                color: '#ffffff',
                border: 'none',
                borderRadius: 3,
                cursor: 'pointer'
              }}
            >
              Shell
            </button>
            <button
              onClick={() => setCommandMode('ai')}
              style={{
                padding: '2px 8px',
                fontSize: 11,
                backgroundColor: commandMode === 'ai' ? '#007acc' : '#3e3e42',
                color: '#ffffff',
                border: 'none',
                borderRadius: 3,
                cursor: 'pointer'
              }}
            >
              AI
            </button>
          </div>
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
