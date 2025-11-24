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

module.exports = router;
