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
#!/usr/bin/env node

const { getDatabase, closeDatabase } = require('../src/db/connection');
const path = require('path');

console.log('='.repeat(60));
console.log('AI Assistant - Database Initialization');
console.log('='.repeat(60));

try {
  const db = getDatabase();
  const dbPath = path.resolve(__dirname, '../data/assistant.db');
  
  console.log('\n✓ Database initialized successfully!');
  console.log(`  Location: ${dbPath}`);
  
  // Verify tables exist
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();
  console.log(`\n✓ Tables created (${tables.length}):`);
  tables.forEach(t => console.log(`  - ${t.name}`));
  
  // Show indexes
  const indexes = db.prepare("SELECT name FROM sqlite_master WHERE type='index' AND name NOT LIKE 'sqlite_%' ORDER BY name").all();
  console.log(`\n✓ Indexes created (${indexes.length}):`);
  indexes.forEach(i => console.log(`  - ${i.name}`));
  
  // Show database info
  const info = db.pragma('database_list');
  console.log('\n✓ Database configuration:');
  info.forEach(i => console.log(`  - ${i.name}: ${i.file || 'memory'}`));
  
  const journalMode = db.pragma('journal_mode', { simple: true });
  console.log(`  - Journal mode: ${journalMode}`);
  
  const foreignKeys = db.pragma('foreign_keys', { simple: true });
  console.log(`  - Foreign keys: ${foreignKeys ? 'enabled' : 'disabled'}`);
  
  // Count records
  console.log('\n✓ Initial record counts:');
  const counts = {
    conversations: db.prepare('SELECT COUNT(*) as count FROM conversations').get().count,
    messages: db.prepare('SELECT COUNT(*) as count FROM messages').get().count,
    provider_configs: db.prepare('SELECT COUNT(*) as count FROM provider_configs').get().count,
    api_keys: db.prepare('SELECT COUNT(*) as count FROM api_keys').get().count,
    archive_runs: db.prepare('SELECT COUNT(*) as count FROM archive_runs').get().count,
  };
  
  Object.entries(counts).forEach(([table, count]) => {
    console.log(`  - ${table}: ${count} records`);
  });
  
  console.log('\n' + '='.repeat(60));
  console.log('Database is ready to use!');
  console.log('='.repeat(60));
  console.log('\nNext steps:');
  console.log('  1. Run: node scripts/seedProviders.js (to add default providers)');
  console.log('  2. Start backend: npm run dev');
  console.log('  3. Test API: curl http://localhost:3001/health');
  console.log('');
  
  closeDatabase();
  process.exit(0);
} catch (error) {
  console.error('\n✗ Database initialization failed:');
  console.error(`  ${error.message}`);
  console.error('\nStack trace:');
  console.error(error.stack);
  process.exit(1);
}
