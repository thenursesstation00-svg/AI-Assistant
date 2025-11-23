-- AI Assistant Database Schema
-- SQLite database for managing providers, conversations, and configuration

-- Provider configurations (AI and Web Search providers)
CREATE TABLE IF NOT EXISTS provider_configs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  provider_name TEXT NOT NULL UNIQUE,
  display_name TEXT,
  provider_type TEXT NOT NULL CHECK(provider_type IN ('ai', 'web_search')),
  api_key_encrypted TEXT,
  api_endpoint TEXT,
  default_model TEXT,
  options TEXT, -- JSON string for provider-specific options
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Conversations (replaces in-memory state)
CREATE TABLE IF NOT EXISTS conversations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT,
  provider_name TEXT,
  model TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  archived INTEGER DEFAULT 0
);

-- Messages within conversations
CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  conversation_id INTEGER NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  tokens INTEGER,
  cost REAL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
);

-- API keys (encrypted storage for various services)
CREATE TABLE IF NOT EXISTS api_keys (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  service_name TEXT NOT NULL UNIQUE,
  key_encrypted TEXT NOT NULL,
  metadata TEXT, -- JSON for additional info
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Archive runs (existing GitHub archive functionality)
CREATE TABLE IF NOT EXISTS archive_runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  query TEXT NOT NULL,
  total_count INTEGER,
  items_fetched INTEGER,
  report_path TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_conversations_updated ON conversations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_archived ON conversations(archived);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_provider_active ON provider_configs(is_active);
CREATE INDEX IF NOT EXISTS idx_provider_type ON provider_configs(provider_type);
