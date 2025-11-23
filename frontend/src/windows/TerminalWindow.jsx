// TerminalWindow.jsx - Integrated terminal
import React, { useState, useRef, useEffect } from 'react';

export default function TerminalWindow() {
  const [history, setHistory] = useState([
    { type: 'system', text: '🚀 AI Assistant Terminal v2.0' },
    { type: 'system', text: 'Type "help" for available commands' },
    { type: 'prompt', text: '~$' }
  ]);
  const [input, setInput] = useState('');
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef(null);
  const outputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [history]);

  const commands = {
    help: () => [
      'Available commands:',
      '  help      - Show this help message',
      '  clear     - Clear terminal',
      '  echo      - Print text',
      '  ls        - List files',
      '  pwd       - Print working directory',
      '  date      - Show current date/time',
      '  sys       - Show system info',
      '  agents    - List running AI agents',
      '  mcp       - MCP server status'
    ],
    clear: () => {
      setHistory([{ type: 'prompt', text: '~$' }]);
      return [];
    },
    echo: (args) => [args.join(' ')],
    ls: () => [
      'Documents/',
      'Downloads/',
      'Projects/',
      'AI-Assistant/',
      'notes.txt',
      'config.json'
    ],
    pwd: () => ['/home/user'],
    date: () => [new Date().toString()],
    sys: () => [
      'System: Linux Ubuntu 24.04',
      'CPU: 8 cores @ 3.5 GHz',
      'RAM: 16GB (8.2GB used)',
      'Disk: 512GB SSD (234GB free)'
    ],
    agents: () => [
      '🤖 Code Assistant     [ACTIVE]   CPU: 15%',
      '👁️  File Watcher      [ACTIVE]   CPU: 5%',
      '🧪 Test Runner       [IDLE]     CPU: 2%',
      '🔒 Security Scanner  [RUNNING]  CPU: 22%'
    ],
    mcp: () => [
      'MCP Servers Status:',
      '  ✅ filesystem    [connected]',
      '  ✅ github        [connected]',
      '  ✅ brave-search  [connected]',
      '  ✅ fetch         [connected]',
      '  ✅ puppeteer     [connected]',
      '  ✅ sqlite        [connected]',
      '  ⚠️  shell         [disabled]'
    ]
  };

  const executeCommand = (cmd) => {
    const parts = cmd.trim().split(/\s+/);
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    if (commands[command]) {
      return commands[command](args);
    } else if (cmd.trim()) {
      return [`Command not found: ${command}. Type "help" for available commands.`];
    }
    return [];
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add command to history
    setCommandHistory([...commandHistory, input]);
    setHistoryIndex(-1);

    // Add command to output
    const newHistory = [
      ...history.filter(h => h.type !== 'prompt'),
      { type: 'command', text: `~$ ${input}` }
    ];

    // Execute command
    const output = executeCommand(input);
    output.forEach(line => {
      newHistory.push({ type: 'output', text: line });
    });

    // Add new prompt
    newHistory.push({ type: 'prompt', text: '~$' });

    if (input.toLowerCase() !== 'clear') {
      setHistory(newHistory);
    }
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex < commandHistory.length - 1 ? historyIndex + 1 : historyIndex;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex]);
      } else {
        setHistoryIndex(-1);
        setInput('');
      }
    }
  };

  return (
    <div className="terminal-window" onClick={() => inputRef.current?.focus()}>
      <div className="terminal-output" ref={outputRef}>
        {history.map((line, idx) => (
          <div key={idx} className={`terminal-line ${line.type}`}>
            {line.type === 'prompt' ? (
              <span className="prompt-symbol">{line.text}</span>
            ) : (
              line.text
            )}
          </div>
        ))}
        <form onSubmit={handleSubmit} className="terminal-input-line">
          <span className="prompt-symbol">~$</span>
          <input
            ref={inputRef}
            type="text"
            className="terminal-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            autoComplete="off"
          />
        </form>
      </div>

      <style jsx>{`
        .terminal-window {
          height: 100%;
          background: rgba(5, 5, 15, 0.9);
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
          cursor: text;
        }
        .terminal-output {
          height: 100%;
          padding: 16px;
          overflow-y: auto;
          color: #00ff88;
        }
        .terminal-line {
          line-height: 1.6;
          margin-bottom: 4px;
        }
        .terminal-line.system {
          color: #00f0ff;
          font-weight: 600;
        }
        .terminal-line.command {
          color: #e0e0f0;
        }
        .terminal-line.output {
          color: #a0a0d0;
          margin-left: 20px;
        }
        .terminal-line.prompt {
          color: #00ff88;
        }
        .prompt-symbol {
          color: #00ff88;
          font-weight: bold;
          margin-right: 8px;
        }
        .terminal-input-line {
          display: flex;
          align-items: center;
        }
        .terminal-input {
          flex: 1;
          background: transparent;
          border: none;
          color: #e0e0f0;
          font-family: inherit;
          font-size: 14px;
          outline: none;
          caret-color: #00ff88;
        }
        .terminal-output::-webkit-scrollbar {
          width: 8px;
        }
        .terminal-output::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
        }
        .terminal-output::-webkit-scrollbar-thumb {
          background: rgba(0, 240, 255, 0.3);
          border-radius: 4px;
        }
        .terminal-output::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 240, 255, 0.5);
        }
      `}</style>
    </div>
  );
}
