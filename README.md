# 🤖 AI Assistant

> Professional Cross-Platform Desktop Application with Multi-Provider AI, Advanced Workspace, and Internet Access

[![Build Status](https://github.com/thenursesstation00-svg/AI-Assistant/workflows/Build%20AI%20Assistant%20-%20All%20Platforms/badge.svg)](https://github.com/thenursesstation00-svg/AI-Assistant/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Electron](https://img.shields.io/badge/Electron-39.2.3-47848F?logo=electron)](https://www.electronjs.org/)
[![React](https://img.shields.io/badge/React-18.2.0-61DAFB?logo=react)](https://reactjs.org/)
[![Node](https://img.shields.io/badge/Node-20+-339933?logo=node.js)](https://nodejs.org/)
[![Windows](https://img.shields.io/badge/Windows-10%2F11-0078D6?logo=windows)](https://www.microsoft.com/windows)
[![macOS](https://img.shields.io/badge/macOS-10.15+-000000?logo=apple)](https://www.apple.com/macos)
[![Linux](https://img.shields.io/badge/Linux-Ubuntu%20%7C%20Fedora-FCC624?logo=linux)](https://www.linux.org/)

## 🎯 Platforms

**Available for Windows, macOS, and Linux** with native installers:
- **Windows**: NSIS Installer, Portable (x64, ARM64)
- **macOS**: DMG, ZIP (Intel, Apple Silicon)
- **Linux**: AppImage, DEB, RPM, Snap (x64, ARM64)

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
- **Node.js** 20 or higher
- **npm** 10 or higher
- **Operating System**: Windows 10+, macOS 10.15+, or recent Linux distribution
- **Git** for version control

### Installation

**Download Pre-built Installers** (Recommended):
- Visit [Releases](https://github.com/thenursesstation00-svg/AI-Assistant/releases)
- Download for your platform:
  - Windows: `AI Assistant Setup 1.0.0.exe`
  - macOS: `AI Assistant-1.0.0.dmg`
  - Linux: `AI Assistant-1.0.0.AppImage`

**Or Build from Source**:

1. **Clone the repository**
```bash
git clone https://github.com/thenursesstation00-svg/AI-Assistant.git
cd AI-Assistant
```

2. **Install dependencies**
```bash
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

3. **Build the application**
```bash
# Build for current platform
npm run build

# Or platform-specific:
npm run build:win     # Windows
npm run build:mac     # macOS
npm run build:linux   # Linux
npm run build:all     # All platforms
```

4. **Find installer** in `release/` directory
- **Redis Caching**: Optional Redis support for search result caching

## 📋 Prerequisites

- **Node.js** (v16 or higher)
- **npm** (v7 or higher)
- **Anthropic API Key** - Get one from [Anthropic](https://www.anthropic.com/)
- **Optional**: Redis server for caching (can use Docker)

## 🏗️ Project Structure

```
AI-Assistant/
├── backend/          # Express.js backend server
│   ├── src/
│   │   ├── routes/   # API routes
│   │   ├── services/ # Business logic
│   │   ├── middleware/ # Express middleware
│   │   ├── workers/  # Background workers
│   │   └── server.js # Entry point
│   └── tests/        # Jest tests
├── frontend/         # React frontend (Vite)
│   ├── src/
│   │   ├── App.jsx   # Main app component
│   │   ├── Chat.jsx  # Chat interface
│   │   ├── Admin.jsx # Admin panel
│   │   └── Search.jsx # Search interface
│   └── dist/         # Build output (generated)
├── main.js           # Electron main process
├── preload.js        # Electron preload script
└── scripts/          # Build and utility scripts
```

## 🛠️ Setup & Installation

### 1. Clone the Repository

```bash
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
### 2. Backend Setup

```bash
cd backend
npm install

# Create environment file
cp .env.example .env

# Edit .env and add your API keys:
# ANTHROPIC_API_KEY=your_anthropic_key_here
# BACKEND_API_KEY=your_backend_api_key_here (optional, for API authentication)
# SERPAPI_KEY=your_serpapi_key_here (optional, for search)
# REDIS_URL=redis://localhost:6379 (optional, for caching)
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

### 4. Root Dependencies (for Electron)

```bash
cd ..
npm install
```

## 🚀 Running the Application

### Development Mode

You need to run both the backend and frontend in development mode:

#### Terminal 1 - Backend Server:
```bash
cd backend
npm run dev
# Server runs at http://localhost:3001
```

#### Terminal 2 - Frontend Dev Server:
```bash
cd frontend
npm run dev
# Frontend runs at http://localhost:5173
```

#### Terminal 3 - Electron App (optional for desktop):
```bash
npm start
```

### Production Mode

Build and run the complete desktop application:

```bash
# Build frontend
cd frontend
npm run build
cd ..

# Run Electron with built frontend
npm start
```

## 🏗️ Building Desktop App

To create distributable packages:

```bash
# Build frontend first
npm run build:frontend

# Build desktop app for your platform
npm run build

# Output will be in the release/ directory
```

The build process creates:
- **Windows**: NSIS installer (`.exe`)
- **macOS**: DMG file (`.dmg`)
- **Linux**: AppImage, deb, rpm (depending on configuration)

## 🧪 Testing

### Backend Tests

```bash
cd backend
npm test
```

Tests include:
- API route tests
- Anthropic service integration
- Search provider functionality
- File upload handling
- Authentication middleware
- Background workers

## ⚙️ Configuration

### Environment Variables

#### Backend (backend/.env):

```bash
# Required
ANTHROPIC_API_KEY=your_key_here

# API Authentication (optional)
BACKEND_API_KEY=single_api_key
# OR use multiple keys with roles:
BACKEND_API_KEYS={"admin_key":"admin","user_key":"user"}
REQUIRE_API_KEY=false  # Set to 'false' to disable for local testing

# Search Provider (optional)
SEARCH_PROVIDER=serpapi  # or 'google'
SERPAPI_KEY=your_serpapi_key
GOOGLE_CSE_KEY=your_google_key
GOOGLE_CSE_CX=your_search_engine_id

# Redis Cache (optional)
REDIS_URL=redis://localhost:6379
SEARCH_CACHE_TTL_MS=300000  # 5 minutes
SEARCH_CACHE_MAX=100

# CORS
CORS_ORIGIN=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW=15  # minutes
RATE_LIMIT_MAX_REQUESTS=100

# Antivirus Worker (optional)
AV_SCAN_CMD=/path/to/av/scanner
AV_SCAN_INTERVAL_MS=60000
```

### Optional: Redis for Caching

Start Redis using Docker:

```bash
docker compose up -d
# Stop: docker compose down
```

Or install Redis locally and set `REDIS_URL` in backend/.env.

## 🔒 Security

- **API Keys**: Never commit API keys to version control
- **Environment Files**: Use `.env` files (excluded from git)
- **Secure Storage**: Desktop app stores API keys in OS keychain
- **Rate Limiting**: Built-in rate limiting on API endpoints
- **CORS**: Configured CORS for development and production

## 📦 Release Process

### Creating a Release

1. Update version in `package.json`
2. Create and push a git tag:
   ```bash
   git tag -a v1.0.0 -m "Release v1.0.0"
   git push origin v1.0.0
   ```
3. GitHub Actions will automatically build and create a release

### CI/CD

- **Build workflow**: `.github/workflows/build.yml` - Runs on pull requests
- **Release workflow**: `.github/workflows/release.yml` - Runs on version tags

#### Required GitHub Secrets:

- `GH_TOKEN2`: Personal Access Token with `repo` scope (primary)
- `GH_TOKEN`: Personal Access Token with `repo` scope (fallback)
- `CSC_LINK` (optional): Code signing certificate URL
- `CSC_KEY_PASSWORD` (optional): Certificate password

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
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
## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Additional Resources

- [Backend README](backend/README.md)
- [Frontend README](frontend/README.md)
- [Anthropic API Documentation](https://docs.anthropic.com/)
- [Electron Documentation](https://www.electronjs.org/docs)
- [React Documentation](https://react.dev/)

## 🐛 Troubleshooting

### Common Issues

1. **Backend won't start**: Check if `.env` file exists with `ANTHROPIC_API_KEY`
2. **Frontend build fails**: Run `npm install` in the frontend directory
3. **Electron app shows blank screen**: Ensure frontend is built (`npm run build:frontend`)
4. **API key errors**: Verify API keys in `.env` are correct and not expired

### Getting Help

If you encounter issues:
1. Check existing issues on GitHub
2. Review the backend and frontend README files
3. Verify all dependencies are installed
4. Check console logs for error messages

## 📊 Project Status

- ✅ Core chat functionality
- ✅ Search integration
- ✅ Admin panel
- ✅ Desktop packaging
- ✅ Auto-updates
- ✅ Secure key storage
- ✅ Redis caching support

---

**Note**: This is a desktop application. The backend runs locally on your machine and communicates with Anthropic's API. No data is sent to any third-party servers except the configured AI provider (Anthropic) and optional search providers.
