/**
 * AI Intelligence Routes
 * Exposes self-learning, meta-programming, external editor capabilities,
 * and advanced pattern recognition
 */

const express = require('express');
const router = express.Router();
const selfLearning = require('../services/ai/selfLearning');
const metaProgramming = require('../services/ai/metaProgramming');
const externalEditors = require('../services/ai/externalEditors');
const patternRecognition = require('../services/ai/patternRecognition');
const neuralNetwork = require('../services/ai/neuralNetwork');
const deepIntegration = require('../services/ai/deepIntegration');
const optimization = require('../services/ai/optimization');
const fs = require('fs').promises;
const path = require('path');

// Initialize systems
selfLearning.initialize();
metaProgramming.initialize();
patternRecognition.initialize();

/**
 * Record an action for learning
 */
router.post('/record-action', async (req, res) => {
  try {
    const { type, context, parameters, metadata } = req.body;
    
    const actionId = await selfLearning.recordAction({
      type,
      context,
      parameters,
      metadata
    });

    res.json({ success: true, actionId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Record action outcome
 */
router.post('/record-outcome', async (req, res) => {
  try {
    const { actionId, outcome } = req.body;
    
    await selfLearning.recordOutcome(actionId, outcome);
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Analyze code for improvements
 */
router.post('/analyze-code', async (req, res) => {
  try {
    const { code, language, filePath } = req.body;

    // Create temporary file
    const tempPath = path.join(__dirname, '../../data/temp', `analyze_${Date.now()}.${getExtension(language)}`);
    await fs.mkdir(path.dirname(tempPath), { recursive: true });
    await fs.writeFile(tempPath, code, 'utf-8');

    const analysis = await metaProgramming.analyzeCode(tempPath);

    // Clean up
    await fs.unlink(tempPath).catch(() => {});

    res.json({ 
      success: true, 
      analysis
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Generate improved code
 */
router.post('/improve-code', async (req, res) => {
  try {
    const { code, language, filePath, improvements } = req.body;

    // Create temporary file
    const tempPath = path.join(__dirname, '../../data/temp', `improve_${Date.now()}.${getExtension(language)}`);
    await fs.mkdir(path.dirname(tempPath), { recursive: true });
    await fs.writeFile(tempPath, code, 'utf-8');

    const result = await metaProgramming.generateImprovedCode(tempPath, improvements);

    // Clean up
    await fs.unlink(tempPath).catch(() => {});

    res.json({ 
      success: true, 
      improved: result.improved,
      changes: result.changes 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Trigger self-optimization
 */
router.post('/self-optimize', async (req, res) => {
  try {
    const result = await selfLearning.selfOptimize();
    
    res.json({
      success: true,
      appliedOptimizations: result.appliedOptimizations,
      improvements: result.improvements
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get learning statistics
 */
router.get('/learning-stats', async (req, res) => {
  try {
    const stats = selfLearning.getStats();
    const insights = await selfLearning.analyzePatterns();

    res.json({ 
      success: true, 
      stats,
      insights
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get meta-programming statistics
 */
router.get('/meta-stats', async (req, res) => {
  try {
    const stats = metaProgramming.getStats();
    const history = metaProgramming.getHistory().slice(-10); // Last 10

    res.json({ 
      success: true, 
      stats,
      recentModifications: history
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Open file in external editor
 */
router.post('/open-external', async (req, res) => {
  try {
    const { editor, ...options } = req.body;

    let result;

    switch (editor) {
      case 'github':
        result = await externalEditors.openInGitHub(options);
        break;
      
      case 'codespaces':
        result = await externalEditors.openInCodespaces(options);
        break;
      
      case 'vscode-local':
        result = await externalEditors.openInVSCodeLocal(options);
        break;
      
      case 'vscode-remote':
        result = await externalEditors.openInVSCodeRemote(options);
        break;
      
      case 'codesandbox':
        result = await externalEditors.openInCodeSandbox(options);
        break;
      
      case 'stackblitz':
        result = await externalEditors.openInStackBlitz(options);
        break;
      
      default:
        throw new Error(`Unsupported editor: ${editor}`);
    }

    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get external editor sessions
 */
router.get('/external-sessions', async (req, res) => {
  try {
    const sessions = externalEditors.getActiveSessions();

    res.json({ success: true, sessions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Sync changes from external editor
 */
router.post('/sync-external', async (req, res) => {
  try {
    const { sessionId } = req.body;
    
    const result = await externalEditors.syncChanges(sessionId);

    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Commit changes to GitHub
 */
router.post('/commit-github', async (req, res) => {
  try {
    const { owner, repo, branch, filePath, content, message } = req.body;
    
    const result = await externalEditors.commitToGitHub({
      owner,
      repo,
      branch,
      filePath,
      content,
      message
    });

    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Create new branch on GitHub
 */
router.post('/create-branch', async (req, res) => {
  try {
    const { owner, repo, newBranch, fromBranch } = req.body;
    
    const result = await externalEditors.createBranch({
      owner,
      repo,
      newBranch,
      fromBranch
    });

    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Self-modify code (with safety checks)
 */
router.post('/self-modify', async (req, res) => {
  try {
    const { targetFile, improvements, dryRun, runTests } = req.body;

    const result = await metaProgramming.selfModify(targetFile, improvements, {
      dryRun: dryRun !== false, // Default to dry run for safety
      runTests: runTests === true
    });

    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Record action sequence for pattern recognition
 */
router.post('/record-sequence', async (req, res) => {
  try {
    const { actions } = req.body;
    
    const sequenceId = patternRecognition.recordSequence(actions);
    
    // Check for anomalies
    const sequence = { id: sequenceId, actions };
    const anomalies = await patternRecognition.detectAnomalies(sequence);

    res.json({ 
      success: true, 
      sequenceId,
      anomalies
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get context-aware suggestions
 */
router.post('/get-suggestions', async (req, res) => {
  try {
    const { currentSequence, context } = req.body;
    
    const suggestions = await patternRecognition.getSuggestions(currentSequence, context);

    res.json({ 
      success: true, 
      suggestions
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get pattern insights
 */
router.get('/pattern-insights', async (req, res) => {
  try {
    const insights = patternRecognition.getInsights();

    res.json({ 
      success: true, 
      insights
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Cluster workflows
 */
router.post('/cluster-workflows', async (req, res) => {
  try {
    const clusters = await patternRecognition.clusterWorkflows();

    res.json({ 
      success: true, 
      clusters: clusters.map(c => ({
        id: c.id,
        size: c.sequences.length,
        representative: c.centroid.map(a => a.type).join(' → ')
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get pattern recognition statistics
 */
router.get('/pattern-stats', async (req, res) => {
  try {
    const stats = patternRecognition.getStats();

    res.json({ 
      success: true, 
      stats
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Execute terminal command (for external editor integration)
 */
router.post('/execute-terminal', async (req, res) => {
  try {
    const { command, cwd } = req.body;
    
    const result = await externalEditors.executeTerminal({ command, cwd });

    res.json({ success: result.success, ...result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Save file
 */
router.post('/save-file', async (req, res) => {
  try {
    const { filePath, content } = req.body;
    
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, content, 'utf-8');

    res.json({ success: true, filePath });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Utility function
function getExtension(language) {
  const extensions = {
    javascript: 'js',
    typescript: 'ts',
    python: 'py',
    java: 'java',
    cpp: 'cpp',
    csharp: 'cs',
    go: 'go',
    rust: 'rs',
    php: 'php',
    ruby: 'rb',
    swift: 'swift',
    kotlin: 'kt'
  };

  return extensions[language] || 'txt';
}

/**
 * Neural Network Endpoints
 */

// Get code embedding
router.post('/neural/embedding', async (req, res) => {
  try {
    const { code, language } = req.body;
    
    if (!code) {
      return res.status(400).json({ error: 'Code is required' });
    }

    const embedding = await neuralNetwork.getCodeEmbedding(code, language);
    
    res.json({ 
      success: true, 
      embedding,
      dimension: embedding.length
    });
  } catch (error) {
    console.error('Neural embedding error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Predict code quality
router.post('/neural/predict-quality', async (req, res) => {
  try {
    const { code, context } = req.body;
    
    if (!code) {
      return res.status(400).json({ error: 'Code is required' });
    }

    const prediction = await neuralNetwork.predictQuality(code, context || {});
    
    res.json({ 
      success: true, 
      ...prediction
    });
  } catch (error) {
    console.error('Quality prediction error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Generate code completion
router.post('/neural/completion', async (req, res) => {
  try {
    const { prefix, context } = req.body;
    
    if (!prefix) {
      return res.status(400).json({ error: 'Prefix is required' });
    }

    const result = await neuralNetwork.generateCompletion(prefix, context || {});
    
    res.json({ 
      success: true, 
      ...result
    });
  } catch (error) {
    console.error('Completion generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Transfer learning
router.post('/neural/transfer-learning', async (req, res) => {
  try {
    const { codebaseData } = req.body;
    
    if (!codebaseData || !codebaseData.samples) {
      return res.status(400).json({ error: 'Codebase samples are required' });
    }

    const result = await neuralNetwork.transferLearning(codebaseData);
    
    res.json(result);
  } catch (error) {
    console.error('Transfer learning error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Calculate code similarity
router.post('/neural/similarity', async (req, res) => {
  try {
    const { code1, code2, language } = req.body;
    
    if (!code1 || !code2) {
      return res.status(400).json({ error: 'Both code snippets are required' });
    }

    const result = await neuralNetwork.calculateSimilarity(code1, code2, language);
    
    res.json({ 
      success: true, 
      ...result
    });
  } catch (error) {
    console.error('Similarity calculation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get neural network stats
router.get('/neural/stats', async (req, res) => {
  try {
    const stats = neuralNetwork.getStats();
    res.json({ success: true, stats });
  } catch (error) {
    console.error('Neural stats error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Deep Integration Endpoints
 */

// Connect to LSP
router.post('/integration/lsp/connect', async (req, res) => {
  try {
    const { language, workspaceRoot } = req.body;
    
    if (!language) {
      return res.status(400).json({ error: 'Language is required' });
    }

    const serverId = await deepIntegration.connectToLSP(language, workspaceRoot);
    
    res.json({ 
      success: true, 
      serverId,
      capabilities: deepIntegration.getLSPCapabilities(language)
    });
  } catch (error) {
    console.error('LSP connection error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Request LSP completion
router.post('/integration/lsp/completion', async (req, res) => {
  try {
    const { serverId, filePath, position } = req.body;
    
    if (!serverId || !filePath || !position) {
      return res.status(400).json({ error: 'serverId, filePath, and position are required' });
    }

    const result = await deepIntegration.requestCompletion(serverId, filePath, position);
    
    res.json({ success: true, ...result });
  } catch (error) {
    console.error('LSP completion error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start debug session
router.post('/integration/debug/start', async (req, res) => {
  try {
    const { config } = req.body;
    
    if (!config) {
      return res.status(400).json({ error: 'Debug config is required' });
    }

    const sessionId = await deepIntegration.startDebugSession(config);
    
    res.json({ success: true, sessionId });
  } catch (error) {
    console.error('Debug start error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Set breakpoint
router.post('/integration/debug/breakpoint', async (req, res) => {
  try {
    const { sessionId, filePath, line } = req.body;
    
    if (!sessionId || !filePath || line === undefined) {
      return res.status(400).json({ error: 'sessionId, filePath, and line are required' });
    }

    const breakpoint = await deepIntegration.setBreakpoint(sessionId, filePath, line);
    
    res.json({ success: true, breakpoint });
  } catch (error) {
    console.error('Breakpoint error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get debug variables
router.get('/integration/debug/:sessionId/variables', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { scopeId } = req.query;

    const variables = await deepIntegration.getVariables(sessionId, scopeId);
    
    res.json({ success: true, variables });
  } catch (error) {
    console.error('Variables error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Register CI/CD hook
router.post('/integration/cicd/register', async (req, res) => {
  try {
    const config = req.body;
    
    if (!config.type || !config.url) {
      return res.status(400).json({ error: 'type and url are required' });
    }

    const hookId = await deepIntegration.registerCICDHook(config);
    
    res.json({ success: true, hookId });
  } catch (error) {
    console.error('CI/CD registration error:', error);
    res.status(500).json({ error: error.message });
  }
});

// CI/CD webhook handler
router.post('/integration/cicd/webhook/:hookId', async (req, res) => {
  try {
    const { hookId } = req.params;
    const payload = req.body;

    const result = await deepIntegration.handleCICDWebhook(hookId, payload);
    
    res.json(result);
  } catch (error) {
    console.error('CI/CD webhook error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get integration stats
router.get('/integration/stats', async (req, res) => {
  try {
    const stats = deepIntegration.getStats();
    const sessions = deepIntegration.getActiveSessions();
    
    res.json({ success: true, stats, sessions });
  } catch (error) {
    console.error('Integration stats error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Optimization Endpoints
 */

// Get cached value or compute
router.post('/optimization/cache', async (req, res) => {
  try {
    const { key, ttl, tags } = req.body;
    
    if (!key) {
      return res.status(400).json({ error: 'Cache key is required' });
    }

    const value = optimization.get(key);
    
    res.json({ 
      success: true, 
      cached: value !== null,
      value
    });
  } catch (error) {
    console.error('Cache error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Set cache value
router.post('/optimization/cache/set', async (req, res) => {
  try {
    const { key, value, ttl, tags } = req.body;
    
    if (!key || value === undefined) {
      return res.status(400).json({ error: 'key and value are required' });
    }

    optimization.set(key, value, { ttl, tags });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Cache set error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Invalidate cache by tag
router.post('/optimization/cache/invalidate', async (req, res) => {
  try {
    const { tag } = req.body;
    
    if (!tag) {
      return res.status(400).json({ error: 'Tag is required' });
    }

    const count = optimization.invalidateTag(tag);
    
    res.json({ success: true, invalidated: count });
  } catch (error) {
    console.error('Cache invalidation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get performance stats
router.get('/optimization/performance', async (req, res) => {
  try {
    const { operation } = req.query;
    const stats = optimization.getPerformanceStats(operation);
    
    res.json({ success: true, stats });
  } catch (error) {
    console.error('Performance stats error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get memory usage
router.get('/optimization/memory', async (req, res) => {
  try {
    const usage = optimization.getMemoryUsage();
    
    res.json({ success: true, usage });
  } catch (error) {
    console.error('Memory usage error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Generate optimization report
router.get('/optimization/report', async (req, res) => {
  try {
    const report = await optimization.generateReport();
    
    res.json({ success: true, report });
  } catch (error) {
    console.error('Report generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Optimize database query
router.post('/optimization/query', async (req, res) => {
  try {
    const { query, params } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const optimization_result = optimization.optimizeQuery(query, params);
    
    res.json({ success: true, ...optimization_result });
  } catch (error) {
    console.error('Query optimization error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get optimization stats
router.get('/optimization/stats', async (req, res) => {
  try {
    const stats = optimization.getStats();
    
    res.json({ success: true, stats });
  } catch (error) {
    console.error('Optimization stats error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
