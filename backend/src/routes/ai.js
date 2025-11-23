/**
 * AI Intelligence Routes
 * Exposes self-learning, meta-programming, and external editor capabilities
 */

const express = require('express');
const router = express.Router();
const selfLearning = require('../services/ai/selfLearning');
const metaProgramming = require('../services/ai/metaProgramming');
const externalEditors = require('../services/ai/externalEditors');
const fs = require('fs').promises;
const path = require('path');

// Initialize systems
selfLearning.initialize();
metaProgramming.initialize();

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
 * Analyze code using meta-programming engine
 */
router.post('/analyze-code', async (req, res) => {
  try {
    const { code, language, filePath } = req.body;

    // Create temporary file for analysis
    const tempPath = path.join(__dirname, '../../data/temp', `analysis_${Date.now()}.${getExtension(language)}`);
    await fs.mkdir(path.dirname(tempPath), { recursive: true });
    await fs.writeFile(tempPath, code, 'utf-8');

    const analysis = await metaProgramming.analyzeCode(tempPath);

    // Clean up
    await fs.unlink(tempPath).catch(() => {});

    res.json({ success: true, analysis });
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
    const { editor, filePath, content, language, lineNumber } = req.body;

    let result;

    switch (editor) {
      case 'github':
        result = await externalEditors.openInGitHub({
          owner: req.body.owner || 'your-org',
          repo: req.body.repo || 'your-repo',
          branch: req.body.branch || 'main',
          filePath
        });
        break;

      case 'codespaces':
        result = await externalEditors.openInCodespaces({
          owner: req.body.owner || 'your-org',
          repo: req.body.repo || 'your-repo',
          filePath,
          lineNumber
        });
        break;

      case 'vscode':
        result = await externalEditors.openInVSCode({
          filePath,
          lineNumber,
          remote: req.body.remote
        });
        break;

      case 'codesandbox':
        result = await externalEditors.openInWebEditor({
          platform: 'codesandbox',
          files: {
            [filePath]: { content }
          }
        });
        break;

      case 'stackblitz':
        result = await externalEditors.openInWebEditor({
          platform: 'stackblitz',
          files: {
            [filePath]: { content }
          }
        });
        break;

      default:
        return res.status(400).json({ error: 'Unsupported editor type' });
    }

    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get active external editor sessions
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
 * Save file
 */
router.post('/save-file', async (req, res) => {
  try {
    const { filePath, content } = req.body;

    // Validate path (security)
    const safePath = path.join(process.cwd(), 'data/user_files', path.basename(filePath));
    await fs.mkdir(path.dirname(safePath), { recursive: true });
    await fs.writeFile(safePath, content, 'utf-8');

    res.json({ success: true, savedPath: safePath });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Execute command in external terminal
 */
router.post('/execute-terminal', async (req, res) => {
  try {
    const { command, editor, cwd } = req.body;
    
    const result = await externalEditors.executeInExternalTerminal(command, { editor, cwd });

    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Create GitHub branch for editing workflow
 */
router.post('/create-branch', async (req, res) => {
  try {
    const { owner, repo, branchName, baseBranch } = req.body;
    
    const result = await externalEditors.createBranchForEditing({
      owner,
      repo,
      branchName,
      baseBranch
    });

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

// Utility function
function getExtension(language) {
  const extMap = {
    'javascript': 'js',
    'typescript': 'ts',
    'python': 'py',
    'java': 'java',
    'csharp': 'cs',
    'cpp': 'cpp',
    'go': 'go',
    'rust': 'rs',
    'html': 'html',
    'css': 'css',
    'json': 'json',
    'markdown': 'md',
    'sql': 'sql'
  };
  return extMap[language] || 'txt';
}

module.exports = router;
