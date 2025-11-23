# MCP Quick Reference Card

## 🚀 Quick Start Commands

```powershell
# Setup MCP environment
.\scripts\setup-mcp.ps1 -InstallServers -TestConnection

# Test SQLite MCP server
node backend\src\database\mcp-server.js

# Inspect MCP server (debugging)
npx @modelcontextprotocol/inspector backend\src\database\mcp-server.js
```

## 🔧 Available Tools

### 📁 Filesystem
- `read_file(path)` - Read any project file
- `write_file(path, content)` - Write to project files
- `list_directory(path)` - List directory contents
- `search_files(pattern)` - Search for files

### 🐙 GitHub
- `list_repos()` - List your repositories
- `get_file_contents(repo, path)` - Read remote files
- `search_code(query, repo)` - Search code in repos
- `create_issue(repo, title, body)` - Create GitHub issues
- `list_releases(repo)` - Check for new releases

### 🔍 Brave Search (Internet Access)
- `web_search(query, count)` - Search the web
- `news_search(query)` - Search news articles
- `image_search(query)` - Search images

### 🌐 Fetch (HTTP Access)
- `fetch_url(url, method, headers)` - HTTP requests to any URL
- `post_data(url, data)` - POST requests
- `get_headers(url)` - Get response headers

### 🎭 Puppeteer (Browser Automation)
- `navigate(url)` - Navigate to URL
- `screenshot(selector)` - Take screenshots
- `extract_content(selectors)` - Extract page content
- `interact(selector, action)` - Click, type, etc.

### 🗄️ SQLite (Assistant Database)
- `query_workspace_layouts(userId)` - Get saved layouts
- `get_layout_by_id(layoutId)` - Get specific layout
- `list_tables()` - List database tables
- `describe_table(tableName)` - Get table schema
- `query_database(query)` - Execute SELECT queries

### 🔄 Git
- `git_status()` - Check git status
- `git_log(limit)` - View commit history
- `git_diff(file)` - View file changes
- `git_commit(message)` - Commit changes

### 🧠 Memory
- `store_memory(key, value)` - Store context for later
- `recall_memory(key)` - Retrieve stored context
- `list_memories()` - List all stored memories

### 💭 Sequential Thinking
- `think_step_by_step(problem)` - Break down complex problems
- `analyze_problem(description)` - Deep problem analysis
- `create_plan(goal)` - Generate action plans

## 📚 Resources

### Database Resources
- `db://assistant/schema` - Complete database schema
- `db://assistant/workspace_layouts` - All workspace layouts
- `db://assistant/stats` - Database statistics (row counts, sizes)

## 💬 Example Queries for AI Agents

### Search and Learn
```
"Search the web for Electron security best practices and summarize the top 3 recommendations"

Flow:
1. Brave Search: web_search("Electron security best practices")
2. Fetch: fetch_url(top_results)
3. Sequential Thinking: analyze and summarize
```

### Code Analysis
```
"Find all uses of useState in the frontend and check if they follow React best practices"

Flow:
1. Filesystem: search_files("*.jsx")
2. Filesystem: read_file(each file)
3. Sequential Thinking: analyze patterns
```

### Database Queries
```
"How many workspace layouts exist and what's the average number of panels?"

Flow:
1. SQLite: query_workspace_layouts()
2. SQLite: query_database("SELECT AVG(json_array_length(layout_data)) FROM workspace_layouts")
3. Memory: store_memory("last_layout_stats", results)
```

### GitHub Integration
```
"Check if there are any open issues labeled 'bug' and create a summary"

Flow:
1. GitHub: search_code("is:issue is:open label:bug")
2. Sequential Thinking: categorize issues
3. Filesystem: write_file("bug-summary.md", summary)
```

### Web Scraping
```
"Scrape the latest version number from the Electron website"

Flow:
1. Puppeteer: navigate("https://electronjs.org")
2. Puppeteer: extract_content({ version: ".version-number" })
3. Memory: store_memory("electron_latest_version", version)
```

### Multi-Step Workflows
```
"Research React 19 features, update our dependencies, and document changes"

Flow:
1. Brave Search: web_search("React 19 new features")
2. Fetch: fetch_url(official docs)
3. Filesystem: read_file("package.json")
4. Sequential Thinking: create_plan(upgrade strategy)
5. Filesystem: write_file("REACT_19_UPGRADE.md", plan)
6. Memory: store_memory("upgrade_plan", plan)
```

## 🔒 Security Notes

### Enabled by Default (Safe)
- ✅ Filesystem (project directory only)
- ✅ GitHub (read-only by default)
- ✅ Brave Search (web search only)
- ✅ Fetch (HTTP requests)
- ✅ SQLite (SELECT queries only)
- ✅ Memory (session storage)

### Disabled by Default (Requires Caution)
- ⚠️ Shell (system command execution)
- ⚠️ Postgres (if configured)

### Best Practices
1. **Review before enabling**: Check what each server can do
2. **Minimal tokens**: Use GitHub tokens with minimal required scopes
3. **Rate limiting**: Be aware of API rate limits (Brave: 2000/month free)
4. **Sensitive data**: Don't store credentials in Memory server
5. **Code review**: Review agent-generated code before executing

## 🐛 Troubleshooting

### Server won't start
```powershell
# Check server directly
node backend\src\database\mcp-server.js

# Check for errors
$LASTEXITCODE  # Should be 0
```

### Tool not found
```powershell
# Reinstall MCP SDK
cd backend
npm install @modelcontextprotocol/sdk

# Check config
Get-Content .mcp\config.json | ConvertFrom-Json
```

### Environment variables not loading
```powershell
# Verify .env
Get-Content backend\.env | Select-String "GITHUB_TOKEN"

# Reload environment
# Restart VS Code
```

### Permission denied
```powershell
# Windows: Check file permissions
icacls backend\src\database\mcp-server.js

# Grant execute permission if needed
```

## 📖 Learn More

- [Full MCP Guide](MCP_GUIDE.md)
- [MCP Specification](https://modelcontextprotocol.io)
- [VS Code Settings](.vscode/settings.json)
- [MCP Config](.mcp/config.json)

## 🎯 Pro Tips

1. **Chain tools**: Combine multiple tools for complex tasks
2. **Use memory**: Store frequently accessed data for faster retrieval
3. **Search first**: Use Brave Search before Puppeteer for efficiency
4. **Plan ahead**: Use Sequential Thinking for multi-step tasks
5. **Cache results**: Store expensive operations in Memory server
6. **Context matters**: Provide relevant files/data in your queries

## 📞 Getting Help

```
Ask AI agents:
- "What MCP tools are available?"
- "Show me how to use the SQLite MCP server"
- "What resources can I access through MCP?"
- "Help me debug MCP server connection issues"
```

---

**Remember**: MCP gives AI agents powerful capabilities. Always review their actions, especially when:
- Writing files
- Making HTTP requests
- Executing git commands
- Accessing external APIs
