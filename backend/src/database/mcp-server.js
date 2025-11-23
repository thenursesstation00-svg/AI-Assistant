#!/usr/bin/env node
/**
 * MCP Server for AI Assistant SQLite Database
 * Provides context about workspace layouts, credentials, and app state
 */

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} = require('@modelcontextprotocol/sdk/types.js');
const Database = require('better-sqlite3');
const path = require('path');

// Database path
const DB_PATH = path.resolve(__dirname, '../../data/assistant.db');

// Create MCP server
const server = new Server(
  {
    name: 'ai-assistant-db',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);

// Initialize database connection
let db;
try {
  db = new Database(DB_PATH, { readonly: true });
  console.error('Connected to database:', DB_PATH);
} catch (error) {
  console.error('Failed to connect to database:', error.message);
  process.exit(1);
}

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'query_workspace_layouts',
        description: 'Query saved workspace layouts for the multi-panel UI',
        inputSchema: {
          type: 'object',
          properties: {
            userId: {
              type: 'string',
              description: 'User ID to filter layouts (optional)',
            },
          },
        },
      },
      {
        name: 'get_layout_by_id',
        description: 'Get a specific workspace layout by ID',
        inputSchema: {
          type: 'object',
          properties: {
            layoutId: {
              type: 'integer',
              description: 'Layout ID',
            },
          },
          required: ['layoutId'],
        },
      },
      {
        name: 'list_tables',
        description: 'List all tables in the database',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'describe_table',
        description: 'Get schema information for a specific table',
        inputSchema: {
          type: 'object',
          properties: {
            tableName: {
              type: 'string',
              description: 'Name of the table to describe',
            },
          },
          required: ['tableName'],
        },
      },
      {
        name: 'query_database',
        description: 'Execute a read-only SQL query (SELECT only)',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'SQL SELECT query to execute',
            },
          },
          required: ['query'],
        },
      },
    ],
  };
});

// List available resources
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: 'db://assistant/schema',
        name: 'Database Schema',
        description: 'Complete schema of the assistant database',
        mimeType: 'application/json',
      },
      {
        uri: 'db://assistant/workspace_layouts',
        name: 'Workspace Layouts',
        description: 'All saved workspace layouts',
        mimeType: 'application/json',
      },
      {
        uri: 'db://assistant/stats',
        name: 'Database Statistics',
        description: 'Database size and row counts',
        mimeType: 'application/json',
      },
    ],
  };
});

// Read resource handler
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const uri = request.params.uri;

  if (uri === 'db://assistant/schema') {
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    const schema = {};

    for (const table of tables) {
      const columns = db.prepare(`PRAGMA table_info(${table.name})`).all();
      schema[table.name] = columns;
    }

    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(schema, null, 2),
        },
      ],
    };
  }

  if (uri === 'db://assistant/workspace_layouts') {
    const layouts = db.prepare('SELECT * FROM workspace_layouts ORDER BY updated_at DESC').all();
    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(layouts, null, 2),
        },
      ],
    };
  }

  if (uri === 'db://assistant/stats') {
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    const stats = {};

    for (const table of tables) {
      const count = db.prepare(`SELECT COUNT(*) as count FROM ${table.name}`).get();
      stats[table.name] = count.count;
    }

    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(stats, null, 2),
        },
      ],
    };
  }

  throw new Error(`Unknown resource: ${uri}`);
});

// Call tool handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === 'query_workspace_layouts') {
    let query = 'SELECT * FROM workspace_layouts';
    const params = [];

    if (args.userId) {
      query += ' WHERE user_id = ?';
      params.push(args.userId);
    }

    query += ' ORDER BY updated_at DESC';
    const results = db.prepare(query).all(...params);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(results, null, 2),
        },
      ],
    };
  }

  if (name === 'get_layout_by_id') {
    const result = db.prepare('SELECT * FROM workspace_layouts WHERE id = ?').get(args.layoutId);

    return {
      content: [
        {
          type: 'text',
          text: result ? JSON.stringify(result, null, 2) : 'Layout not found',
        },
      ],
    };
  }

  if (name === 'list_tables') {
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(tables.map((t) => t.name), null, 2),
        },
      ],
    };
  }

  if (name === 'describe_table') {
    const columns = db.prepare(`PRAGMA table_info(${args.tableName})`).all();

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(columns, null, 2),
        },
      ],
    };
  }

  if (name === 'query_database') {
    // Security: only allow SELECT queries
    if (!args.query.trim().toUpperCase().startsWith('SELECT')) {
      throw new Error('Only SELECT queries are allowed');
    }

    try {
      const results = db.prepare(args.query).all();

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(results, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error executing query: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  throw new Error(`Unknown tool: ${name}`);
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('AI Assistant MCP server running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});

// Cleanup on exit
process.on('SIGINT', () => {
  db.close();
  process.exit(0);
});
