# Futuristic UI System

## Overview

The **Futuristic UI** is a next-generation, fully customizable workspace interface with draggable windows, glass morphism styling, neon accents, and AI agent integration. It provides a sci-fi themed personal assistant experience with complete control over window layouts.

## Features

### 🪟 Window Management
- **Draggable Windows** - Click and drag title bars to reposition windows
- **Resizable** - Drag edges or corners to resize (enforces 300x200px minimum)
- **Minimize/Maximize/Close** - Full window state management
- **Multi-Window** - Open multiple instances of the same window type
- **Active Window Highlighting** - Clear visual indication of focused window
- **Minimized Preview** - Bottom panel shows minimized windows for quick restore

### 🎨 Visual Design
- **Glass Morphism** - Translucent backgrounds with backdrop blur
- **Neon Accents** - Cyan (#00f0ff) and purple (#b400ff) gradient themes
- **Animated Background** - Scrolling grid with floating particles
- **Holographic Effects** - Gradient sweeps and glowing borders
- **Status Bar** - Top bar showing system stats and active windows
- **Dock** - Bottom application launcher with hover effects

### 🚀 Window Types

#### 💬 Chat Window
- AI assistant chat with file upload support
- ReactMarkdown rendering
- File attachment chips
- Drag-drop file upload area
- Real-time typing indicators

#### ⚡ Developer Tools
- **Code Editor** - Monaco editor with syntax highlighting (JavaScript, TypeScript, Python, Java, C++, Rust, Go)
- **Terminal** - Integrated command execution
- **Git Panel** - Repository status and commit history
- Tabbed interface for easy switching

#### 📁 File Explorer
- System file browser (mock data for now)
- List/Grid view modes
- File details sidebar
- Quick actions (upload to chat, preview, copy path)
- Path navigation

#### 🤖 AI Agent Manager
- View and manage running AI agents
- Create custom agents with natural language prompts
- Real-time CPU usage monitoring
- Agent status indicators (active/running/idle/error)
- Start/stop/configure agent controls

#### 💻 Terminal Window
- Fully functional command terminal
- Command history (arrow up/down)
- Built-in commands: help, clear, echo, ls, pwd, date, sys, agents, mcp
- Auto-scrolling output
- Green neon terminal aesthetic

#### 📊 System Monitor
- Real-time CPU, RAM, Disk usage
- Network activity (in/out)
- Running process list with CPU/memory stats
- Sortable by CPU or memory usage
- Gradient progress bars

#### 🧠 Personal Reflection
- Note-taking and journaling
- Markdown editor with live preview
- Tag-based organization
- Create, edit, save reflections
- AI enhance feature (planned)

## Usage

### Accessing Futuristic UI

1. Launch the app
2. Click **✨ Futuristic** button in top-right corner
3. Alternative: Set `futuristicMode` to `true` by default in `App.jsx`

### Opening Windows

Click icons in the **dock** at the bottom to open windows:
- 💬 Chat
- ⚡ Dev Tools
- 📁 Files
- 🤖 AI Agents
- 💻 Terminal
- 📊 System
- 🧠 Reflection
- ⚙️ Settings (planned)

### Window Controls

- **Drag** - Click title bar and drag to move window
- **Resize** - Drag right edge, bottom edge, or bottom-right corner
- **Minimize** - Click `−` button (window moves to minimized tray at bottom)
- **Maximize** - Click `□` button (fullscreen)  
  - Double-click title bar to maximize/restore
- **Close** - Click `×` button

### Keyboard Shortcuts (Planned)
- `Ctrl + N` - New Chat Window
- `Ctrl + W` - Close Active Window
- `Ctrl + Tab` - Cycle through windows
- `Ctrl + M` - Minimize Active Window
- `Ctrl + Shift + F` - Toggle Fullscreen

## Architecture

### Component Structure

```
frontend/src/
├── FuturisticUI.jsx          # Main container
├── FuturisticUI.css          # Glass morphism styling
├── components/
│   ├── WindowManager.jsx      # Hook for window state management
│   └── Window.jsx             # Individual window component
└── windows/
    ├── ChatWindow.jsx         # AI chat interface
    ├── DevToolsWindow.jsx     # Code editor + terminal + git
    ├── FileExplorerWindow.jsx # File browser
    ├── AgentManagerWindow.jsx # AI agent orchestration
    ├── TerminalWindow.jsx     # Command terminal
    ├── SystemMonitorWindow.jsx # System stats
    └── ReflectionWindow.jsx   # Notes and reflection
```

### State Management

**WindowManager Hook** (`useWindowManager`):
- Manages array of window objects
- Handles drag/resize state with mouse events
- Provides window control functions (close, minimize, maximize, restore, add)

**Window Object Structure**:
```javascript
{
  id: 'chat-1',           // Unique identifier
  title: 'AI Assistant',  // Window title
  icon: '💬',             // Emoji icon
  type: 'chat',           // Window type
  x: 100,                 // X position (px)
  y: 100,                 // Y position (px)
  width: 600,             // Width (px)
  height: 700,            // Height (px)
  minimized: false,       // Minimized state
  maximized: false        // Maximized state
}
```

## Customization

### Changing Theme Colors

Edit `frontend/src/FuturisticUI.css`:

```css
:root {
  --neon-cyan: #00f0ff;     /* Primary neon color */
  --neon-purple: #b400ff;   /* Secondary neon color */
  --neon-pink: #ff00aa;
  --neon-green: #00ff88;
  --glass-bg: rgba(15, 15, 40, 0.7);  /* Window background */
  --glass-border: rgba(0, 240, 255, 0.3);  /* Window border */
}
```

### Adding New Window Types

1. Create window component in `frontend/src/windows/YourWindow.jsx`
2. Import in `FuturisticUI.jsx`
3. Add to `dockItems` array:
   ```javascript
   { id: 'yourwindow', icon: '🔥', label: 'Your Window', type: 'yourwindow' }
   ```
4. Add case to `renderWindowContent()`:
   ```javascript
   case 'yourwindow':
     return <YourWindow />;
   ```
5. Add config to `windowConfigs` in `handleDockClick()`

### Saving Window Layouts (Planned)

Will use localStorage or SQLite to persist:
- Window positions and sizes
- Open windows
- Active window
- Minimized/maximized states

```javascript
// Save layout
localStorage.setItem('futuristic-layout', JSON.stringify(windows));

// Load layout
const savedLayout = JSON.parse(localStorage.getItem('futuristic-layout'));
```

## Performance

- **60 FPS dragging** - CSS transforms with GPU acceleration
- **Lazy rendering** - Minimized windows not rendered (display: none)
- **Efficient re-renders** - React state batching for drag/resize
- **Backdrop filter** - Hardware-accelerated blur effects

## Browser Compatibility

Requires modern browser with support for:
- CSS `backdrop-filter` (glass morphism)
- CSS Grid and Flexbox
- ES6+ JavaScript features
- SVG animations

Tested on:
- ✅ Chrome 120+
- ✅ Edge 120+
- ✅ Firefox 121+
- ⚠️ Safari (backdrop-filter has limited support)

## Development

### Running Locally

```bash
cd frontend
npm install
npm run dev
```

Navigate to `http://localhost:5173` and click **✨ Futuristic** button.

### Adding Backend Integration

Windows currently use mock data. To integrate with backend:

1. **Chat Window** - Already integrated via `sendMessage()` API
2. **File Explorer** - Add `/api/files` endpoints for real filesystem access
3. **Agent Manager** - Create `/api/agents` endpoints for agent CRUD operations
4. **System Monitor** - Add `/api/system` for real CPU/RAM/process data
5. **Terminal** - Use existing `/api/command` endpoint

Example:
```javascript
// In FileExplorerWindow.jsx
const fetchFiles = async (path) => {
  const apiKey = await getBackendApiKeyAsync();
  const res = await fetch(`http://127.0.0.1:3001/api/files?path=${path}`, {
    headers: { 'x-api-key': apiKey }
  });
  const data = await res.json();
  setFiles(data.files);
};
```

## Future Enhancements

### Phase 1 (Current)
- ✅ Draggable windows
- ✅ Glass morphism styling
- ✅ 7 core window types
- ✅ Dock and status bar

### Phase 2 (Planned)
- [ ] Layout persistence (localStorage/SQLite)
- [ ] Keyboard shortcuts
- [ ] Window snapping (edges, corners, grid)
- [ ] Theme switcher (cyan/purple/green/red)
- [ ] Customizable dock order

### Phase 3 (Future)
- [ ] Backend API integration for all windows
- [ ] Real-time system monitoring
- [ ] AI agent execution engine
- [ ] File system operations
- [ ] Plugin system for custom windows
- [ ] Multi-workspace support
- [ ] Cloud sync for layouts

## Troubleshooting

### Windows not dragging
- Ensure `handleMouseDown` is called on title bar
- Check browser console for errors
- Verify `useWindowManager` hook is imported correctly

### Blur effects not working
- Check browser support for `backdrop-filter`
- Try enabling hardware acceleration in browser settings
- Fallback: Add solid background as alternative

### Performance issues
- Reduce number of floating particles in FuturisticUI.css (default: 30)
- Disable grid animation: remove `@keyframes gridScroll`
- Lower backdrop blur: change `blur(20px)` to `blur(10px)`

## Credits

- **Design Inspiration** - Sci-fi interfaces (Star Trek, Iron Man, Cyberpunk)
- **Glass Morphism** - [Glassmorphism.com](https://glassmorphism.com/)
- **Neon Effects** - Custom CSS gradients and shadows
- **Monaco Editor** - [microsoft/monaco-editor](https://github.com/microsoft/monaco-editor)

## License

Same as parent project (see root LICENSE file).

---

**Enjoy your futuristic AI assistant workspace!** 🚀✨
