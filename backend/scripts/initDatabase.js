// backend/scripts/initDatabase.js
// Database initialization script

const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const { initializeDatabase } = require('../src/database/db');

console.log('=================================');
console.log('Database Initialization Script');
console.log('=================================\n');

try {
  const db = initializeDatabase();
  
  // Verify tables were created
  const tables = db.prepare(`
    SELECT name FROM sqlite_master 
    WHERE type='table' 
    ORDER BY name
  `).all();
  
  console.log('\n📊 Created tables:');
  tables.forEach(table => {
    const count = db.prepare(`SELECT COUNT(*) as count FROM ${table.name}`).get();
    console.log(`  ✅ ${table.name.padEnd(20)} (${count.count} rows)`);
  });
  
  console.log('\n✅ Database initialized successfully!');
  console.log(`📁 Location: ${path.join(__dirname, '../data/assistant.db')}\n`);
  
  process.exit(0);
} catch (error) {
  console.error('\n❌ Database initialization failed:');
  console.error(error);
  process.exit(1);
}
