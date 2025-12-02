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
    this.backupPath = path.join(__dirname, '../../../data/code_backups');
    this.modificationHistory = [];
    this.whitelistedPaths = [
      'backend/src/services',
      'backend/src/routes',
      'backend/src/config',
      'frontend/src/panels',
      'frontend/src/components'
    ];
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    try {
      await fs.mkdir(this.backupPath, { recursive: true });
      this.initialized = true;
      console.log('[Meta-Programming] Engine initialized');
    } catch (error) {
      console.error('[Meta-Programming] Initialization error:', error);
    }
  }

  /**
   * Analyze existing code to understand structure
   */
  async analyzeCode(filePath) {
    try {
      const code = await fs.readFile(filePath, 'utf-8');

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
    let match;
    while ((match = funcRegex.exec(code)) !== null) {
      functions.push({
        name: match[1],
        type: 'function',
        line: code.substring(0, match.index).split('\n').length
      });
    }

    // Match arrow functions and methods
    const arrowRegex = /(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?\([^)]*\)\s*=>/g;
    while ((match = arrowRegex.exec(code)) !== null) {
      functions.push({
        name: match[1],
        type: 'arrow',
        line: code.substring(0, match.index).split('\n').length
      });
    }

    // Match class methods
    const methodRegex = /(?:async\s+)?(\w+)\s*\([^)]*\)\s*{/g;
    while ((match = methodRegex.exec(code)) !== null) {
      if (match[1] !== 'function' && match[1] !== 'if' && match[1] !== 'for') {
        functions.push({
          name: match[1],
          type: 'method',
          line: code.substring(0, match.index).split('\n').length
        });
      }
    }

    return functions;
  }

  /**
   * Extract import statements
   */
  extractImports(code) {
    const imports = new Set();

    const esmRegex = /import\s+(?:[\w*{}\s,]+from\s+)?['"]([^'"]+)['"]/g;
    const cjsRegex = /require\(\s*['"]([^'"]+)['"]\s*\)/g;
    let match;

    while ((match = esmRegex.exec(code)) !== null) {
      imports.add(match[1]);
    }

    while ((match = cjsRegex.exec(code)) !== null) {
      imports.add(match[1]);
    }

    return Array.from(imports);
  }

  /**
   * Extract export statements
   */
  extractExports(code) {
    const exports = [];
    const exportRegex = /(?:module\.exports|export(?:\s+default)?)\s*[={]\s*(\w+)/g;
    let match;

    while ((match = exportRegex.exec(code)) !== null) {
      exports.push(match[1]);
    }

    return exports;
  }

  /**
   * Calculate cyclomatic complexity (simplified)
   */
  calculateComplexity(code) {
    let complexity = 1; // Base complexity

    const patterns = [
      { regex: /\bif\s*\(/g, weight: 1 },
      { regex: /\belse\s+if\s*\(/g, weight: 1 },
      { regex: /\bwhile\s*\(/g, weight: 2 },
      { regex: /\bfor\s*\(/g, weight: 2 },
      { regex: /\bcase\s+/g, weight: 1 },
      { regex: /\bcatch\s*\(/g, weight: 1 },
      { regex: /\&\&/g, weight: 0.5 },
      { regex: /\|\|/g, weight: 0.5 },
      { regex: /\?/g, weight: 0.5 }
    ];

    for (const { regex, weight } of patterns) {
      const matches = code.match(regex);
      if (matches) {
        complexity += matches.length * weight;
      }
    }

    return Math.max(1, Math.round(complexity));
  }

  /**
   * Detect code patterns
   */
  detectPatterns(code) {
    const patterns = [];

    if (/async\s+function|async\s+\(/.test(code)) {
      patterns.push('async-await');
    }
    if (/Promise\.(?:all|race|any)/.test(code)) {
      patterns.push('promise-concurrency');
    }
    if (/try\s*{/.test(code)) {
      patterns.push('error-handling');
    }
    if (/\/\*\*/.test(code)) {
      patterns.push('documented');
    }
    if (/class\s+\w+/.test(code)) {
      patterns.push('object-oriented');
    }
    if (/=>\s*{?/.test(code)) {
      patterns.push('functional');
    }

    return patterns;
  }

  /**
   * Suggest code improvements
   */
  suggestImprovements(code) {
    const improvements = [];

    // Check for error handling
    if (/async\s+function/.test(code) && !/try\s*{/.test(code)) {
      improvements.push({
        type: 'error-handling',
        suggestion: 'Add try-catch blocks for async functions',
        priority: 'high'
      });
    }

    // Check for console.log
    if (/console\.log/.test(code)) {
      improvements.push({
        type: 'logging',
        suggestion: 'Replace console.log with proper logging',
        priority: 'low'
      });
    }

    // Check complexity
    const complexity = this.calculateComplexity(code);
    if (complexity > 20) {
      improvements.push({
        type: 'complexity',
        value: complexity,
        suggestion: 'Reduce complexity by extracting functions',
        priority: 'medium'
      });
    }

    // Check documentation
    if (!/\/\*\*/.test(code)) {
      improvements.push({
        type: 'documentation',
        suggestion: 'Add JSDoc comments for functions',
        priority: 'low'
      });
    }

    // Check for magic numbers
    const magicNumbers = code.match(/\b\d{2,}\b/g);
    if (magicNumbers && magicNumbers.length > 3) {
      improvements.push({
        type: 'maintainability',
        suggestion: 'Extract magic numbers to named constants',
        priority: 'medium'
      });
    }

    return improvements;
  }

  /**
   * Generate improved version of code
   */
  async generateImprovedCode(filePath, improvements) {
    try {
      let code = await fs.readFile(filePath, 'utf-8');
      const originalCode = code;
      let changes = { added: 0, removed: 0, modified: 0 };

      for (const improvement of improvements) {
        switch (improvement.type) {
          case 'error-handling':
            code = this.addErrorHandling(code);
            changes.modified++;
            break;

          case 'logging':
            code = this.improveLogging(code);
            changes.modified++;
            break;

          case 'documentation':
            code = this.addDocumentation(code);
            changes.added++;
            break;

          case 'complexity':
            // This would require more sophisticated AST manipulation
            break;

          case 'maintainability':
            code = this.extractConstants(code);
            changes.modified++;
            break;
        }
      }

      return {
        improved: code,
        changes,
        original: originalCode
      };
    } catch (error) {
      throw new Error(`Code improvement failed: ${error.message}`);
    }
  }

  /**
   * Add error handling to async functions
   */
  addErrorHandling(code) {
    let transformed = this.wrapAsyncFunctionsWithTryCatch(
      code,
      /async\s+function\s+\w+\s*\([^)]*\)\s*{/g
    );

    transformed = this.wrapAsyncFunctionsWithTryCatch(
      transformed,
      /(?:const|let|var)\s+\w+\s*=\s*async\s*\([^)]*\)\s*=>\s*{/g
    );

    return transformed;
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
   * Add basic documentation
   */
  addDocumentation(code) {
    // Add JSDoc to functions
    return code.replace(
      /((?:async\s+)?function\s+(\w+)\s*\([^)]*\))/g,
      '/**\n * $2\n */\n$1'
    );
  }

  /**
   * Extract magic numbers to constants
   */
  extractConstants(code) {
    // This is simplified - real implementation would be more sophisticated
    const constants = new Map();
    const numbers = code.match(/\b(\d{2,})\b/g) || [];
    
    numbers.forEach((num, index) => {
      if (!constants.has(num)) {
        constants.set(num, `CONSTANT_${index}`);
      }
    });

    let result = code;
    constants.forEach((name, value) => {
      result = `const ${name} = ${value};\n${result}`;
      result = result.replace(new RegExp(`\\b${value}\\b`, 'g'), name);
    });

    return result;
  }

  wrapAsyncFunctionsWithTryCatch(code, regex) {
    let updated = code;
    let match;

    while ((match = regex.exec(updated)) !== null) {
      const openBraceIndex = updated.indexOf('{', match.index);
      if (openBraceIndex === -1) continue;

      const closeIndex = this.findClosingBrace(updated, openBraceIndex);
      if (closeIndex === -1) continue;

      const body = updated.slice(openBraceIndex + 1, closeIndex);
      if (/try\s*{/.test(body)) {
        continue;
      }

      const baseIndent = this.getIndentationForIndex(updated, openBraceIndex);
      const wrappedBody = this.formatTryCatchBody(body, baseIndent);

      updated = `${updated.slice(0, openBraceIndex + 1)}\n${wrappedBody}${updated.slice(closeIndex)}`;
      regex.lastIndex = 0; // reset to ensure fresh matches after mutation
    }

    return updated;
  }

  findClosingBrace(code, openIndex) {
    let depth = 0;
    for (let i = openIndex; i < code.length; i++) {
      const char = code[i];
      if (char === '{') depth++;
      else if (char === '}') {
        depth--;
        if (depth === 0) {
          return i;
        }
      }
    }
    return -1;
  }

  getIndentationForIndex(code, index) {
    const lastNewline = code.lastIndexOf('\n', index);
    if (lastNewline === -1) return '';
    const line = code.slice(lastNewline + 1, index);
    const match = line.match(/^[ \t]*/);
    return match ? match[0] : '';
  }

  formatTryCatchBody(body, baseIndent) {
    const trimmedLines = body.split('\n').map(line => line.trimEnd());
    const content = trimmedLines
      .map(line => {
        if (!line.trim()) return '';
        return `${baseIndent}    ${line.trimStart()}`;
      })
      .join('\n')
      .trimEnd();

    const innerBlock = content ? `${content}\n` : '';

    return `${baseIndent}  try {\n${innerBlock}${baseIndent}  } catch (error) {\n${baseIndent}    console.error('Error:', error);\n${baseIndent}    throw error;\n${baseIndent}  }\n${baseIndent}`;
  }

  /**
   * Validate generated code
   */
  async validateCode(code, language = 'javascript') {
    // Check for dangerous patterns
    const dangerousPatterns = [
      /eval\s*\(/,
      /exec\s*\(/,
      /Function\s*\(/,
      /rm\s+-rf/,
      />\s*\/dev\//
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(code)) {
        throw new Error(`Dangerous pattern detected: ${pattern}`);
      }
    }

    // Basic syntax check for JavaScript
    if (language === 'javascript' || language === 'typescript') {
      try {
        new Function(code);
      } catch (error) {
        throw new Error(`Syntax error: ${error.message}`);
      }
    }

    return true;
  }

  /**
   * Create backup of file
   */
  async createBackup(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const fileName = path.basename(filePath);
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupName = `${fileName}.${timestamp}.backup`;
      const backupFilePath = path.join(this.backupPath, backupName);

      await fs.writeFile(backupFilePath, content, 'utf-8');
      return backupFilePath;
    } catch (error) {
      throw new Error(`Backup creation failed: ${error.message}`);
    }
  }

  /**
   * Restore from backup
   */
  async restoreBackup(backupFilePath, targetPath) {
    try {
      const content = await fs.readFile(backupFilePath, 'utf-8');
      await fs.writeFile(targetPath, content, 'utf-8');
      return true;
    } catch (error) {
      throw new Error(`Backup restoration failed: ${error.message}`);
    }
  }

  /**
   * Check if file path is whitelisted for modification
   */
  isWhitelisted(filePath) {
    const normalizedPath = filePath.replace(/\\/g, '/');
    return this.whitelistedPaths.some(allowed => 
      normalizedPath.includes(allowed)
    );
  }

  /**
   * Self-modify: Apply code improvements
   */
  async selfModify(targetFile, improvements, options = {}) {
    const { dryRun = true, runTests = false } = options;

    try {
      // Security check
      if (!this.isWhitelisted(targetFile)) {
        throw new Error(`File ${targetFile} is not in whitelisted paths`);
      }

      // Create backup
      const backupPath = await this.createBackup(targetFile);

      // Generate improved code
      const result = await this.generateImprovedCode(targetFile, improvements);

      // Validate
      await this.validateCode(result.improved);

      if (!dryRun) {
        // Apply changes
        await fs.writeFile(targetFile, result.improved, 'utf-8');

        // Run tests if requested
        if (runTests) {
          try {
            await execAsync('npm test');
          } catch (testError) {
            // Tests failed, rollback
            await this.restoreBackup(backupPath, targetFile);
            throw new Error(`Tests failed, changes rolled back: ${testError.message}`);
          }
        }
      }

      this.modificationHistory.push({
        timestamp: new Date().toISOString(),
        file: targetFile,
        backup: backupPath,
        changes: result.changes,
        improvements,
        dryRun,
        success: true,
        applied: !dryRun
      });

      return {
        success: true,
        file: targetFile,
        backup: backupPath,
        changes: result.changes,
        dryRun,
        improved: dryRun ? result.improved : undefined
      };

    } catch (error) {
      // Record failure
      this.modificationHistory.push({
        timestamp: new Date().toISOString(),
        file: targetFile,
        error: error.message,
        success: false
      });

      throw error;
    }
  }

  /**
   * Get modification statistics
   */
  getStats() {
    const successful = this.modificationHistory.filter(m => m.success !== false);
    const failed = this.modificationHistory.filter(m => m.success === false);

    return {
      totalModifications: this.modificationHistory.length,
      successful: successful.length,
      failed: failed.length,
      successRate: this.modificationHistory.length > 0 
        ? successful.length / this.modificationHistory.length 
        : 0
    };
  }

  /**
   * Get modification history
   */
  getHistory() {
    return this.modificationHistory;
  }
}

module.exports = new MetaProgrammingEngine();
