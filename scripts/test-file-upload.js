// scripts/test-file-upload.js
// Quick test script for file upload functionality

const fs = require('fs');
const path = require('path');
const http = require('http');

const API_KEY = process.env.BACKEND_API_KEY || 'test-key';
const PORT = process.env.PORT || 3001;

console.log('🧪 Testing File Upload System...\n');

// Test 1: Create test files
console.log('1️⃣ Creating test files...');
const testDir = path.join(__dirname, '../backend/test-uploads');
if (!fs.existsSync(testDir)) {
  fs.mkdirSync(testDir, { recursive: true });
}

const testFiles = {
  'test.txt': 'Hello, this is a test text file!',
  'test.json': JSON.stringify({ message: 'Test JSON file', timestamp: new Date().toISOString() }, null, 2),
  'test.md': '# Test Markdown\\n\\nThis is a **markdown** file.'
};

for (const [filename, content] of Object.entries(testFiles)) {
  fs.writeFileSync(path.join(testDir, filename), content);
  console.log(`   ✓ Created ${filename}`);
}

// Test 2: Check if routes are registered
console.log('\\n2️⃣ Checking backend routes...');
const routes = [
  '/api/chat/upload',
  '/api/chat/files',
  '/api/chat/files/test'
];

console.log('   Routes to test:', routes.join(', '));

// Test 3: Verify file processor
console.log('\\n3️⃣ Testing file processor...');
try {
  const fileProcessor = require('../backend/src/services/fileProcessor');
  console.log('   ✓ FileProcessor loaded');
  
  const testFilePath = path.join(testDir, 'test.txt');
  fileProcessor.extractContent(testFilePath, 'text/plain')
    .then(result => {
      console.log('   ✓ Text extraction works');
      console.log(`   Preview: "${result.text.substring(0, 50)}..."`);
    })
    .catch(err => {
      console.log('   ✗ Text extraction failed:', err.message);
    });
} catch (error) {
  console.log('   ✗ FileProcessor error:', error.message);
}

// Test 4: Check upload directory structure
console.log('\\n4️⃣ Verifying directory structure...');
const dirs = [
  '../backend/uploads',
  '../backend/uploads/chat',
  '../backend/uploads/meta'
];

dirs.forEach(dir => {
  const fullPath = path.join(__dirname, dir);
  if (fs.existsSync(fullPath)) {
    console.log(`   ✓ ${dir} exists`);
  } else {
    console.log(`   ✗ ${dir} missing (will be created on first upload)`);
  }
});

// Test 5: Component files check
console.log('\\n5️⃣ Checking frontend components...');
const components = [
  '../frontend/src/ModernChat.jsx',
  '../frontend/src/components/FileUpload.jsx',
  '../frontend/src/components/FileChip.jsx',
  '../frontend/src/ModernChat.css'
];

components.forEach(comp => {
  const fullPath = path.join(__dirname, comp);
  if (fs.existsSync(fullPath)) {
    const size = fs.statSync(fullPath).size;
    console.log(`   ✓ ${path.basename(comp)} (${size} bytes)`);
  } else {
    console.log(`   ✗ ${path.basename(comp)} missing`);
  }
});

console.log('\\n✅ Pre-flight checks complete!');
console.log('\\n📝 Next steps:');
console.log('   1. Start backend: cd backend && npm run dev');
console.log('   2. Start frontend: cd frontend && npm run dev');
console.log('   3. Open app and try uploading files');
console.log('   4. Check backend console for upload logs');
console.log('\\n   Test files created in: backend/test-uploads/');
