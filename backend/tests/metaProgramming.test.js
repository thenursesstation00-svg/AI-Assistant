/**
 * Meta-Programming Engine - Comprehensive Test Suite
 */

const metaProgramming = require('../src/services/ai/metaProgramming');
const fs = require('fs').promises;
const path = require('path');

describe('Meta-Programming Engine', () => {
  const testBackupPath = path.join(__dirname, '../data/test_backups');
  const testFilePath = path.join(__dirname, '../data/test_code.js');

  beforeAll(async () => {
    metaProgramming.backupPath = testBackupPath;
    await fs.mkdir(testBackupPath, { recursive: true });
    await fs.mkdir(path.dirname(testFilePath), { recursive: true });
    await metaProgramming.initialize();
  });

  afterAll(async () => {
    await fs.rm(testBackupPath, { recursive: true, force: true });
    await fs.unlink(testFilePath).catch(() => {});
  });

  beforeEach(() => {
    metaProgramming.modificationHistory = [];
  });

  describe('Code Analysis', () => {
    test('should analyze code structure', async () => {
      const code = `
function test() {
  console.log('test');
}

const arrow = () => {
  return 42;
};
`;
      await fs.writeFile(testFilePath, code);

      const analysis = await metaProgramming.analyzeCode(testFilePath);

      expect(analysis.functions.length).toBeGreaterThan(0);
      expect(analysis.lines).toBeGreaterThan(0);
      expect(analysis.complexity).toBeGreaterThan(0);
    });

    test('should extract functions correctly', () => {
      const code = `
function regularFunc() {}
const arrowFunc = () => {};
async function asyncFunc() {}
`;
      const functions = metaProgramming.extractFunctions(code);

      expect(functions).toEqual(expect.arrayContaining([
        expect.objectContaining({ name: 'regularFunc', type: 'function' }),
        expect.objectContaining({ name: 'arrowFunc', type: 'arrow' }),
        expect.objectContaining({ name: 'asyncFunc', type: 'function' })
      ]));
    });

    test('should extract imports', () => {
      const code = `
import express from 'express';
const fs = require('fs');
`;
      const imports = metaProgramming.extractImports(code);

      expect(imports).toContain('express');
      expect(imports).toContain('fs');
    });

    test('should calculate complexity', () => {
      const simpleCode = `function simple() { return true; }`;
      const complexCode = `
function complex(x) {
  if (x > 0) {
    while (x > 10) {
      if (x % 2 === 0) {
        for (let i = 0; i < x; i++) {
          // loop
        }
      }
    }
  }
}
`;

      const simpleComplexity = metaProgramming.calculateComplexity(simpleCode);
      const highComplexity = metaProgramming.calculateComplexity(complexCode);

      expect(highComplexity).toBeGreaterThan(simpleComplexity);
      expect(highComplexity).toBeGreaterThan(5);
    });

    test('should detect code patterns', () => {
      const code = `
async function test() {
  try {
    await Promise.all([]);
  } catch (error) {
    // handle
  }
}
`;
      const patterns = metaProgramming.detectPatterns(code);

      expect(patterns).toContain('async-await');
      expect(patterns).toContain('error-handling');
      expect(patterns).toContain('promise-concurrency');
    });
  });

  describe('Improvement Suggestions', () => {
    test('should suggest error handling for async functions', () => {
      const code = `async function test() { await doSomething(); }`;
      const improvements = metaProgramming.suggestImprovements(code);

      expect(improvements).toEqual(expect.arrayContaining([
        expect.objectContaining({ type: 'error-handling' })
      ]));
    });

    test('should suggest replacing console.log', () => {
      const code = `function test() { console.log('debug'); }`;
      const improvements = metaProgramming.suggestImprovements(code);

      expect(improvements).toEqual(expect.arrayContaining([
        expect.objectContaining({ type: 'logging' })
      ]));
    });

    test('should suggest documentation', () => {
      const code = `function undocumented() { return 42; }`;
      const improvements = metaProgramming.suggestImprovements(code);

      expect(improvements).toEqual(expect.arrayContaining([
        expect.objectContaining({ type: 'documentation' })
      ]));
    });

    test('should flag high complexity', () => {
      let code = `function complex(x) {`;
      for (let i = 0; i < 25; i++) {
        code += `\n  if (x > ${i}) { x++; }`;
      }
      code += `\n}`;

      const improvements = metaProgramming.suggestImprovements(code);

      expect(improvements).toEqual(expect.arrayContaining([
        expect.objectContaining({ type: 'complexity' })
      ]));
    });
  });

  describe('Code Generation', () => {
    test('should generate improved code', async () => {
      const code = `async function test() { await doSomething(); }`;
      await fs.writeFile(testFilePath, code);

      const improvements = [
        { type: 'error-handling' }
      ];

      const result = await metaProgramming.generateImprovedCode(testFilePath, improvements);

      expect(result.improved).toContain('try');
      expect(result.improved).toContain('catch');
      expect(result.changes.modified).toBeGreaterThan(0);
    });

    test('should add documentation', async () => {
      const code = `function test() { return 42; }`;
      await fs.writeFile(testFilePath, code);

      const improvements = [
        { type: 'documentation' }
      ];

      const result = await metaProgramming.generateImprovedCode(testFilePath, improvements);

      expect(result.improved).toContain('/**');
      expect(result.improved).toContain('*/');
    });
  });

  describe('Code Validation', () => {
    test('should validate safe code', async () => {
      const safeCode = `function test() { return 42; }`;
      
      await expect(metaProgramming.validateCode(safeCode)).resolves.toBe(true);
    });

    test('should reject dangerous eval', async () => {
      const dangerousCode = `eval('dangerous code');`;
      
      await expect(metaProgramming.validateCode(dangerousCode)).rejects.toThrow('Dangerous pattern');
    });

    test('should reject dangerous exec', async () => {
      const dangerousCode = `require('child_process').exec('rm -rf /');`;
      
      await expect(metaProgramming.validateCode(dangerousCode)).rejects.toThrow('Dangerous pattern');
    });

    test('should detect syntax errors', async () => {
      const invalidCode = `function test() { return `;
      
      await expect(metaProgramming.validateCode(invalidCode)).rejects.toThrow('Syntax error');
    });
  });

  describe('Backup and Restore', () => {
    test('should create backup', async () => {
      const code = `function original() { return 'backup me'; }`;
      await fs.writeFile(testFilePath, code);

      const backupPath = await metaProgramming.createBackup(testFilePath);

      expect(backupPath).toBeDefined();
      const backupContent = await fs.readFile(backupPath, 'utf-8');
      expect(backupContent).toBe(code);
    });

    test('should restore from backup', async () => {
      const originalCode = `function original() {}`;
      const modifiedCode = `function modified() {}`;
      
      await fs.writeFile(testFilePath, originalCode);
      const backupPath = await metaProgramming.createBackup(testFilePath);
      
      await fs.writeFile(testFilePath, modifiedCode);
      await metaProgramming.restoreBackup(backupPath, testFilePath);

      const restoredCode = await fs.readFile(testFilePath, 'utf-8');
      expect(restoredCode).toBe(originalCode);
    });
  });

  describe('Path Whitelisting', () => {
    test('should allow whitelisted paths', () => {
      expect(metaProgramming.isWhitelisted('backend/src/services/test.js')).toBe(true);
      expect(metaProgramming.isWhitelisted('backend/src/routes/api.js')).toBe(true);
    });

    test('should reject non-whitelisted paths', () => {
      expect(metaProgramming.isWhitelisted('/etc/passwd')).toBe(false);
      expect(metaProgramming.isWhitelisted('../../dangerous.js')).toBe(false);
    });
  });

  describe('Self-Modification', () => {
    test('should perform dry run by default', async () => {
      const code = `async function test() { await doSomething(); }`;
      await fs.writeFile(testFilePath, code);

      // Override whitelist check for test
      const originalIsWhitelisted = metaProgramming.isWhitelisted;
      metaProgramming.isWhitelisted = () => true;

      const result = await metaProgramming.selfModify(testFilePath, [
        { type: 'error-handling' }
      ]);

      expect(result.dryRun).toBe(true);
      expect(result.improved).toBeDefined();

      // File should not be modified
      const fileContent = await fs.readFile(testFilePath, 'utf-8');
      expect(fileContent).toBe(code);

      metaProgramming.isWhitelisted = originalIsWhitelisted;
    });

    test('should reject non-whitelisted files', async () => {
      const code = `function test() {}`;
      const dangerousPath = '/etc/hosts';
      
      await expect(
        metaProgramming.selfModify(dangerousPath, [])
      ).rejects.toThrow('not in whitelisted paths');
    });

    test('should record modification history', async () => {
      const code = `function test() {}`;
      await fs.writeFile(testFilePath, code);

      metaProgramming.isWhitelisted = () => true;

      await metaProgramming.selfModify(testFilePath, [
        { type: 'documentation' }
      ]);

      expect(metaProgramming.modificationHistory.length).toBeGreaterThan(0);
      const lastMod = metaProgramming.modificationHistory[metaProgramming.modificationHistory.length - 1];
      expect(lastMod.file).toBe(testFilePath);
      expect(lastMod.backup).toBeDefined();
    });
  });

  describe('Statistics', () => {
    test('should track modification stats', async () => {
      metaProgramming.modificationHistory = [
        { success: true, file: 'test1.js' },
        { success: true, file: 'test2.js' },
        { success: false, file: 'test3.js', error: 'Failed' }
      ];

      const stats = metaProgramming.getStats();

      expect(stats.totalModifications).toBe(3);
      expect(stats.successful).toBe(2);
      expect(stats.failed).toBe(1);
      expect(stats.successRate).toBeCloseTo(0.667, 2);
    });

    test('should return history', () => {
      metaProgramming.modificationHistory = [
        { file: 'test.js', timestamp: '2025-01-01' }
      ];

      const history = metaProgramming.getHistory();

      expect(history).toHaveLength(1);
      expect(history[0].file).toBe('test.js');
    });
  });
});
