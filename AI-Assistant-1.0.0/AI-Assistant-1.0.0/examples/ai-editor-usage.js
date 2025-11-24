/**
 * Self-Learning AI Editor - Quick Start Examples
 * 
 * This file demonstrates how to use the new AI capabilities
 */

// ============================================================================
// EXAMPLE 1: Basic Code Analysis
// ============================================================================

async function analyzeMyCode() {
  const code = `
    function processData(data) {
      console.log('Processing...');
      for (let i = 0; i < data.length; i++) {
        data[i] = data[i] * 2;
      }
      return data;
    }
  `;

  const response = await fetch('http://127.0.0.1:3001/api/ai/analyze-code', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': 'your-api-key'
    },
    body: JSON.stringify({
      code,
      language: 'javascript',
      filePath: 'example.js'
    })
  });

  const result = await response.json();
  console.log('Analysis:', result.analysis);
  console.log('Improvements:', result.analysis.improvements);
  
  /* Expected output:
  {
    lines: 8,
    functions: [{ name: 'processData', type: 'function', line: 2 }],
    complexity: 3,
    patterns: ['functional'],
    improvements: [
      {
        type: 'logging',
        suggestion: 'Replace console.log with proper logging system',
        priority: 'low'
      }
    ]
  }
  */
}

// ============================================================================
// EXAMPLE 2: AI-Powered Code Improvement
// ============================================================================

async function improveMyCode() {
  const originalCode = `
    async function fetchData(url) {
      const response = await fetch(url);
      const data = await response.json();
      return data;
    }
  `;

  // Step 1: Analyze
  const analysisResponse = await fetch('http://127.0.0.1:3001/api/ai/analyze-code', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': 'your-api-key'
    },
    body: JSON.stringify({
      code: originalCode,
      language: 'javascript'
    })
  });

  const { analysis } = await analysisResponse.json();

  // Step 2: Apply improvements
  const improveResponse = await fetch('http://127.0.0.1:3001/api/ai/improve-code', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': 'your-api-key'
    },
    body: JSON.stringify({
      code: originalCode,
      language: 'javascript',
      improvements: analysis.improvements
    })
  });

  const { improved, changes } = await improveResponse.json();
  console.log('Original Code:', originalCode);
  console.log('Improved Code:', improved);
  console.log('Changes:', changes);
  
  /* Improved code might add error handling:
  async function fetchData(url) {
    try {
      const response = await fetch(url);
      const data = await response.json();
      return data;
    } catch (error) {
      logger.error('Failed to fetch data:', error);
      throw error;
    }
  }
  */
}

// ============================================================================
// EXAMPLE 3: Self-Learning from Actions
// ============================================================================

async function trackAndLearn() {
  // Record an action before executing it
  const recordResponse = await fetch('http://127.0.0.1:3001/api/ai/record-action', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': 'your-api-key'
    },
    body: JSON.stringify({
      type: 'code_edit',
      context: { language: 'javascript', filePath: 'myapp.js' },
      parameters: { autoFormat: true, validateSyntax: true },
      metadata: { codeLength: 1500 }
    })
  });

  const { actionId } = await recordResponse.json();

  // Perform the action (e.g., edit code)
  const startTime = Date.now();
  // ... your code editing logic here ...
  const executionTime = Date.now() - startTime;

  // Record the outcome
  await fetch('http://127.0.0.1:3001/api/ai/record-outcome', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': 'your-api-key'
    },
    body: JSON.stringify({
      actionId,
      outcome: {
        success: true,
        executionTime,
        quality: 0.85,
        errors: [],
        userSatisfaction: 0.9
      }
    })
  });

  console.log('✅ AI learned from this action!');
}

// ============================================================================
// EXAMPLE 4: Get Learning Statistics
// ============================================================================

async function checkLearningProgress() {
  const response = await fetch('http://127.0.0.1:3001/api/ai/learning-stats', {
    headers: {
      'x-api-key': 'your-api-key'
    }
  });

  const { stats, insights } = await response.json();
  
  console.log('📊 Learning Statistics:');
  console.log(`  Total Actions: ${stats.totalActions}`);
  console.log(`  Success Rate: ${(stats.successRate * 100).toFixed(1)}%`);
  console.log(`  Average Quality: ${(stats.avgQuality * 100).toFixed(1)}%`);
  console.log(`  Strategies Learned: ${stats.strategiesLearned}`);
  console.log(`  Knowledge Nodes: ${stats.knowledgeNodes}`);
  
  console.log('\n💡 AI Insights:');
  insights.forEach(insight => {
    console.log(`  - ${insight.insight} (confidence: ${(insight.confidence * 100).toFixed(0)}%)`);
  });
}

// ============================================================================
// EXAMPLE 5: Trigger AI Self-Optimization
// ============================================================================

async function triggerSelfOptimization() {
  console.log('🧬 Triggering AI self-optimization...');
  
  const response = await fetch('http://127.0.0.1:3001/api/ai/self-optimize', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': 'your-api-key'
    }
  });

  const result = await response.json();
  
  console.log(`✨ Applied ${result.appliedOptimizations} optimizations`);
  console.log('\n📝 Improvements:');
  result.improvements.forEach(imp => {
    console.log(`  [${imp.priority}] ${imp.area}: ${imp.recommendation}`);
  });
}

// ============================================================================
// EXAMPLE 6: Open in External Editor (GitHub Codespaces)
// ============================================================================

async function openInCodespaces() {
  const response = await fetch('http://127.0.0.1:3001/api/ai/open-external', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': 'your-api-key'
    },
    body: JSON.stringify({
      editor: 'codespaces',
      owner: 'your-github-username',
      repo: 'your-repo-name',
      filePath: 'src/app.js',
      lineNumber: 42
    })
  });

  const { url, sessionId, codespace } = await response.json();
  
  console.log('☁️ Opening in GitHub Codespaces...');
  console.log(`  URL: ${url}`);
  console.log(`  Session ID: ${sessionId}`);
  console.log(`  Codespace: ${codespace}`);
  
  // Open in browser
  window.open(url, '_blank');
}

// ============================================================================
// EXAMPLE 7: Sync Changes from External Editor
// ============================================================================

async function syncFromExternalEditor(sessionId) {
  const response = await fetch('http://127.0.0.1:3001/api/ai/sync-external', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': 'your-api-key'
    },
    body: JSON.stringify({ sessionId })
  });

  const result = await response.json();
  
  if (result.synced) {
    console.log('✅ Changes synced successfully');
    console.log(`  File: ${result.filePath}`);
    console.log(`  SHA: ${result.sha}`);
    console.log(`  Content length: ${result.content.length} chars`);
  } else {
    console.log('❌ Sync failed:', result.reason);
  }
}

// ============================================================================
// EXAMPLE 8: Complete Workflow - Edit, Improve, Commit
// ============================================================================

async function completeWorkflow() {
  const code = `
    function calculateTotal(items) {
      let total = 0;
      for (let i = 0; i < items.length; i++) {
        total += items[i].price;
      }
      return total;
    }
  `;

  // Step 1: Analyze
  console.log('🔍 Step 1: Analyzing code...');
  const analysisRes = await fetch('http://127.0.0.1:3001/api/ai/analyze-code', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': 'your-api-key' },
    body: JSON.stringify({ code, language: 'javascript', filePath: 'utils.js' })
  });
  const { analysis } = await analysisRes.json();
  console.log(`  Found ${analysis.improvements.length} improvements`);

  // Step 2: Improve
  console.log('\n✨ Step 2: Applying improvements...');
  const improveRes = await fetch('http://127.0.0.1:3001/api/ai/improve-code', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': 'your-api-key' },
    body: JSON.stringify({ code, language: 'javascript', improvements: analysis.improvements })
  });
  const { improved, changes } = await improveRes.json();
  console.log(`  Modified ${changes.modified} lines`);

  // Step 3: Commit to GitHub
  console.log('\n📤 Step 3: Committing to GitHub...');
  const commitRes = await fetch('http://127.0.0.1:3001/api/ai/commit-github', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': 'your-api-key' },
    body: JSON.stringify({
      owner: 'your-username',
      repo: 'your-repo',
      branch: 'ai-improvements',
      filePath: 'src/utils.js',
      content: improved,
      message: 'AI-suggested code improvements'
    })
  });
  const commitResult = await commitRes.json();
  console.log(`  ✅ Committed: ${commitResult.url}`);
  
  console.log('\n🎉 Complete workflow finished!');
}

// ============================================================================
// EXAMPLE 9: Real-time Learning in Editor
// ============================================================================

class IntelligentEditor {
  constructor() {
    this.currentActionId = null;
  }

  async onEdit(code, language) {
    // Record the edit action
    const response = await fetch('http://127.0.0.1:3001/api/ai/record-action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': 'your-api-key' },
      body: JSON.stringify({
        type: 'code_edit',
        context: { language },
        parameters: { autoFormat: true }
      })
    });

    const { actionId } = await response.json();
    this.currentActionId = actionId;
  }

  async onSave(success, quality) {
    if (!this.currentActionId) return;

    // Record the outcome
    await fetch('http://127.0.0.1:3001/api/ai/record-outcome', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': 'your-api-key' },
      body: JSON.stringify({
        actionId: this.currentActionId,
        outcome: { success, quality, errors: [] }
      })
    });

    this.currentActionId = null;
  }

  async getAISuggestions(code, language) {
    const response = await fetch('http://127.0.0.1:3001/api/ai/analyze-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': 'your-api-key' },
      body: JSON.stringify({ code, language })
    });

    const { analysis } = await response.json();
    return analysis.improvements;
  }
}

// Usage:
const editor = new IntelligentEditor();
// editor.onEdit(currentCode, 'javascript');
// ... user edits ...
// editor.onSave(true, 0.9);

// ============================================================================
// Run Examples (uncomment to test)
// ============================================================================

// analyzeMyCode();
// improveMyCode();
// trackAndLearn();
// checkLearningProgress();
// triggerSelfOptimization();
// openInCodespaces();
// completeWorkflow();

module.exports = {
  analyzeMyCode,
  improveMyCode,
  trackAndLearn,
  checkLearningProgress,
  triggerSelfOptimization,
  openInCodespaces,
  syncFromExternalEditor,
  completeWorkflow,
  IntelligentEditor
};
