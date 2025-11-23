-- backend/src/database/schema.sql
-- SQLite database schema for AI Assistant

-- Conversations table
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

-- Messages table
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

-- API credentials table (encrypted storage)
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

-- AI provider configurations
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

-- User interface preferences
CREATE TABLE IF NOT EXISTS ui_preferences (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER DEFAULT 1,
  preference_key TEXT UNIQUE NOT NULL,
  preference_value TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Layout configurations for workspace
CREATE TABLE IF NOT EXISTS layout_configs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  layout_data JSON NOT NULL,
  is_default BOOLEAN DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Agent definitions
CREATE TABLE IF NOT EXISTS agents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  steps JSON NOT NULL,
  is_enabled BOOLEAN DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Agent execution logs
CREATE TABLE IF NOT EXISTS agent_runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  agent_id INTEGER NOT NULL,
  started_at TEXT NOT NULL DEFAULT (datetime('now')),
  completed_at TEXT,
  status TEXT CHECK(status IN ('running', 'completed', 'failed', 'cancelled')),
  execution_log JSON,
  FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at);
CREATE INDEX IF NOT EXISTS idx_conversations_provider ON conversations(provider);
CREATE INDEX IF NOT EXISTS idx_credentials_provider ON credentials(provider);
CREATE INDEX IF NOT EXISTS idx_agent_runs_agent_id ON agent_runs(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_runs_status ON agent_runs(status);

-- Insert default provider configurations
INSERT OR IGNORE INTO provider_configs (provider, display_name, default_model, temperature, max_tokens, is_enabled)
VALUES 
  ('anthropic', 'Anthropic Claude', 'claude-3-5-sonnet-20241022', 0.7, 4096, 1),
  ('openai', 'OpenAI GPT', 'gpt-4-turbo-preview', 0.7, 4096, 0),
  ('gemini', 'Google Gemini', 'gemini-1.5-pro', 0.7, 4096, 0),
  ('ollama', 'Ollama (Local)', 'llama3', 0.7, 2048, 0);

-- Insert default UI preferences
INSERT OR IGNORE INTO ui_preferences (preference_key, preference_value)
VALUES 
  ('theme', 'dark'),
  ('font_size', '14'),
  ('editor_theme', 'vs-dark'),
  ('show_line_numbers', 'true'),
  ('word_wrap', 'true');

-- Insert default layout
INSERT OR IGNORE INTO layout_configs (name, layout_data, is_default)
VALUES 
  ('default', '{"panels":[{"id":"chat","x":0,"y":0,"w":8,"h":12},{"id":"settings","x":8,"y":0,"w":4,"h":6}]}', 1);
