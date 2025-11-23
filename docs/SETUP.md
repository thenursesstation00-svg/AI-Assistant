# AI Assistant - Installation & Setup Guide

## Quick Start

### 1. Install Dependencies

```powershell
# Install root dependencies (Electron, etc.)
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
cd ..
```

### 2. Configure Environment

```powershell
# Copy example environment file
Copy-Item .env.example -Destination .env

# Edit .env and add your API keys
notepad .env
```

**Required Variables:**
- `ANTHROPIC_API_KEY` - Your Anthropic Claude API key

**Optional Variables:**
- `OPENAI_API_KEY` - For GPT models
- `GITHUB_TOKEN` - For GitHub integration
- `SERPAPI_KEY` - For web search

### 3. Initialize Database

```powershell
cd backend
npm run db:init
```

### 4. Run Development Servers

**Option A: Run all services (recommended)**
```powershell
# From root directory
npm run dev:all
```

**Option B: Run services separately**

Terminal 1 - Backend:
```powershell
cd backend
npm run dev
```

Terminal 2 - Frontend:
```powershell
cd frontend
npm run dev
```

Terminal 3 - Electron:
```powershell
npm start
```

### 5. Build for Production

```powershell
# Build frontend and package Electron app
npm run build
```

## Package Management

### Install New Dependencies

```powershell
# Backend dependency
cd backend
npm install <package-name>

# Frontend dependency
cd frontend
npm install <package-name>

# Desktop dependency (Electron, etc.)
npm install <package-name>
```

### Update Dependencies

```powershell
# Check for outdated packages
npm outdated

# Update specific package
npm update <package-name>

# Update all (use with caution)
npm update
```

## Database Management

### Initialize/Reset Database
```powershell
cd backend
npm run db:init
```

### Backup Database
```powershell
cd backend
npm run db:backup
```

### View Database
```powershell
cd backend
npm run db:shell
```

## Testing

```powershell
# Run all tests
cd backend
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- uploadPatch.test.js
```

## Linting & Formatting

```powershell
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Check formatting
npm run format:check
```

## Troubleshooting

### Port Already in Use

If port 3001 is occupied:
```powershell
# Find and kill process on port 3001
Get-Process -Id (Get-NetTCPConnection -LocalPort 3001).OwningProcess | Stop-Process -Force
```

### Database Locked

```powershell
# Stop all node processes
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force

# Reinitialize database
cd backend
npm run db:init
```

### Missing Environment Variables

```bash
Error: Missing required environment variable: ANTHROPIC_API_KEY
```

**Solution:** Add the required variable to your `.env` file

### Native Module Build Errors

If `keytar` or `better-sqlite3` fail to build:

```powershell
# Install build tools (Windows)
npm install --global windows-build-tools

# Rebuild native modules
npm rebuild
```

## Development Workflow

### Adding a New AI Provider

1. Create provider class in `backend/src/services/ai/providers/`
2. Extend `AIProvider` base class
3. Implement required methods
4. Register in `backend/src/services/ai/registry.js`
5. Add credentials to database
6. Update `.env.example` with new env vars

### Adding a New Route

1. Create route file in `backend/src/routes/`
2. Import and register in `backend/src/server.js`
3. Add tests in `backend/tests/`
4. Update API documentation

### Adding a New UI Panel

1. Create component in `frontend/src/components/panels/`
2. Add to panel registry
3. Update layout system
4. Add state management if needed

## Production Deployment

### Build Process

```powershell
# Full production build
npm run build

# Output will be in: release/
```

### Environment Variables for Production

Set these in your deployment environment:
- `NODE_ENV=production`
- `PORT=3001`
- All required API keys
- `CREDENTIALS_ENCRYPTION_KEY` (32+ character string)

### Security Checklist

- [ ] All API keys in environment variables (never committed)
- [ ] `REQUIRE_API_KEY` is NOT set to 'false'
- [ ] Strong `BACKEND_API_KEY` generated
- [ ] CORS properly configured for production domain
- [ ] Rate limiting enabled
- [ ] HTTPS/TLS configured
- [ ] Database backups configured

## Useful Commands Reference

```powershell
# Development
npm run dev:all          # Run all services
npm run dev              # Run Electron only
npm test                 # Run tests
npm run lint             # Lint code

# Building
npm run build            # Build for production
npm run build:frontend   # Build frontend only

# Database
npm run db:init          # Initialize database
npm run db:backup        # Backup database
npm run db:migrate       # Run migrations

# Maintenance
npm outdated             # Check for updates
npm audit                # Security audit
npm run clean            # Clean build artifacts
```

## Getting Help

- **Issues:** Create an issue on GitHub
- **Documentation:** See `/docs` folder
- **Environment Variables:** Check `.env.example`
- **API Docs:** Run `npm run docs` (if available)

## Next Steps

After setup, explore:
1. Chat interface - Test different AI providers
2. Settings panel - Configure providers and API keys
3. Editor panel - Open and edit files
4. Terminal panel - Run commands
5. Search panel - Web search integration
6. Agents panel - Automation workflows
