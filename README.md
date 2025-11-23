# 🤖 AI Assistant

> Professional Desktop Application with Multi-Provider AI, Advanced Workspace, and Internet Access

[![Build Status](https://github.com/thenursesstation00-svg/AI-Assistant/workflows/Build%20AI%20Assistant%20Installer/badge.svg)](https://github.com/thenursesstation00-svg/AI-Assistant/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Electron](https://img.shields.io/badge/Electron-28.1.0-47848F?logo=electron)](https://www.electronjs.org/)
[![React](https://img.shields.io/badge/React-18.2.0-61DAFB?logo=react)](https://reactjs.org/)
[![Node](https://img.shields.io/badge/Node-18+-339933?logo=node.js)](https://nodejs.org/)

## ✨ Features

### 🎯 Core Capabilities
- **Multi-Provider AI Support** - Anthropic Claude, OpenAI, Google Gemini, Ollama
- **Advanced Workspace** - Multi-panel layout with chat, editor, terminal, and file browser
- **Internet Access** - Brave Search, Puppeteer scraping, HTTP fetch capabilities
- **Auto-Update** - Automatic updates with manual control and progress tracking
- **Credential Management** - Secure storage using OS keychain (Windows Credential Manager)

### 🔧 Technical Features
- **Model Context Protocol (MCP)** - 11 integrated servers for enhanced AI context
- **Database** - SQLite for workspace layouts and persistent data
- **Real-time Streaming** - Server-Sent Events (SSE) for AI responses
- **Plugin System** - Extensible architecture for search providers and scrapers
- **CI/CD** - Automated builds with GitHub Actions and Dependabot

## 📁 Project Structure

```
AI-Assistant/
├── src/                    # Electron main process
│   ├── main.js            # Application entry point
│   └── preload.js         # Preload script for IPC
│
├── backend/               # Express.js backend
│   ├── src/              # Source code
│   │   ├── server.js    # Server entry
│   │   ├── routes/      # API endpoints
│   │   ├── services/    # Business logic
│   │   ├── database/    # SQLite & MCP server
│   │   └── middleware/  # Express middleware
│   ├── data/            # Runtime data & database
│   └── tests/           # Test suite
│
├── frontend/             # React frontend
│   ├── src/             # Source code
│   │   ├── App.jsx     # Root component
│   │   ├── panels/     # Workspace panels
│   │   └── components/ # Reusable components
│   └── dist/           # Build output
│
├── docs/                # Documentation
├── scripts/             # Utility scripts
├── config/              # Configuration files
└── .mcp/               # Model Context Protocol
```

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18 or higher
- **npm** 9 or higher
- **Windows** 10/11 (other platforms untested)
- **Git** for version control

### Installation

1. **Clone the repository**
```powershell
git clone https://github.com/thenursesstation00-svg/AI-Assistant.git
cd AI-Assistant
```

2. **Install dependencies**
```powershell
# Root dependencies (Electron)
npm install

# Backend dependencies
cd backend
npm install
cd ..

# Frontend dependencies
cd frontend
npm install
cd ..
```

3. **Configure environment**
```powershell
# Copy environment template
Copy-Item backend\.env.example backend\.env

# Edit backend\.env and add your API keys:
# - ANTHROPIC_API_KEY
# - BACKEND_API_KEY
# - CREDENTIALS_ENCRYPTION_KEY
```

4. **Initialize database**
```powershell
cd backend
node scripts/initDatabase.js
cd ..
```

5. **Run the application**
```powershell
# Start backend (in one terminal)
cd backend
npm run dev

# Start Electron app (in another terminal)
npm start
```

## 🏗️ Building

### Development Build
```powershell
npm run build
```

### Production Build with API Key
```powershell
.\scripts\build_with_key.ps1 -BackendApiKey "your-api-key-here"
```

The installer will be created in `release/AI Assistant Setup 1.0.0.exe`

## 📖 Documentation

- **[Quick Start Guide](docs/QUICKSTART.md)** - Get up and running in 5 minutes
- **[Setup Instructions](docs/SETUP.md)** - Detailed setup walkthrough
- **[MCP Guide](docs/MCP_GUIDE.md)** - Model Context Protocol configuration
- **[API Documentation](docs/API.md)** - Backend API reference
- **[Phase Roadmap](docs/PHASE_ROADMAP.md)** - Development progress

## 🔑 Environment Variables

### Backend (.env)
```env
PORT=3001
ANTHROPIC_API_KEY=your_key_here
BACKEND_API_KEY=your_backend_key
CREDENTIALS_ENCRYPTION_KEY=32_character_string

# Search Providers (optional)
BRAVE_API_KEY=your_brave_key
SERPAPI_KEY=your_serpapi_key

# Database (optional)
REDIS_URL=redis://localhost:6379
```

### MCP Configuration
```env
GITHUB_TOKEN=your_github_token
BRAVE_API_KEY=your_brave_key
```

See [.env.example](backend/.env.example) for all options.

## 🧪 Testing

```powershell
# Run backend tests
cd backend
npm test

# Run specific test
npm test -- chat.test.js

# Run with coverage
npm test -- --coverage
```

## 🔧 Development

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start Electron app |
| `npm run dev` | Start in development mode |
| `npm run build` | Build production installer |
| `npm run build:ci` | Build without publishing |
| `npm test` | Run backend tests |
| `npm run setup` | Setup credentials |
| `npm run setup:mcp` | Setup MCP servers |
| `npm run lint` | Lint code |
| `npm run format` | Format code with Prettier |

### Backend Development
```powershell
cd backend
npm run dev  # Starts nodemon on port 3001
```

### Frontend Development
```powershell
cd frontend
npm run dev  # Starts Vite dev server on port 5173
```

## 🌐 API Endpoints

### Chat
- `POST /api/chat` - Send message to AI
- `POST /api/stream/chat` - Streaming chat response

### Providers
- `GET /api/providers` - List available AI providers
- `GET /api/providers/:id` - Get provider details

### Search
- `GET /api/search?q=query` - Web search

### Scraping
- `POST /api/scrape` - Scrape single URL
- `POST /api/scrape/multiple` - Batch scraping
- `POST /api/scrape/links` - Extract links

### Workspace
- `GET /api/workspace/layout` - Get saved layout
- `POST /api/workspace/layout` - Save layout
- `DELETE /api/workspace/layout/:id` - Delete layout

See full [API Documentation](docs/API.md)

## 🔌 Model Context Protocol (MCP)

The application includes 11 MCP servers for enhanced AI capabilities:

- **Filesystem** - Project file access
- **GitHub** - Repository integration
- **Brave Search** - Internet search
- **Fetch** - HTTP requests
- **Puppeteer** - Browser automation
- **Git** - Version control
- **Memory** - Persistent context
- **Sequential Thinking** - Enhanced reasoning
- **SQLite** - Database access
- **Everything** - Fast file search (Windows)
- **Shell** - Command execution (disabled by default)

See [MCP Guide](docs/MCP_GUIDE.md) for configuration.

## 🛡️ Security

- **Credential Storage** - OS-level keychain (keytar)
- **Environment Variables** - Sensitive data not committed
- **API Key Authentication** - Required for all backend endpoints
- **Rate Limiting** - Configurable request limits
- **CORS Protection** - Configured origins only
- **SQL Injection** - Prepared statements
- **MCP Security** - Read-only database access

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](docs/CONTRIBUTING.md) first.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Anthropic** - Claude AI API
- **Electron** - Cross-platform desktop framework
- **React** - Frontend framework
- **Express** - Backend framework
- **Vite** - Build tooling
- **Model Context Protocol** - AI context standard

## 📧 Support

- **Issues** - [GitHub Issues](https://github.com/thenursesstation00-svg/AI-Assistant/issues)
- **Discussions** - [GitHub Discussions](https://github.com/thenursesstation00-svg/AI-Assistant/discussions)
- **Documentation** - [Wiki](https://github.com/thenursesstation00-svg/AI-Assistant/wiki)

## 🗺️ Roadmap

- [x] Phase 1: Foundation & Critical Fixes
- [x] Phase 2: UI Improvements
- [x] Phase 3: Multi-Platform Web Access
- [x] Phase 4: Advanced Workspace
- [ ] Phase 5: Plugin Marketplace
- [ ] Phase 6: Mobile Companion App
- [ ] Phase 7: Collaborative Features

See [PHASE_ROADMAP.md](docs/PHASE_ROADMAP.md) for details.

---

**Made with ❤️ by [thenursesstation00-svg](https://github.com/thenursesstation00-svg)**
