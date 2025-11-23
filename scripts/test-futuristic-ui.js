#!/usr/bin/env node
/**
 * test-futuristic-ui.js - Validation script for Futuristic UI system
 * 
 * Validates that all components exist and can be imported
 */

const fs = require('fs');
const path = require('path');

const frontendDir = path.join(__dirname, '..', 'frontend', 'src');

const requiredFiles = [
  'FuturisticUI.jsx',
  'FuturisticUI.css',
  'components/WindowManager.jsx',
  'components/Window.jsx',
  'windows/ChatWindow.jsx',
  'windows/DevToolsWindow.jsx',
  'windows/FileExplorerWindow.jsx',
  'windows/AgentManagerWindow.jsx',
  'windows/TerminalWindow.jsx',
  'windows/SystemMonitorWindow.jsx',
  'windows/ReflectionWindow.jsx'
];

console.log('🚀 Validating Futuristic UI Installation...\n');

let allValid = true;
let totalSize = 0;

requiredFiles.forEach(file => {
  const filePath = path.join(frontendDir, file);
  const exists = fs.existsSync(filePath);
  
  if (exists) {
    const stats = fs.statSync(filePath);
    const sizeKB = (stats.size / 1024).toFixed(2);
    totalSize += stats.size;
    console.log(`✅ ${file.padEnd(40)} (${sizeKB} KB)`);
  } else {
    console.log(`❌ ${file.padEnd(40)} MISSING!`);
    allValid = false;
  }
});

console.log(`\n📊 Total size: ${(totalSize / 1024).toFixed(2)} KB`);

// Check App.jsx for integration
const appPath = path.join(frontendDir, 'App.jsx');
if (fs.existsSync(appPath)) {
  const appContent = fs.readFileSync(appPath, 'utf-8');
  const hasFuturisticImport = appContent.includes("import FuturisticUI from './FuturisticUI'");
  const hasFuturisticMode = appContent.includes('futuristicMode');
  const hasFuturisticRender = appContent.includes('<FuturisticUI />');
  
  console.log('\n🔗 App.jsx Integration:');
  console.log(`  ${hasFuturisticImport ? '✅' : '❌'} FuturisticUI import`);
  console.log(`  ${hasFuturisticMode ? '✅' : '❌'} futuristicMode state`);
  console.log(`  ${hasFuturisticRender ? '✅' : '❌'} FuturisticUI render`);
  
  if (!hasFuturisticImport || !hasFuturisticMode || !hasFuturisticRender) {
    allValid = false;
  }
}

// Check for required dependencies
const packageJsonPath = path.join(__dirname, '..', 'frontend', 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  const requiredDeps = [
    '@monaco-editor/react',
    'react-markdown',
    'remark-gfm'
  ];
  
  console.log('\n📦 Dependencies:');
  requiredDeps.forEach(dep => {
    if (deps[dep]) {
      console.log(`  ✅ ${dep.padEnd(30)} v${deps[dep]}`);
    } else {
      console.log(`  ⚠️  ${dep.padEnd(30)} NOT FOUND (optional)`);
    }
  });
}

// Check CSS file
const cssPath = path.join(frontendDir, 'FuturisticUI.css');
if (fs.existsSync(cssPath)) {
  const cssContent = fs.readFileSync(cssPath, 'utf-8');
  const hasGlassMorphism = cssContent.includes('backdrop-filter');
  const hasNeonColors = cssContent.includes('--neon-cyan');
  const hasAnimations = cssContent.includes('@keyframes');
  
  console.log('\n🎨 CSS Features:');
  console.log(`  ${hasGlassMorphism ? '✅' : '❌'} Glass morphism (backdrop-filter)`);
  console.log(`  ${hasNeonColors ? '✅' : '❌'} Neon color variables`);
  console.log(`  ${hasAnimations ? '✅' : '❌'} Animations`);
}

// Window components validation
console.log('\n🪟 Window Components:');
const windowFiles = requiredFiles.filter(f => f.startsWith('windows/'));
windowFiles.forEach(file => {
  const filePath = path.join(frontendDir, file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const hasDefaultExport = content.includes('export default function');
    const hasJSX = content.includes('return (');
    const hasStyles = content.includes('<style jsx>') || content.includes('className=');
    
    const componentName = path.basename(file, '.jsx');
    console.log(`  ${componentName}:`);
    console.log(`    ${hasDefaultExport ? '✅' : '❌'} Default export`);
    console.log(`    ${hasJSX ? '✅' : '❌'} JSX return`);
    console.log(`    ${hasStyles ? '✅' : '❌'} Styling`);
  }
});

console.log('\n' + '='.repeat(60));
if (allValid) {
  console.log('✅ All validation checks passed!');
  console.log('\n🚀 To test Futuristic UI:');
  console.log('   1. cd frontend');
  console.log('   2. npm install (if not done)');
  console.log('   3. npm run dev');
  console.log('   4. Click "✨ Futuristic" button in top-right corner\n');
  process.exit(0);
} else {
  console.log('❌ Some validation checks failed!');
  console.log('Please ensure all files are created correctly.\n');
  process.exit(1);
}
