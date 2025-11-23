# Model Context Protocol (MCP) Configuration Guide

This project uses the **Model Context Protocol (MCP)** to provide AI agents (GitHub Copilot, Claude, etc.) with rich context about the project, internet access, and tool capabilities.

## What is MCP?

The Model Context Protocol is an open standard that allows LLMs to:
- Access external data sources (files, databases, APIs)
- Execute tools and services
- Maintain context across sessions
- Connect to the internet for real-time information

## Quick Start

### 1. Install MCP SDK

```powershell
npm install @modelcontextprotocol/sdk
```

### 2. Set Environment Variables

Create or update `.env` with:

```env
# GitHub Access
GITHUB_TOKEN=your_github_personal_access_token

# Brave Search (for internet access)
BRAVE_API_KEY=your_brave_api_key

# Optional: Other APIs
GOOGLE_CSE_KEY=your_google_custom_search_key
GOOGLE_CSE_CX=your_search_engine_id
SERPAPI_KEY=your_serpapi_key
```

### 3. Configure VS Code (for GitHub Copilot)

Add to `.vscode/settings.json`:

```json
{
  "github.copilot.advanced": {
    "mcp": {
      "enabled": true,
      "configPath": ".mcp/config.json"
    }
  }
}
```

### 4. Test MCP Server

```powershell
# Test SQLite MCP server
node backend/src/database/mcp-server.js

# Test with MCP inspector (optional)
npx @modelcontextprotocol/inspector backend/src/database/mcp-server.js
```

## Available MCP Servers

### 🗂️ Filesystem Server
- **Purpose**: Read/write project files
- **Scope**: Entire project directory
- **Tools**: `read_file`, `write_file`, `list_directory`, `search_files`

### 🐙 GitHub Server
- **Purpose**: Repository management and code exploration
- **Tools**: `list_repos`, `get_file_contents`, `create_issue`, `search_code`
- **Requires**: `GITHUB_TOKEN` environment variable

### 🔍 Brave Search Server
- **Purpose**: Internet-wide web search
- **Tools**: `web_search`, `news_search`, `image_search`
- **Requires**: `BRAVE_API_KEY` environment variable
- **Note**: Provides full internet access to agents

### 🌐 Fetch Server
- **Purpose**: HTTP requests to any URL
- **Tools**: `fetch_url`, `post_data`, `get_headers`
- **Note**: Unrestricted internet access

### 🎭 Puppeteer Server
- **Purpose**: Browser automation and web scraping
- **Tools**: `navigate`, `screenshot`, `extract_content`, `interact`
- **Use Cases**: Dynamic content scraping, automated testing

### 🗄️ SQLite Server (Custom)
- **Purpose**: Query assistant database
- **Tools**: 
  - `query_workspace_layouts`
  - `get_layout_by_id`
  - `list_tables`
  - `describe_table`
  - `query_database` (read-only)
- **Resources**:
  - `db://assistant/schema` - Full database schema
  - `db://assistant/workspace_layouts` - Saved layouts
  - `db://assistant/stats` - Database statistics

### 🔄 Git Server
- **Purpose**: Git operations
- **Tools**: `git_status`, `git_log`, `git_diff`, `git_commit`

### 🧠 Memory Server
- **Purpose**: Persistent context across sessions
- **Tools**: `store_memory`, `recall_memory`, `list_memories`

### 💭 Sequential Thinking Server
- **Purpose**: Enhanced reasoning and planning
- **Tools**: `think_step_by_step`, `analyze_problem`, `create_plan`

### 🔎 Everything Server (Windows)
- **Purpose**: Ultra-fast file search
- **Tools**: `search_files`, `search_by_pattern`
- **Requires**: Everything search engine installed

## MCP Configuration File

Location: `.mcp/config.json`

```json
{
  "mcpServers": {
    "server-name": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-name"],
      "env": {
        "API_KEY": "${ENV_VAR_NAME}"
      },
      "description": "Server description",
      "enabled": true
    }
  }
}
```

### Configuration Options

- **command**: Executable to run the server (`npx`, `node`, `python`, etc.)
- **args**: Command-line arguments
- **env**: Environment variables (use `${VAR}` for .env substitution)
- **description**: Human-readable description
- **enabled**: Toggle server on/off

## Internet Access Configuration

To give agents full internet access, enable these servers:

1. **Brave Search** - Structured web search
   ```json
   "brave-search": {
     "enabled": true
   }
   ```

2. **Fetch** - Raw HTTP access
   ```json
   "fetch": {
     "enabled": true
   }
   ```

3. **Puppeteer** - Browser automation
   ```json
   "puppeteer": {
     "enabled": true
   }
   ```

## Security Considerations

### ⚠️ Dangerous Servers (Disabled by Default)

#### Shell Server
```json
"shell": {
  "enabled": false  // Can execute arbitrary commands
}
```

**Risk**: Full system access - enable only in trusted environments

### 🔒 Safe Practices

1. **Read-only mode**: SQLite server only allows SELECT queries
2. **Environment variables**: Never commit API keys to git
3. **Scoped access**: Filesystem server limited to project directory
4. **Token permissions**: Use minimal GitHub token scopes

## Usage Examples

### Agent Queries with MCP Context

**Example 1: Search the web and update documentation**
```
Agent: "Search for best practices for Electron auto-update and update our docs"

MCP Flow:
1. Uses Brave Search to find latest info
2. Uses Fetch to read detailed articles
3. Uses Filesystem to update README.md
```

**Example 2: Query database and generate report**
```
Agent: "How many workspace layouts are saved and what's the most common configuration?"

MCP Flow:
1. Uses SQLite server to query workspace_layouts table
2. Analyzes layout JSON data
3. Generates summary report
```

**Example 3: Monitor GitHub issues**
```
Agent: "Check for new issues in the repo and summarize them"

MCP Flow:
1. Uses GitHub server to list issues
2. Uses Sequential Thinking to categorize
3. Uses Memory server to track previously seen issues
```

## Troubleshooting

### Server Won't Start
```powershell
# Check if node is available
node --version

# Test server directly
node backend/src/database/mcp-server.js

# Check logs
Get-Content .mcp/logs/server-name.log
```

### Missing Dependencies
```powershell
# Install MCP SDK
npm install @modelcontextprotocol/sdk

# Install SQLite driver
cd backend
npm install better-sqlite3
```

### Environment Variables Not Loading
```powershell
# Verify .env file
Get-Content backend/.env

# Test variable expansion
echo $env:BRAVE_API_KEY

# Restart VS Code after .env changes
```

### Permission Errors
```powershell
# Windows: Run as Administrator if needed
# Check file permissions
icacls .mcp\config.json
```

## Advanced Configuration

### Custom MCP Server Development

Create a new MCP server:

```javascript
// my-server.js
const { Server } = require('@modelcontextprotocol/sdk/server');

const server = new Server({
  name: 'my-custom-server',
  version: '1.0.0',
});

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'my_tool',
        description: 'Does something useful',
        inputSchema: { /* JSON Schema */ }
      }
    ]
  };
});

// ... implement handlers
```

Register in `.mcp/config.json`:

```json
"my-custom-server": {
  "command": "node",
  "args": ["path/to/my-server.js"],
  "enabled": true
}
```

### Multi-Provider Setup

Configure multiple search providers:

```json
"search": {
  "brave": { "enabled": true, "priority": 1 },
  "google": { "enabled": true, "priority": 2 },
  "serpapi": { "enabled": false }
}
```

### Logging and Debugging

Enable debug logging:

```json
"mcpServers": {
  "server-name": {
    "env": {
      "DEBUG": "mcp:*",
      "LOG_LEVEL": "debug"
    }
  }
}
```

## Integration with AI Assistant Features

### Auto-Update Integration
The MCP GitHub server can check for releases:
```javascript
// Agent can query: "Check if there's a new release"
agent.useTool('github', 'list_releases', { repo: 'AI-Assistant' });
```

### Web Scraping Integration
Combine Puppeteer MCP with built-in scraper:
```javascript
// Agent can: "Scrape the latest documentation from electron.build"
agent.useTool('puppeteer', 'scrape', { url: 'https://electron.build' });
```

### Search Provider Integration
MCP Brave Search complements backend search routes:
```javascript
// Agent can: "Search for React performance tips and cache the results"
agent.useTool('brave-search', 'web_search', { q: 'React performance' });
```

## References

- [MCP Specification](https://modelcontextprotocol.io)
- [MCP SDK Documentation](https://github.com/modelcontextprotocol/sdk)
- [GitHub Copilot MCP Guide](https://docs.github.com/copilot/using-github-copilot/using-mcp)
- [VS Code MCP Extension](https://marketplace.visualstudio.com/items?itemName=modelcontextprotocol.vscode-mcp)

## Contributing

To add a new MCP server to this project:

1. Install the server package: `npm install @modelcontextprotocol/server-xyz`
2. Add configuration to `.mcp/config.json`
3. Document the server in this guide
4. Add environment variables to `.env.example`
5. Test with `npx @modelcontextprotocol/inspector`

---

**Note**: This MCP configuration gives AI agents unprecedented access to project context and the internet. Always review agent actions before executing in production environments.
