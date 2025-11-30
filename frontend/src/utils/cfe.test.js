import { buildCfeSnapshotFromWindowManager } from './cfe';

test('buildCfeSnapshotFromWindowManager returns correct shape and summary', () => {
  const uiState = {
    activeWindow: 'win1',
    windows: [
      { id: 'win1', type: 'chat', title: 'Chat' },
      { id: 'win2', type: 'devtools', title: 'DevTools' }
    ],
    sessionId: 'sess123',
    activePath: '/foo/bar.js',
    cursorPosition: { line: 10, col: 5 },
    selectedText: 'let x = 1;',
    terminalErrors: [{ message: 'Error!' }],
    systemHealth: { cpu: 0.5 },
    history: ['a', 'b']
  };
  const cfe = buildCfeSnapshotFromWindowManager(uiState);
  expect(cfe).toHaveProperty('session_id', 'sess123');
  expect(cfe).toHaveProperty('active_window', 'win1');
  expect(cfe.open_windows.length).toBe(2);
  expect(cfe.summary).toContain('Active=win1');
});
