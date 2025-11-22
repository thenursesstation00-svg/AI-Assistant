const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.resolve(__dirname, '../../data/assistant.db');
const schemaPath = path.resolve(__dirname, 'schema.sql');

let db = null;

/**
 * Get or create database connection
 * @returns {Database} SQLite database instance
 */
function getDatabase() {
  if (db) return db;
  
  // Ensure data directory exists
  const dataDir = path.dirname(dbPath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  // Open database
  db = new Database(dbPath);
  db.pragma('journal_mode = WAL'); // Write-Ahead Logging for better concurrency
  db.pragma('foreign_keys = ON');  // Enable foreign key constraints
  
  // Initialize schema if tables don't exist
  const tableCheck = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='conversations'").get();
  if (!tableCheck) {
    console.log('Initializing database schema...');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    db.exec(schema);
    console.log('Database schema initialized successfully.');
  }
  
  return db;
}

/**
 * Close database connection
 */
function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}

/**
 * Run a migration script
 * @param {string} migrationSQL - SQL to execute
 */
function runMigration(migrationSQL) {
  const db = getDatabase();
  db.exec(migrationSQL);
}

module.exports = { getDatabase, closeDatabase, runMigration };
