# AI Assistant Desktop App

A desktop application that provides an AI-powered assistant interface with chat capabilities, search functionality, and administrative features. Built with Electron, React, and Express.

## 🚀 Features

- **AI Chat Interface**: Interactive chat powered by Anthropic's Claude AI
- **Web Search Integration**: Search the web using SerpAPI or Google Custom Search
- **Admin Panel**: Manage archives and view system information
- **Desktop Application**: Cross-platform Electron app for Windows, macOS, and Linux
- **Secure API Key Storage**: Uses OS-level keychain (Windows Credential Manager, macOS Keychain)
- **Auto-Updates**: Built-in update mechanism using electron-updater
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

- `GH_TOKEN`: Personal Access Token with `repo` scope
- `CSC_LINK` (optional): Code signing certificate URL
- `CSC_KEY_PASSWORD` (optional): Certificate password

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

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
