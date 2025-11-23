# AI Assistant - Automated Setup Script
# Run this to install all dependencies and initialize the project

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "AI Assistant - Automated Setup" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js version
Write-Host "Checking Node.js version..." -ForegroundColor Yellow
$nodeVersion = node --version
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Node.js is not installed. Please install Node.js 18 or higher." -ForegroundColor Red
    exit 1
}
Write-Host "✅ Node.js $nodeVersion detected" -ForegroundColor Green
Write-Host ""

# Install root dependencies
Write-Host "Installing root dependencies (Electron, etc.)..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install root dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Root dependencies installed" -ForegroundColor Green
Write-Host ""

# Install backend dependencies
Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
Set-Location backend
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install backend dependencies" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Write-Host "✅ Backend dependencies installed" -ForegroundColor Green
Set-Location ..
Write-Host ""

# Install frontend dependencies
Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
Set-Location frontend
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install frontend dependencies" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Write-Host "✅ Frontend dependencies installed" -ForegroundColor Green
Set-Location ..
Write-Host ""

# Create .env file if it doesn't exist
if (-Not (Test-Path ".env")) {
    Write-Host "Creating .env file from template..." -ForegroundColor Yellow
    Copy-Item ".env.example" -Destination ".env"
    Write-Host "✅ .env file created" -ForegroundColor Green
    Write-Host "⚠️  Please edit .env and add your API keys!" -ForegroundColor Yellow
} else {
    Write-Host "ℹ️  .env file already exists" -ForegroundColor Cyan
}
Write-Host ""

# Initialize database
Write-Host "Initializing database..." -ForegroundColor Yellow
Set-Location backend
if (Test-Path "data/assistant.db") {
    $response = Read-Host "Database already exists. Reset it? (y/N)"
    if ($response -eq "y" -or $response -eq "Y") {
        Remove-Item "data/assistant.db" -Force
        Write-Host "🗑️  Old database removed" -ForegroundColor Yellow
    } else {
        Write-Host "ℹ️  Keeping existing database" -ForegroundColor Cyan
        Set-Location ..
        Write-Host ""
        Write-Host "==================================" -ForegroundColor Cyan
        Write-Host "Setup Complete!" -ForegroundColor Green
        Write-Host "==================================" -ForegroundColor Cyan
        exit 0
    }
}

# Create database by running a simple Node script
$dbScript = @"
const { initializeDatabase } = require('./src/database/db');
try {
    initializeDatabase();
    console.log('Database initialized successfully');
    process.exit(0);
} catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
}
"@

$dbScript | Out-File -FilePath "init_db.js" -Encoding UTF8
node init_db.js
$dbInitResult = $LASTEXITCODE
Remove-Item "init_db.js" -Force

if ($dbInitResult -ne 0) {
    Write-Host "❌ Database initialization failed" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Write-Host "✅ Database initialized" -ForegroundColor Green
Set-Location ..
Write-Host ""

# Build frontend
Write-Host "Building frontend..." -ForegroundColor Yellow
Set-Location frontend
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Frontend build failed (non-fatal)" -ForegroundColor Yellow
} else {
    Write-Host "✅ Frontend built" -ForegroundColor Green
}
Set-Location ..
Write-Host ""

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Setup Complete! 🎉" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Edit .env file and add your API keys" -ForegroundColor White
Write-Host "2. Run 'npm start' to launch the application" -ForegroundColor White
Write-Host ""
Write-Host "For development:" -ForegroundColor Cyan
Write-Host "- Backend: cd backend && npm run dev" -ForegroundColor White
Write-Host "- Frontend: cd frontend && npm run dev" -ForegroundColor White
Write-Host "- Electron: npm start" -ForegroundColor White
Write-Host ""
Write-Host "See SETUP.md for detailed instructions" -ForegroundColor Yellow
