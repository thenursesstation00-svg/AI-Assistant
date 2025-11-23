// backend/src/database/db.js
// SQLite database connection and initialization

const sqlite3 = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_DIR = path.resolve(__dirname, '../../data');
const DB_PATH = path.join(DB_DIR, 'assistant.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

let db = null;

function getDatabase() {
  if (db) return db;

  // Ensure data directory exists
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  // Create/open database
  db = sqlite3(DB_PATH);
  
  // Enable foreign keys
  db.pragma('foreign_keys = ON');
  
  // Enable WAL mode for better concurrency
  db.pragma('journal_mode = WAL');

  console.log(`📊 Database connected: ${DB_PATH}`);
  
  return db;
}

function initializeDatabase() {
  const database = getDatabase();
  
  // Tables are created by migrate.js on server start
  // This just ensures connection is established
  console.log('✅ Database initialized');
  
  return database;
}

function closeDatabase() {
  if (db) {
    db.close();
    db = null;
    console.log('Database connection closed');
  }
}

// Graceful shutdown
process.on('SIGINT', () => {
  closeDatabase();
  process.exit(0);
});

process.on('SIGTERM', () => {
  closeDatabase();
  process.exit(0);
});

module.exports = {
  getDatabase,
  initializeDatabase,
  closeDatabase
};
