/**
 * Meta-Programming Engine
 * 
 * Enables the AI to analyze, modify, and improve its own code.
 * Implements safe self-modification with validation and rollback capabilities.
 */

const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

class MetaProgrammingEngine {
  constructor() {
    this.modificationHistory = [];
    this.safetyChecks = true;
    this.backupDir = path.join(__dirname, '../../../data/code_backups');
    this.whitelistedPaths = [
      'backend/src/services',
      'backend/src/routes',
      'backend/src/config',
      'frontend/src/panels',
      'frontend/src/components'
    ];
  }

  async initialize() {
    await fs.mkdir(this.backupDir, { recursive: true });
    console.log('[Meta-Programming] Engine initialized');
  }

  /**
   * Analyze existing code to understand structure
   */
  async analyzeCode(filePath) {
    try {
      const absolutePath = path.join(process.cwd(), filePath);
      const code = await fs.readFile(absolutePath, 'utf-8');

      const analysis = {
        filePath,
        lines: code.split('\n').length,
        functions: this.extractFunctions(code),
        imports: this.extractImports(code),
        exports: this.extractExports(code),
        complexity: this.calculateComplexity(code),
        patterns: this.detectPatterns(code),
        improvements: this.suggestImprovements(code)
      };

      return analysis;
    } catch (error) {
      throw new Error(`Code analysis failed: ${error.message}`);
    }
  }

  /**
   * Extract function definitions from code
   */
  extractFunctions(code) {
    const functions = [];
    
    // Match function declarations
    const funcRegex = /(?:async\s+)?function\s+(\w+)\s*\([^)]*\)/g;
    const arrowRegex = /const\s+(\w+)\s*=\s*(?:async\s+)?\([^)]*\)\s*=>/g;
    const methodRegex = /(?:async\s+)?(\w+)\s*\([^)]*\)\s*{/g;

    let match;
    while ((match = funcRegex.exec(code)) !== null) {
      functions.push({ name: match[1], type: 'function', line: this.getLineNumber(code, match.index) });
    }
    while ((match = arrowRegex.exec(code)) !== null) {
      functions.push({ name: match[1], type: 'arrow', line: this.getLineNumber(code, match.index) });
    }
    while ((match = methodRegex.exec(code)) !== null) {
      if (!functions.some(f => f.name === match[1])) {
        functions.push({ name: match[1], type: 'method', line: this.getLineNumber(code, match.index) });
      }
    }

    return functions;
  }

  /**
   * Extract import statements
   */
  extractImports(code) {
    const imports = [];
    const importRegex = /(?:import|require)\s*\(?['"]([^'"]+)['"]\)?/g;
    
    let match;
    while ((match = importRegex.exec(code)) !== null) {
      imports.push(match[1]);
    }

    return imports;
  }

  /**
   * Extract export statements
   */
  extractExports(code) {
    const exports = [];
    const exportRegex = /export\s+(?:default\s+)?(?:class|function|const)?\s*(\w+)/g;
    const moduleExportRegex = /module\.exports\s*=\s*(\w+)/g;

    let match;
    while ((match = exportRegex.exec(code)) !== null) {
      exports.push(match[1]);
    }
    while ((match = moduleExportRegex.exec(code)) !== null) {
      exports.push(match[1]);
    }

    return exports;
  }

  /**
   * Calculate cyclomatic complexity
   */
  calculateComplexity(code) {
    // Simple complexity calculation based on control structures
    const controlStructures = [
      /\bif\s*\(/g,
      /\belse\s+if\s*\(/g,
      /\bfor\s*\(/g,
      /\bwhile\s*\(/g,
      /\bswitch\s*\(/g,
      /\bcase\s+/g,
      /\bcatch\s*\(/g,
      /&&/g,
      /\|\|/g
    ];

    let complexity = 1; // Base complexity
    for (const pattern of controlStructures) {
      const matches = code.match(pattern);
      complexity += matches ? matches.length : 0;
    }

    return complexity;
  }

  /**
   * Detect code patterns
   */
  detectPatterns(code) {
    const patterns = [];

    if (code.includes('class ')) patterns.push('object-oriented');
    if (code.includes('async ') || code.includes('await ')) patterns.push('async-await');
    if (code.includes('Promise')) patterns.push('promises');
    if (code.includes('.map(') || code.includes('.filter(') || code.includes('.reduce(')) patterns.push('functional');
    if (code.includes('try {') && code.includes('catch')) patterns.push('error-handling');
    if (code.includes('/**') || code.includes('//')) patterns.push('documented');

    return patterns;
  }

  /**
   * Suggest code improvements
   */
  suggestImprovements(code) {
    const improvements = [];
    const lines = code.split('\n');

    // Check for long functions
    const functions = this.extractFunctions(code);
    for (const func of functions) {
      const funcCode = this.extractFunctionBody(code, func.name);
      if (funcCode && funcCode.split('\n').length > 50) {
        improvements.push({
          type: 'refactor',
          location: func.name,
          suggestion: 'Function is too long, consider breaking into smaller functions',
          priority: 'medium'
        });
      }
    }

    // Check for missing error handling
    if (code.includes('await ') && !code.includes('try {')) {
      improvements.push({
        type: 'error-handling',
        suggestion: 'Add try-catch blocks for async operations',
        priority: 'high'
      });
    }

    // Check for console.logs (should use proper logging)
    if (code.includes('console.log(')) {
      improvements.push({
        type: 'logging',
        suggestion: 'Replace console.log with proper logging system',
        priority: 'low'
      });
    }

    // Check complexity
    const complexity = this.calculateComplexity(code);
    if (complexity > 20) {
      improvements.push({
        type: 'complexity',
        value: complexity,
        suggestion: 'High complexity detected, consider simplification',
        priority: 'high'
      });
    }

    return improvements;
  }

  /**
   * Generate improved version of code
   */
  async generateImprovedCode(filePath, improvements) {
    const code = await fs.readFile(filePath, 'utf-8');
    let improvedCode = code;

    for (const improvement of improvements) {
      switch (improvement.type) {
        case 'error-handling':
          improvedCode = this.addErrorHandling(improvedCode);
          break;
        case 'logging':
          improvedCode = this.improveLogging(improvedCode);
          break;
        case 'refactor':
          // More complex refactoring would be done here
          break;
      }
    }

    return {
      original: code,
      improved: improvedCode,
      changes: this.diffCode(code, improvedCode)
    };
  }

  /**
   * Add error handling to code
   */
  addErrorHandling(code) {
    // Wrap unprotected async functions in try-catch
    const lines = code.split('\n');
    let inAsyncFunc = false;
    let hasTryCatch = false;
    let result = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (line.includes('async ') && line.includes('{')) {
        inAsyncFunc = true;
        hasTryCatch = false;
      }
      
      if (inAsyncFunc && line.includes('try {')) {
        hasTryCatch = true;
      }

      result.push(line);
    }

    return result.join('\n');
  }

  /**
   * Improve logging statements
   */
  improveLogging(code) {
    return code.replace(
      /console\.log\(/g,
      'logger.info('
    );
  }

  /**
   * Self-modify: Apply code improvements
   */
  async selfModify(targetFile, improvements, options = {}) {
    if (!this.isPathWhitelisted(targetFile)) {
      throw new Error('File path not whitelisted for modification');
    }

    // 1. Create backup
    const backupPath = await this.createBackup(targetFile);

    try {
      // 2. Generate improved code
      const { original, improved, changes } = await this.generateImprovedCode(targetFile, improvements);

      // 3. Safety checks
      if (this.safetyChecks) {
        const safetyCheck = await this.performSafetyChecks(improved);
        if (!safetyCheck.passed) {
          throw new Error(`Safety check failed: ${safetyCheck.reason}`);
        }
      }

      // 4. Write improved code
      if (!options.dryRun) {
        await fs.writeFile(targetFile, improved, 'utf-8');
      }

      // 5. Run tests if available
      if (options.runTests) {
        await this.runTests(targetFile);
      }

      // 6. Record modification
      this.modificationHistory.push({
        timestamp: new Date().toISOString(),
        file: targetFile,
        backup: backupPath,
        improvements,
        changes,
        success: true
      });

      return {
        success: true,
        file: targetFile,
        backup: backupPath,
        changes
      };

    } catch (error) {
      // Rollback on error
      await this.rollback(targetFile, backupPath);
      
      this.modificationHistory.push({
        timestamp: new Date().toISOString(),
        file: targetFile,
        backup: backupPath,
        improvements,
        error: error.message,
        success: false
      });

      throw error;
    }
  }

  /**
   * Create backup of file before modification
   */
  async createBackup(filePath) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(
      this.backupDir,
      `${path.basename(filePath)}.${timestamp}.backup`
    );

    await fs.copyFile(filePath, backupPath);
    return backupPath;
  }

  /**
   * Perform safety checks on generated code
   */
  async performSafetyChecks(code) {
    const checks = {
      passed: true,
      reason: null
    };

    // Check for dangerous patterns
    const dangerousPatterns = [
      /eval\(/,
      /Function\(/,
      /exec\(/,
      /\.rm\s+-rf/,
      /process\.exit\(/
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(code)) {
        checks.passed = false;
        checks.reason = `Dangerous pattern detected: ${pattern}`;
        return checks;
      }
    }

    // Check syntax (basic)
    try {
      new Function(code);
    } catch (error) {
      checks.passed = false;
      checks.reason = `Syntax error: ${error.message}`;
      return checks;
    }

    return checks;
  }

  /**
   * Run tests for modified file
   */
  async runTests(filePath) {
    try {
      const { stdout, stderr } = await execAsync('npm test', {
        cwd: path.join(__dirname, '../../..')
      });
      return { passed: true, output: stdout };
    } catch (error) {
      return { passed: false, output: error.message };
    }
  }

  /**
   * Rollback to backup
   */
  async rollback(targetFile, backupPath) {
    try {
      await fs.copyFile(backupPath, targetFile);
      console.log(`[Meta-Programming] Rolled back ${targetFile}`);
    } catch (error) {
      console.error(`[Meta-Programming] Rollback failed:`, error);
    }
  }

  /**
   * Check if path is whitelisted for modification
   */
  isPathWhitelisted(filePath) {
    const relativePath = path.relative(process.cwd(), filePath);
    return this.whitelistedPaths.some(allowed => relativePath.startsWith(allowed));
  }

  /**
   * Calculate diff between two code versions
   */
  diffCode(original, modified) {
    const origLines = original.split('\n');
    const modLines = modified.split('\n');
    
    const changes = {
      added: 0,
      removed: 0,
      modified: 0
    };

    const maxLen = Math.max(origLines.length, modLines.length);
    for (let i = 0; i < maxLen; i++) {
      if (i >= origLines.length) changes.added++;
      else if (i >= modLines.length) changes.removed++;
      else if (origLines[i] !== modLines[i]) changes.modified++;
    }

    return changes;
  }

  // Utility methods
  getLineNumber(code, index) {
    return code.substring(0, index).split('\n').length;
  }

  extractFunctionBody(code, functionName) {
    const regex = new RegExp(`function\\s+${functionName}\\s*\\([^)]*\\)\\s*{([^}]*)}`, 's');
    const match = code.match(regex);
    return match ? match[1] : null;
  }

  /**
   * Get modification history
   */
  getHistory() {
    return this.modificationHistory;
  }

  /**
   * Get statistics
   */
  getStats() {
    return {
      totalModifications: this.modificationHistory.length,
      successfulModifications: this.modificationHistory.filter(m => m.success).length,
      failedModifications: this.modificationHistory.filter(m => !m.success).length,
      filesModified: [...new Set(this.modificationHistory.map(m => m.file))].length
    };
  }
}

module.exports = new MetaProgrammingEngine();
