# MCP Environment Setup Script
# Run this to configure Model Context Protocol for AI agents

param(
    [switch]$InstallServers,
    [switch]$TestConnection,
    [switch]$GenerateToken
)

Write-Host "🤖 AI Assistant MCP Setup" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check prerequisites
Write-Host "📋 Checking prerequisites..." -ForegroundColor Yellow

# Check Node.js
$nodeVersion = node --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Node.js not found. Please install Node.js 18+" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green

# Check npm
$npmVersion = npm --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ npm not found" -ForegroundColor Red
    exit 1
}
Write-Host "✅ npm: $npmVersion" -ForegroundColor Green

# Check MCP config
if (Test-Path ".mcp\config.json") {
    Write-Host "✅ MCP config found" -ForegroundColor Green
} else {
    Write-Host "❌ MCP config not found at .mcp\config.json" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Install MCP servers
if ($InstallServers) {
    Write-Host "📦 Installing MCP server packages..." -ForegroundColor Yellow
    Write-Host ""
    
    $servers = @(
        "@modelcontextprotocol/server-filesystem",
        "@modelcontextprotocol/server-github",
        "@modelcontextprotocol/server-brave-search",
        "@modelcontextprotocol/server-fetch",
        "@modelcontextprotocol/server-puppeteer",
        "@modelcontextprotocol/server-git",
        "@modelcontextprotocol/server-memory",
        "@modelcontextprotocol/server-sequential-thinking",
        "@modelcontextprotocol/server-everything"
    )
    
    foreach ($server in $servers) {
        Write-Host "  Installing $server..." -ForegroundColor Gray
        npm install -g $server 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✅ $server" -ForegroundColor Green
        } else {
            Write-Host "  ⚠️  $server (optional, may require additional setup)" -ForegroundColor Yellow
        }
    }
    
    Write-Host ""
}

# Check environment variables
Write-Host "🔑 Checking environment variables..." -ForegroundColor Yellow

$envFile = "backend\.env"
$envExample = "backend\.env.example"

if (Test-Path $envFile) {
    $envContent = Get-Content $envFile -Raw
    
    # Check for required tokens
    $checks = @{
        "GITHUB_TOKEN" = $envContent -match "GITHUB_TOKEN=.+"
        "BRAVE_API_KEY" = $envContent -match "BRAVE_API_KEY=.+"
        "ANTHROPIC_API_KEY" = $envContent -match "ANTHROPIC_API_KEY=.+"
    }
    
    foreach ($key in $checks.Keys) {
        if ($checks[$key]) {
            Write-Host "  ✅ $key configured" -ForegroundColor Green
        } else {
            Write-Host "  ⚠️  $key not configured (internet access limited)" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "  ❌ .env file not found" -ForegroundColor Red
    Write-Host "  Copy $envExample to $envFile and add your API keys" -ForegroundColor Yellow
}

Write-Host ""

# Generate GitHub token instructions
if ($GenerateToken) {
    Write-Host "🔐 GitHub Token Generation Guide" -ForegroundColor Cyan
    Write-Host "================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1. Go to: https://github.com/settings/tokens/new" -ForegroundColor White
    Write-Host "2. Name: 'AI Assistant MCP Access'" -ForegroundColor White
    Write-Host "3. Select scopes:" -ForegroundColor White
    Write-Host "   ☑ repo (all)" -ForegroundColor Gray
    Write-Host "   ☑ read:org" -ForegroundColor Gray
    Write-Host "   ☑ gist" -ForegroundColor Gray
    Write-Host "4. Click 'Generate token'" -ForegroundColor White
    Write-Host "5. Copy the token and add to backend\.env:" -ForegroundColor White
    Write-Host "   GITHUB_TOKEN=your_token_here" -ForegroundColor Gray
    Write-Host ""
}

# Test MCP server connection
if ($TestConnection) {
    Write-Host "🧪 Testing MCP server connection..." -ForegroundColor Yellow
    Write-Host ""
    
    # Test SQLite server
    Write-Host "  Testing SQLite MCP server..." -ForegroundColor Gray
    
    $process = Start-Process -FilePath "node" -ArgumentList "backend\src\database\mcp-server.js" -NoNewWindow -PassThru -RedirectStandardError "mcp-test-error.log" -RedirectStandardOutput "mcp-test-output.log"
    
    Start-Sleep -Seconds 2
    
    if ($process.HasExited) {
        Write-Host "  ❌ SQLite server failed to start" -ForegroundColor Red
        Write-Host "  Check mcp-test-error.log for details" -ForegroundColor Yellow
    } else {
        Write-Host "  ✅ SQLite server running (PID: $($process.Id))" -ForegroundColor Green
        Stop-Process -Id $process.Id -Force
        Write-Host "  ✅ Server stopped cleanly" -ForegroundColor Green
    }
    
    # Cleanup
    Remove-Item "mcp-test-*.log" -ErrorAction SilentlyContinue
    
    Write-Host ""
}

# Summary
Write-Host "📊 MCP Setup Summary" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Configuration file: .mcp\config.json" -ForegroundColor White
Write-Host "Database server: backend\src\database\mcp-server.js" -ForegroundColor White
Write-Host "Documentation: MCP_GUIDE.md" -ForegroundColor White
Write-Host ""
Write-Host "🎯 Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Add API keys to backend\.env (GITHUB_TOKEN, BRAVE_API_KEY)" -ForegroundColor White
Write-Host "  2. Restart VS Code to activate MCP integration" -ForegroundColor White
Write-Host "  3. Ask GitHub Copilot: 'What MCP tools are available?'" -ForegroundColor White
Write-Host "  4. Try: '@workspace search the web for Electron security best practices'" -ForegroundColor White
Write-Host ""

# Usage examples
Write-Host "💡 Usage Examples:" -ForegroundColor Cyan
Write-Host "  # Install all MCP servers globally" -ForegroundColor Gray
Write-Host "  .\scripts\setup-mcp.ps1 -InstallServers" -ForegroundColor White
Write-Host ""
Write-Host "  # Test MCP server connection" -ForegroundColor Gray
Write-Host "  .\scripts\setup-mcp.ps1 -TestConnection" -ForegroundColor White
Write-Host ""
Write-Host "  # Show GitHub token instructions" -ForegroundColor Gray
Write-Host "  .\scripts\setup-mcp.ps1 -GenerateToken" -ForegroundColor White
Write-Host ""

Write-Host "✨ MCP setup complete!" -ForegroundColor Green
