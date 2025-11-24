/**
 * Self-Learning System - Comprehensive Test Suite
 * Tests reinforcement learning, pattern discovery, and optimization
 */

const selfLearning = require('../src/services/ai/selfLearning');
const fs = require('fs').promises;
const path = require('path');

describe('Self-Learning System', () => {
  const testDataPath = path.join(__dirname, '../data/learning_test');

  beforeAll(async () => {
    // Use test directory
    selfLearning.learningDataPath = testDataPath;
    await fs.mkdir(testDataPath, { recursive: true });
    await selfLearning.initialize();
  });

  afterAll(async () => {
    // Cleanup test data
    await fs.rm(testDataPath, { recursive: true, force: true });
  });

  beforeEach(() => {
    // Reset state
    selfLearning.actionHistory = [];
    selfLearning.performanceMetrics = new Map();
    selfLearning.optimizationStrategies = new Map();
    selfLearning.knowledgeGraph = new Map();
  });

  describe('Action Recording', () => {
    test('should record action with context', async () => {
      const actionId = await selfLearning.recordAction({
        type: 'code_edit',
        context: { language: 'javascript' },
        parameters: { autoFormat: true },
        metadata: { codeLength: 1500 }
      });

      expect(actionId).toBeDefined();
      expect(actionId).toMatch(/^action_\d+_[a-z0-9]+$/);
      expect(selfLearning.actionHistory).toHaveLength(1);
    });

    test('should store action details correctly', async () => {
      const actionId = await selfLearning.recordAction({
        type: 'code_analyze',
        context: { language: 'python', filePath: 'test.py' },
        parameters: { deepAnalysis: true }
      });

      const action = selfLearning.actionHistory.find(a => a.id === actionId);
      expect(action.type).toBe('code_analyze');
      expect(action.context.language).toBe('python');
      expect(action.parameters.deepAnalysis).toBe(true);
      expect(action.timestamp).toBeDefined();
    });
  });

  describe('Outcome Tracking', () => {
    test('should record successful outcome', async () => {
      const actionId = await selfLearning.recordAction({
        type: 'code_edit',
        context: { language: 'javascript' }
      });

      await selfLearning.recordOutcome(actionId, {
        success: true,
        executionTime: 150,
        quality: 0.85
      });

      const action = selfLearning.actionHistory.find(a => a.id === actionId);
      expect(action.outcome.success).toBe(true);
      expect(action.metrics).toBeDefined();
      expect(action.metrics.quality).toBe(0.85);
    });

    test('should record failed outcome', async () => {
      const actionId = await selfLearning.recordAction({
        type: 'code_compile',
        context: { language: 'typescript' }
      });

      await selfLearning.recordOutcome(actionId, {
        success: false,
        errors: ['Syntax error on line 42']
      });

      const action = selfLearning.actionHistory.find(a => a.id === actionId);
      expect(action.outcome.success).toBe(false);
      expect(action.metrics.errorRate).toBe(1);
    });
  });

  describe('Reinforcement Learning', () => {
    test('should update strategies based on outcomes', async () => {
      const context = { language: 'javascript', filePath: 'app.js' };

      // Record multiple actions with outcomes
      for (let i = 0; i < 5; i++) {
        const actionId = await selfLearning.recordAction({
          type: 'code_edit',
          context,
          parameters: { autoFormat: true }
        });

        await selfLearning.recordOutcome(actionId, {
          success: true,
          executionTime: 100 + i * 10,
          quality: 0.8 + i * 0.02
        });
      }

      const strategyKey = 'code_edit:javascript';
      expect(selfLearning.optimizationStrategies.has(strategyKey)).toBe(true);

      const strategy = selfLearning.optimizationStrategies.get(strategyKey);
      expect(strategy.successRate).toBeGreaterThan(0);
      expect(strategy.avgQuality).toBeCloseTo(0.84, 1);
    });

    test('should use exponential moving average', async () => {
      const context = { language: 'python' };

      // First action - low quality
      let actionId = await selfLearning.recordAction({
        type: 'code_analyze',
        context
      });
      await selfLearning.recordOutcome(actionId, {
        success: true,
        quality: 0.5
      });

      // Second action - high quality
      actionId = await selfLearning.recordAction({
        type: 'code_analyze',
        context
      });
      await selfLearning.recordOutcome(actionId, {
        success: true,
        quality: 0.9
      });

      const strategy = selfLearning.optimizationStrategies.get('code_analyze:python');
      // EMA should be between 0.5 and 0.9, closer to 0.9
      expect(strategy.avgQuality).toBeGreaterThan(0.5);
      expect(strategy.avgQuality).toBeLessThan(0.9);
    });
  });

  describe('Knowledge Graph', () => {
    test('should build knowledge graph from actions', async () => {
      const actionId1 = await selfLearning.recordAction({
        type: 'code_analyze',
        context: { language: 'javascript' }
      });

      const actionId2 = await selfLearning.recordAction({
        type: 'code_improve',
        context: { language: 'javascript' }
      });

      expect(selfLearning.knowledgeGraph.size).toBeGreaterThan(0);
    });

    test('should track relationships between actions', async () => {
      // Simulate sequence: analyze -> improve -> test
      await selfLearning.recordAction({ type: 'code_analyze', context: {} });
      await selfLearning.recordAction({ type: 'code_improve', context: {} });
      await selfLearning.recordAction({ type: 'code_test', context: {} });

      expect(selfLearning.knowledgeGraph.size).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Pattern Discovery', () => {
    test('should identify patterns in action history', async () => {
      // Create pattern: analyze followed by improve
      for (let i = 0; i < 5; i++) {
        await selfLearning.recordAction({ type: 'code_analyze', context: { language: 'js' } });
        await selfLearning.recordAction({ type: 'code_improve', context: { language: 'js' } });
      }

      const insights = await selfLearning.analyzePatterns();
      expect(insights).toBeDefined();
      expect(Array.isArray(insights)).toBe(true);
    });

    test('should generate insights from patterns', async () => {
      // Create high-quality pattern
      for (let i = 0; i < 10; i++) {
        const actionId = await selfLearning.recordAction({
          type: 'code_edit',
          context: { language: 'typescript' }
        });
        await selfLearning.recordOutcome(actionId, {
          success: true,
          quality: 0.9
        });
      }

      const insights = await selfLearning.analyzePatterns();
      expect(insights.length).toBeGreaterThan(0);
    });
  });

  describe('Self-Optimization', () => {
    test('should generate improvement recommendations', async () => {
      // Create learning data
      for (let i = 0; i < 10; i++) {
        const actionId = await selfLearning.recordAction({
          type: 'code_edit',
          context: { language: 'javascript' }
        });
        await selfLearning.recordOutcome(actionId, {
          success: i > 5,
          quality: i / 10
        });
      }

      const improvements = await selfLearning.generateImprovements();
      expect(Array.isArray(improvements)).toBe(true);
    });

    test('should apply optimizations', async () => {
      // Create baseline
      for (let i = 0; i < 5; i++) {
        const actionId = await selfLearning.recordAction({
          type: 'code_compile',
          context: { language: 'typescript' }
        });
        await selfLearning.recordOutcome(actionId, {
          success: true,
          quality: 0.7
        });
      }

      const result = await selfLearning.selfOptimize();
      expect(result).toHaveProperty('appliedOptimizations');
      expect(result).toHaveProperty('improvements');
    });
  });

  describe('Statistics', () => {
    test('should calculate correct statistics', async () => {
      // Record mixed outcomes
      for (let i = 0; i < 10; i++) {
        const actionId = await selfLearning.recordAction({
          type: 'code_edit',
          context: { language: 'javascript' }
        });
        await selfLearning.recordOutcome(actionId, {
          success: i % 2 === 0,
          quality: i / 10
        });
      }

      const stats = selfLearning.getStats();
      expect(stats.totalActions).toBe(10);
      expect(stats.successRate).toBe(0.5);
      expect(stats.avgQuality).toBeCloseTo(0.45, 1);
    });

    test('should track strategies learned', async () => {
      await selfLearning.recordAction({ type: 'edit', context: { language: 'js' } });
      await selfLearning.recordAction({ type: 'edit', context: { language: 'py' } });
      await selfLearning.recordAction({ type: 'analyze', context: { language: 'js' } });

      const stats = selfLearning.getStats();
      expect(stats.strategiesLearned).toBeGreaterThan(0);
    });
  });

  describe('Data Persistence', () => {
    test('should save learning data to disk', async () => {
      await selfLearning.recordAction({
        type: 'test_action',
        context: { test: true }
      });

      await selfLearning.saveLearningData();

      const historyPath = path.join(testDataPath, 'action_history.json');
      const exists = await fs.access(historyPath).then(() => true).catch(() => false);
      expect(exists).toBe(true);
    });

    test('should load learning data from disk', async () => {
      // Save data
      await selfLearning.recordAction({ type: 'test', context: {} });
      await selfLearning.saveLearningData();

      // Reset and reload
      selfLearning.actionHistory = [];
      await selfLearning.loadLearningData();

      expect(selfLearning.actionHistory.length).toBeGreaterThan(0);
    });

    test('should limit history size to prevent unbounded growth', async () => {
      // Create many actions
      for (let i = 0; i < 1500; i++) {
        await selfLearning.recordAction({ type: 'test', context: {} });
      }

      await selfLearning.saveLearningData();

      // Reload and check size
      selfLearning.actionHistory = [];
      await selfLearning.loadLearningData();

      expect(selfLearning.actionHistory.length).toBeLessThanOrEqual(1000);
    });
  });

  describe('Performance', () => {
    test('should handle large action history efficiently', async () => {
      const startTime = Date.now();

      for (let i = 0; i < 100; i++) {
        const actionId = await selfLearning.recordAction({
          type: 'code_edit',
          context: { language: 'javascript' }
        });
        await selfLearning.recordOutcome(actionId, {
          success: true,
          quality: 0.8
        });
      }

      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(5000); // Should complete in under 5 seconds
    });

    test('should calculate stats quickly', () => {
      // Add some data
      for (let i = 0; i < 50; i++) {
        selfLearning.actionHistory.push({
          id: `action_${i}`,
          type: 'test',
          metrics: { success: true, quality: 0.8 }
        });
      }

      const startTime = Date.now();
      const stats = selfLearning.getStats();
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(100); // Should be nearly instant
      expect(stats).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    test('should handle missing outcome gracefully', async () => {
      const actionId = await selfLearning.recordAction({
        type: 'code_edit',
        context: {}
      });

      await selfLearning.recordOutcome('nonexistent_id', {
        success: true
      });

      // Should not throw
      const stats = selfLearning.getStats();
      expect(stats).toBeDefined();
    });

    test('should handle empty context', async () => {
      const actionId = await selfLearning.recordAction({
        type: 'test',
        context: {}
      });

      expect(actionId).toBeDefined();
    });

    test('should handle invalid quality scores', async () => {
      const actionId = await selfLearning.recordAction({
        type: 'test',
        context: {}
      });

      await selfLearning.recordOutcome(actionId, {
        success: true,
        quality: 1.5 // Invalid: > 1
      });

      const action = selfLearning.actionHistory.find(a => a.id === actionId);
      expect(action.metrics.quality).toBeLessThanOrEqual(1);
    });
  });
});
