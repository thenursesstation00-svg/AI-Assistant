// backend/src/database/migrate.js
// Database migration script to update schema safely

const sqlite3 = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_DIR = path.resolve(__dirname, '../../data');
const DB_PATH = path.join(DB_DIR, 'assistant.db');

function migrate() {
  console.log('🔄 Running database migrations...');
  
  // Ensure data directory exists
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  const db = sqlite3(DB_PATH);
  db.pragma('foreign_keys = ON');

  // Get current tables
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  const tableNames = tables.map(t => t.name);

  console.log('📋 Existing tables:', tableNames.join(', '));

  // Migration 1: Add provider column to conversations if missing
  if (tableNames.includes('conversations')) {
    const columns = db.pragma("table_info('conversations')");
    const hasProvider = columns.some(col => col.name === 'provider');
    
    if (!hasProvider) {
      console.log('  ➕ Adding provider column to conversations');
      db.exec("ALTER TABLE conversations ADD COLUMN provider TEXT DEFAULT 'anthropic'");
    }
    
    const hasModel = columns.some(col => col.name === 'model');
    if (!hasModel) {
      console.log('  ➕ Adding model column to conversations');
      db.exec("ALTER TABLE conversations ADD COLUMN model TEXT DEFAULT 'claude-3-5-sonnet-20241022'");
    }
    
    const hasMetadata = columns.some(col => col.name === 'metadata');
    if (!hasMetadata) {
      console.log('  ➕ Adding metadata column to conversations');
      db.exec("ALTER TABLE conversations ADD COLUMN metadata JSON");
    }
  }

  // Migration 2: Create missing core tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS conversations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      archived BOOLEAN DEFAULT 0,
      provider TEXT DEFAULT 'anthropic',
      model TEXT DEFAULT 'claude-3-5-sonnet-20241022',
      metadata JSON
    );

    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      conversation_id INTEGER NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('user', 'assistant', 'system')),
      content TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      tokens_used INTEGER,
      metadata JSON,
      FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS credentials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      provider TEXT NOT NULL,
      key_name TEXT NOT NULL,
      encrypted_value TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      expires_at TEXT,
      is_active BOOLEAN DEFAULT 1,
      last_validated_at TEXT,
      validation_status TEXT CHECK(validation_status IN ('valid', 'invalid', 'unknown')),
      UNIQUE(provider, key_name)
    );

    CREATE TABLE IF NOT EXISTS provider_configs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      provider TEXT UNIQUE NOT NULL,
      display_name TEXT NOT NULL,
      default_model TEXT,
      temperature REAL DEFAULT 0.7,
      max_tokens INTEGER DEFAULT 2048,
      top_p REAL DEFAULT 1.0,
      custom_params JSON,
      is_enabled BOOLEAN DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS ui_preferences (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER DEFAULT 1,
      preference_key TEXT UNIQUE NOT NULL,
      preference_value TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS layout_configs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      layout_data JSON NOT NULL,
      is_default BOOLEAN DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS agents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      steps JSON NOT NULL,
      is_enabled BOOLEAN DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS agent_runs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      agent_id INTEGER NOT NULL,
      started_at TEXT NOT NULL DEFAULT (datetime('now')),
      completed_at TEXT,
      status TEXT CHECK(status IN ('running', 'completed', 'failed', 'cancelled')),
      execution_log JSON,
      FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE
    );
  `);

  console.log('  ✅ Core tables ensured');

  // Migration 3: Create indexes
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
    CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
    CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at);
    CREATE INDEX IF NOT EXISTS idx_conversations_provider ON conversations(provider);
    CREATE INDEX IF NOT EXISTS idx_credentials_provider ON credentials(provider);
    CREATE INDEX IF NOT EXISTS idx_agent_runs_agent_id ON agent_runs(agent_id);
    CREATE INDEX IF NOT EXISTS idx_agent_runs_status ON agent_runs(status);
  `);

  console.log('  ✅ Indexes created');

  // Migration 4: Insert default data (check column names first)
  const providerConfigCols = db.pragma("table_info('provider_configs')");
  const hasProviderCol = providerConfigCols.some(col => col.name === 'provider');
  const hasProviderNameCol = providerConfigCols.some(col => col.name === 'provider_name');
  
  if (hasProviderCol) {
    db.exec(`
      INSERT OR IGNORE INTO provider_configs (provider, display_name, default_model, temperature, max_tokens, is_enabled)
      VALUES 
        ('anthropic', 'Anthropic Claude', 'claude-3-5-sonnet-20241022', 0.7, 4096, 1),
        ('openai', 'OpenAI GPT', 'gpt-4-turbo-preview', 0.7, 4096, 0),
        ('gemini', 'Google Gemini', 'gemini-1.5-pro', 0.7, 4096, 0),
        ('ollama', 'Ollama (Local)', 'llama3', 0.7, 2048, 0);
    `);
  } else if (hasProviderNameCol) {
    // Old schema - skip provider_configs insertion
    console.log('  ⚠️  Legacy provider_configs schema detected, skipping insert');
  }

  db.exec(`
    INSERT OR IGNORE INTO ui_preferences (preference_key, preference_value)
    VALUES 
      ('theme', 'dark'),
      ('font_size', '14'),
      ('editor_theme', 'vs-dark'),
      ('show_line_numbers', 'true'),
      ('word_wrap', 'true');

    INSERT OR IGNORE INTO layout_configs (name, layout_data, is_default)
    VALUES 
      ('default', '{"panels":[{"id":"chat","x":0,"y":0,"w":8,"h":12},{"id":"settings","x":8,"y":0,"w":4,"h":6}]}', 1);
  `);

  // Migration 5: Add Tooling & Safety tables (Phase P1)
  db.exec(`
    CREATE TABLE IF NOT EXISTS persona_policies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      persona_id TEXT NOT NULL,
      tool_pattern TEXT NOT NULL,
      policy TEXT NOT NULL CHECK(policy IN ('allow', 'deny', 'ask')),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(persona_id, tool_pattern)
    );
  `);
  
  // Insert default policies if table is empty
  const policyCount = db.prepare('SELECT count(*) as count FROM persona_policies').get().count;
  if (policyCount === 0) {
    db.exec(`
      INSERT INTO persona_policies (persona_id, tool_pattern, policy) VALUES
      ('default', 'git.*', 'ask'),
      ('default', 'shell.*', 'ask'),
      ('default', 'system.*', 'allow'),
      ('developer', 'git.*', 'allow'),
      ('developer', 'shell.exec', 'ask'),
      ('developer', 'shell.read', 'allow');
    `);
    console.log('  ✅ Default persona policies inserted');
  }

  console.log('  ✅ Default data inserted');

  db.close();
  console.log('✅ Database migration complete!');
}

if (require.main === module) {
  migrate();
}

module.exports = { migrate };
