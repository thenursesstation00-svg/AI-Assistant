// frontend/src/utils/cfe.js

export function buildCfeSnapshotFromWindowManager(uiState) {
  const active = uiState.activeWindow || null;
  const windows = uiState.windows || [];

  const open_windows = windows.map(w => ({
    id: w.id,
    type: w.type,
    title: w.title || "",
    focused: w.id === active,
  }));

  // Optional editor/terminal/system info – fill in where available
  const cfe = {
    session_id: uiState.sessionId || `sess_${Date.now()}`,
    timestamp: Date.now(),
    active_window: active,
    open_windows,
    path: uiState.activePath || null,
    cursor: uiState.cursorPosition || null, // { line, col }
    selected_text_snippet: uiState.selectedText || null,
    terminal_errors: uiState.terminalErrors || [],
    system_metrics: uiState.systemHealth || {},
    user_history: uiState.history || [],
    summary: `Active=${active}; open=${windows.map(w => w.id).join(",")}`,
  };

  return cfe;
}
