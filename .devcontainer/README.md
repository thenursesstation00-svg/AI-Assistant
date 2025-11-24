# AI Assistant - GitHub Codespaces

## Quick Start

This workspace is pre-configured for GitHub Codespaces with all necessary dependencies.

### Automatic Setup

When you open this repository in Codespaces, the following happens automatically:
1. ✅ Node.js 20 environment is configured
2. ✅ All dependencies are installed (root, backend, frontend)
3. ✅ Ports 3001 (backend) and 5173 (frontend) are forwarded
4. ✅ VS Code extensions are installed (ESLint, Prettier, Copilot, etc.)

### Running the Application

**Option 1: Full Stack Development**

Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

**Option 2: Electron App (Build Required)**
```bash
npm run build:frontend
npm start
```

### Environment Variables

Create `.env` files for configuration:

**Root `.env`** (optional):
```bash
GH_TOKEN=your_github_token_here
```

**`backend/.env`** (required):
```bash
# Backend API Key (for frontend-to-backend auth)
BACKEND_API_KEY=your_secure_backend_key_here
REQUIRE_API_KEY=false  # Set to true in production

# AI Provider Keys
ANTHROPIC_API_KEY=sk-ant-your_key_here
OPENAI_API_KEY=sk-your_openai_key_here

# Search Provider Keys (optional)
BRAVE_API_KEY=your_brave_key_here
SERPAPI_KEY=your_serpapi_key_here
GOOGLE_CSE_KEY=your_google_key_here
GOOGLE_CSE_CX=your_search_engine_id_here

# Database
DATABASE_PATH=./data/assistant.db

# GitHub Token (for MCP GitHub server)
GITHUB_TOKEN=your_github_token_here

# CORS
CORS_ORIGIN=http://localhost:5173

# Redis (optional)
# REDIS_URL=redis://localhost:6379
```

### Available Ports

- **3001**: Backend API Server
- **5173**: Frontend Development Server (Vite)

Access forwarded ports via the "Ports" tab in VS Code.

### Development Workflow

1. **Start Backend**:
   ```bash
   cd backend
   npm run dev
   ```
   Backend will run on http://localhost:3001

2. **Start Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```
   Frontend will run on http://localhost:5173

3. **Test API**:
   ```bash
   # Health check
   curl http://localhost:3001/health
   
   # Test chat (requires API key)
   curl -X POST http://localhost:3001/api/chat \
     -H "Content-Type: application/json" \
     -H "x-api-key: your_backend_key" \
     -d '{"messages":[{"role":"user","content":"Hello"}]}'
   ```

4. **Run Tests**:
   ```bash
   # Backend tests
   cd backend
   npm test
   
   # Integration tests
   npm run test:phase3
   ```

### Building the App

```bash
# Build frontend
npm run build:frontend

# Build for current platform
npm run build

# Build for all platforms (requires platform-specific runners)
npm run build:all
```

### Troubleshooting

**Backend exits immediately**:
- Fixed with error handlers and heartbeat monitoring
- Check logs for uncaught exceptions
- Verify all required environment variables are set

**Frontend build fails**:
- Clear node_modules: `cd frontend && rm -rf node_modules && npm install`
- Check for port conflicts

**Database errors**:
- Initialize database: `cd backend && node scripts/initDatabase.js`
- Check DATABASE_PATH in .env

**MCP servers not working**:
- Install MCP packages: `npm install -g @modelcontextprotocol/server-*`
- Check .mcp/config.json configuration
- Verify GITHUB_TOKEN and other MCP environment variables

### VS Code Extensions

Pre-installed extensions:
- ESLint - Code linting
- Prettier - Code formatting
- GitHub Copilot - AI pair programmer
- Copilot Chat - AI assistant
- Tailwind CSS IntelliSense
- React snippets
- GitLens - Git supercharged
- Material Icon Theme

### Database Management

```bash
# Initialize database
cd backend
node scripts/initDatabase.js

# Check database location
echo $DATABASE_PATH
# or
cat .env | grep DATABASE_PATH
```

### Debugging

**Backend Debugging**:
1. Add breakpoints in VS Code
2. Press F5 or use "Run and Debug" panel
3. Select "Node.js" configuration

**Frontend Debugging**:
1. Open Chrome DevTools in browser
2. Use React DevTools extension
3. Check Network tab for API calls

### Security Notes

⚠️ **Never commit `.env` files with real secrets!**

- `.env` files are gitignored by default
- Use `.env.example` as template
- In production, use environment variables or secret management
- Rotate API keys regularly

### Resources

- [Main Documentation](../README.md)
- [Contributing Guidelines](../docs/CONTRIBUTING.md)
- [Cross-Platform Guide](../docs/CROSS_PLATFORM.md)
- [Phase 3 Features](../docs/PHASE3_COMPLETE.md)
- [MCP Setup Guide](../docs/MCP_GUIDE.md)

### Support

- Issues: [GitHub Issues](https://github.com/thenursesstation00-svg/AI-Assistant/issues)
- Discussions: [GitHub Discussions](https://github.com/thenursesstation00-svg/AI-Assistant/discussions)

---

**Happy Coding!** 🚀
