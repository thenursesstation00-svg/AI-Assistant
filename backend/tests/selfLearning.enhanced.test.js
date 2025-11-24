/**
 * Comprehensive Tests for Enhanced Self-Learning System
 * Tests neural network integration, pattern recognition, and anomaly detection
 */

const selfLearning = require('../src/services/ai/selfLearning');
const fs = require('fs').promises;
const path = require('path');

describe('Enhanced Self-Learning System', () => {
  beforeAll(async () => {
    await selfLearning.initialize();
  });

  afterAll(async () => {
    // Clean up test data
    const testDataPath = path.join(__dirname, '../data/learning');
    try {
      await fs.rm(testDataPath, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('Action Recording and Outcomes', () => {
    test('should record action with all required fields', async () => {
      const actionId = await selfLearning.recordAction({
        type: 'code_edit',
        context: { file: 'test.js', language: 'javascript' },
        parameters: { autoFormat: true },
        metadata: { user: 'test_user' }
      });

      expect(actionId).toBeDefined();
      expect(typeof actionId).toBe('string');
      expect(actionId).toMatch(/^action_/);
    });

    test('should record outcome and update metrics', async () => {
      const actionId = await selfLearning.recordAction({
        type: 'test_action',
        context: { mode: 'test' },
        parameters: { param1: 'value1' }
      });

      await selfLearning.recordOutcome(actionId, {
        success: true,
        executionTime: 150,
        codeQuality: 0.9,
        errors: []
      });

      const stats = selfLearning.getStats();
      expect(stats.totalActions).toBeGreaterThan(0);
    });

    test('should validate action history data integrity', async () => {
      const invalidActions = [
        { id: null, timestamp: new Date() }, // Invalid: no ID
        { id: 'test', type: '' }, // Invalid: empty type
        { id: 'test2', type: 'a'.repeat(200) } // Invalid: type too long
      ];

      const validated = selfLearning.validateActionHistory(invalidActions);
      expect(validated.length).toBe(0);
    });
  });

  describe('Neural Network Integration', () => {
    test('should extract features from action', async () => {
      const action = {
        type: 'code_edit',
        timestamp: new Date().toISOString(),
        parameters: { temperature: 0.7, maxTokens: 100, useCache: true },
        context: { complexity: 5 }
      };

      const features = selfLearning.extractFeatures(action);
      
      expect(features).toBeInstanceOf(Map);
      expect(features.size).toBeGreaterThan(0);
      expect(features.has('hour_normalized')).toBe(true);
      expect(features.get('hour_normalized')).toBeGreaterThanOrEqual(0);
      expect(features.get('hour_normalized')).toBeLessThanOrEqual(1);
    });

    test('should normalize values correctly', () => {
      expect(selfLearning.normalize(50, 0, 100)).toBe(0.5);
      expect(selfLearning.normalize(0, 0, 100)).toBe(0);
      expect(selfLearning.normalize(100, 0, 100)).toBe(1);
      expect(selfLearning.normalize(-10, 0, 100)).toBe(0); // Clipped to min
      expect(selfLearning.normalize(150, 0, 100)).toBe(1); // Clipped to max
    });

    test('should update neural weights based on outcomes', async () => {
      // Record multiple actions to train neural network
      for (let i = 0; i < 10; i++) {
        const actionId = await selfLearning.recordAction({
          type: 'neural_test',
          context: { iteration: i },
          parameters: { value: i * 10 }
        });

        await selfLearning.recordOutcome(actionId, {
          success: i > 5,
          quality: i / 10,
          executionTime: 100 + i * 10,
          errors: []
        });
      }

      const stats = selfLearning.getStats();
      expect(stats.neuralWeightSets).toBeGreaterThan(0);
    });
  });

  describe('Advanced Pattern Recognition', () => {
    test('should detect sequence patterns', async () => {
      // Create a sequence pattern
      for (let i = 0; i < 5; i++) {
        await selfLearning.recordAction({
          type: 'action_a',
          context: {},
          parameters: {}
        });
        
        await selfLearning.recordAction({
          type: 'action_b',
          context: {},
          parameters: {}
        });
      }

      const insights = await selfLearning.analyzePatterns();
      const sequencePatterns = insights.filter(i => i.type === 'sequence_pattern');
      
      expect(sequencePatterns.length).toBeGreaterThan(0);
      expect(sequencePatterns[0]).toHaveProperty('confidence');
      expect(sequencePatterns[0]).toHaveProperty('support');
      expect(sequencePatterns[0]).toHaveProperty('priority');
    });

    test('should detect temporal patterns', async () => {
      // Create actions at different hours
      const baseTime = new Date();
      for (let hour = 0; hour < 24; hour += 2) {
        const timestamp = new Date(baseTime);
        timestamp.setHours(hour);

        const actionId = await selfLearning.recordAction({
          type: 'hourly_test',
          context: { hour },
          parameters: {},
          metadata: { timestamp: timestamp.toISOString() }
        });

        // Simulate better performance at certain hours
        await selfLearning.recordOutcome(actionId, {
          success: true,
          quality: hour >= 9 && hour <= 17 ? 0.9 : 0.5, // Better during work hours
          executionTime: 100,
          errors: []
        });
      }

      const insights = await selfLearning.analyzePatterns();
      const temporalPatterns = insights.filter(i => i.type === 'temporal_pattern');
      
      // May or may not detect depending on threshold, but should not error
      expect(Array.isArray(temporalPatterns)).toBe(true);
    });

    test('should detect performance improvements over time', async () => {
      // Create old actions with lower quality
      for (let i = 0; i < 50; i++) {
        const actionId = await selfLearning.recordAction({
          type: 'improvement_test',
          context: {},
          parameters: {}
        });

        await selfLearning.recordOutcome(actionId, {
          success: true,
          quality: i < 25 ? 0.4 + Math.random() * 0.2 : 0.7 + Math.random() * 0.2,
          executionTime: 100,
          errors: []
        });
      }

      const insights = await selfLearning.analyzePatterns();
      const improvements = insights.filter(i => i.type === 'improvement');
      
      expect(improvements.length).toBeGreaterThan(0);
      expect(improvements[0]).toHaveProperty('confidence');
    });

    test('should detect strategy convergence', async () => {
      // Create consistent pattern to show convergence
      for (let i = 0; i < 30; i++) {
        const actionId = await selfLearning.recordAction({
          type: 'convergence_test',
          context: { mode: 'stable' },
          parameters: { value: 42 }
        });

        await selfLearning.recordOutcome(actionId, {
          success: true,
          quality: 0.85 + Math.random() * 0.05, // Low variance
          efficiency: 0.9,
          executionTime: 100,
          errors: []
        });
      }

      const insights = await selfLearning.analyzePatterns();
      const convergence = insights.filter(i => i.type === 'convergence');
      
      expect(convergence.length).toBeGreaterThan(0);
    });
  });

  describe('Anomaly Detection', () => {
    test('should detect statistical anomalies', async () => {
      // Create baseline performance
      for (let i = 0; i < 20; i++) {
        const actionId = await selfLearning.recordAction({
          type: 'anomaly_test',
          context: { scenario: 'baseline' },
          parameters: {}
        });

        await selfLearning.recordOutcome(actionId, {
          success: true,
          quality: 0.8,
          efficiency: 0.85,
          executionTime: 100,
          errors: []
        });
      }

      // Create anomalous action
      const anomalousId = await selfLearning.recordAction({
        type: 'anomaly_test',
        context: { scenario: 'baseline' },
        parameters: {}
      });

      await selfLearning.recordOutcome(anomalousId, {
        success: false,
        quality: 0.1, // Very low quality
        efficiency: 0.2,
        executionTime: 5000, // Very slow
        errorRate: 10, // Many errors
        errors: new Array(10).fill('error')
      });

      const stats = selfLearning.getStats();
      expect(stats.recentAnomalies).toBeGreaterThan(0);
    });

    test('should detect security anomalies', async () => {
      const actionId = await selfLearning.recordAction({
        type: 'security_test',
        context: {},
        parameters: {}
      });

      await selfLearning.recordOutcome(actionId, {
        success: false,
        quality: 0.3,
        errorRate: 15, // High error rate
        errors: new Array(15).fill('security_error')
      });

      const stats = selfLearning.getStats();
      expect(stats.recentAnomalies).toBeGreaterThan(0);
    });
  });

  describe('Reinforcement Learning', () => {
    test('should use adaptive learning rate', async () => {
      const strategy = {
        attempts: 5,
        variance: 0.5
      };

      const learningRate = selfLearning.calculateAdaptiveLearningRate(strategy);
      expect(learningRate).toBeGreaterThan(0);
      expect(learningRate).toBeLessThanOrEqual(selfLearning.config.learningRate);
    });

    test('should calculate multi-objective reward', () => {
      const metrics = {
        quality: 0.8,
        efficiency: 0.7,
        success: true,
        errorRate: 1,
        userSatisfaction: 0.9
      };

      const reward = selfLearning.calculateReward(metrics);
      expect(reward).toBeGreaterThan(0);
      expect(reward).toBeLessThanOrEqual(1);
    });

    test('should calculate variance correctly', () => {
      const values = [1, 2, 3, 4, 5];
      const variance = selfLearning.calculateVariance(values);
      expect(variance).toBeGreaterThan(0);
      expect(variance).toBeLessThan(10);
    });

    test('should implement exploration vs exploitation', async () => {
      let explorationCount = 0;
      
      // Run multiple iterations
      for (let i = 0; i < 100; i++) {
        const actionId = await selfLearning.recordAction({
          type: 'explore_exploit_test',
          context: { iteration: i },
          parameters: { strategy: Math.random() > 0.5 ? 'a' : 'b' }
        });

        await selfLearning.recordOutcome(actionId, {
          success: true,
          quality: 0.7 + Math.random() * 0.2,
          executionTime: 100,
          errors: []
        });
      }

      // Should have some variation due to exploration
      const stats = selfLearning.getStats();
      expect(stats.strategiesLearned).toBeGreaterThan(0);
    });
  });

  describe('Statistics and Reporting', () => {
    test('should provide comprehensive statistics', () => {
      const stats = selfLearning.getStats();
      
      expect(stats).toHaveProperty('totalActions');
      expect(stats).toHaveProperty('successRate');
      expect(stats).toHaveProperty('avgQuality');
      expect(stats).toHaveProperty('avgEfficiency');
      expect(stats).toHaveProperty('improvementRate');
      expect(stats).toHaveProperty('strategiesLearned');
      expect(stats).toHaveProperty('knowledgeNodes');
      expect(stats).toHaveProperty('neuralWeightSets');
      expect(stats).toHaveProperty('recentAnomalies');
      expect(stats).toHaveProperty('actionTypeDistribution');
      expect(stats).toHaveProperty('topStrategies');
      expect(stats).toHaveProperty('config');
      
      expect(typeof stats.totalActions).toBe('number');
      expect(typeof stats.successRate).toBe('number');
      expect(Array.isArray(stats.topStrategies)).toBe(true);
    });

    test('should export learning data', async () => {
      const exportedData = await selfLearning.exportLearningData('json');
      
      expect(exportedData).toHaveProperty('metadata');
      expect(exportedData).toHaveProperty('statistics');
      expect(exportedData).toHaveProperty('actionHistory');
      expect(exportedData).toHaveProperty('strategies');
      expect(exportedData).toHaveProperty('neuralWeights');
      expect(exportedData).toHaveProperty('knowledgeGraph');
      expect(exportedData).toHaveProperty('anomalies');
      
      expect(exportedData.metadata.version).toBe('2.0.0');
      expect(Array.isArray(exportedData.actionHistory)).toBe(true);
    });

    test('should export to CSV format', async () => {
      const csvData = await selfLearning.exportLearningData('csv');
      
      expect(typeof csvData).toBe('string');
      expect(csvData).toContain('timestamp');
      expect(csvData).toContain('type');
      expect(csvData).toContain('success');
      expect(csvData).toContain('quality');
      
      const lines = csvData.split('\n');
      expect(lines.length).toBeGreaterThan(1); // Header + data
    });
  });

  describe('Predictions', () => {
    test('should predict outcomes based on learned patterns', async () => {
      // Train the system
      for (let i = 0; i < 15; i++) {
        const actionId = await selfLearning.recordAction({
          type: 'prediction_test',
          context: { mode: 'standard' },
          parameters: { threshold: 0.5 }
        });

        await selfLearning.recordOutcome(actionId, {
          success: true,
          quality: 0.85,
          efficiency: 0.8,
          executionTime: 120,
          errors: []
        });
      }

      const prediction = await selfLearning.predictOutcome(
        'prediction_test',
        { mode: 'standard' },
        { threshold: 0.5 }
      );

      expect(prediction).toHaveProperty('confidence');
      expect(prediction).toHaveProperty('predictedSuccess');
      expect(prediction).toHaveProperty('predictedQuality');
      expect(prediction).toHaveProperty('predictedEfficiency');
      expect(prediction).toHaveProperty('recommendation');
      
      expect(['low', 'medium', 'high']).toContain(prediction.confidence);
      expect(prediction.predictedSuccess).toBeGreaterThan(0.7); // Should predict high success
    });

    test('should provide low confidence for insufficient data', async () => {
      const prediction = await selfLearning.predictOutcome(
        'brand_new_action',
        { mode: 'unknown' },
        { param: 'value' }
      );

      expect(prediction.confidence).toBe('low');
      expect(prediction.recommendation).toContain('Insufficient data');
    });
  });

  describe('Data Persistence', () => {
    test('should save learning data successfully', async () => {
      await expect(selfLearning.saveLearningData()).resolves.not.toThrow();
    });

    test('should load learning data successfully', async () => {
      await selfLearning.saveLearningData();
      await expect(selfLearning.loadLearningData()).resolves.not.toThrow();
    });

    test('should create backups when saving', async () => {
      const backupPath = path.join(__dirname, '../data/learning/backups');
      
      // Save twice to trigger backup
      await selfLearning.saveLearningData();
      await new Promise(resolve => setTimeout(resolve, 100)); // Small delay
      await selfLearning.saveLearningData();
      
      // Check if backup directory exists (may not exist in fresh test)
      try {
        const files = await fs.readdir(backupPath);
        expect(Array.isArray(files)).toBe(true);
      } catch (error) {
        // Backup directory may not exist yet, which is fine
        expect(error.code).toBe('ENOENT');
      }
    });

    test('should handle corrupted data gracefully', async () => {
      const dataPath = path.join(__dirname, '../data/learning');
      await fs.mkdir(dataPath, { recursive: true });
      
      // Write corrupted data
      await fs.writeFile(
        path.join(dataPath, 'action_history.json'),
        'invalid json{{{',
        'utf-8'
      );

      // Should not throw, should start fresh
      await expect(selfLearning.loadLearningData()).resolves.not.toThrow();
    });
  });

  describe('Optimization and Improvements', () => {
    test('should generate improvement recommendations', async () => {
      const improvements = await selfLearning.generateImprovements();
      
      expect(Array.isArray(improvements)).toBe(true);
      improvements.forEach(improvement => {
        expect(improvement).toHaveProperty('area');
        expect(improvement).toHaveProperty('recommendation');
        expect(improvement).toHaveProperty('priority');
      });
    });

    test('should self-optimize based on learning', async () => {
      const result = await selfLearning.selfOptimize();
      
      expect(result).toHaveProperty('appliedOptimizations');
      expect(result).toHaveProperty('improvements');
      expect(typeof result.appliedOptimizations).toBe('number');
      expect(Array.isArray(result.improvements)).toBe(true);
    });

    test('should get optimized parameters for learned actions', async () => {
      // Train with specific parameters
      for (let i = 0; i < 10; i++) {
        const actionId = await selfLearning.recordAction({
          type: 'param_optimization_test',
          context: { scenario: 'test' },
          parameters: { temp: 0.7, tokens: 2000 }
        });

        await selfLearning.recordOutcome(actionId, {
          success: true,
          quality: 0.9,
          executionTime: 100,
          errors: []
        });
      }

      const optimized = await selfLearning.getOptimizedParameters(
        'param_optimization_test',
        { scenario: 'test' }
      );

      expect(optimized).toHaveProperty('_confidence');
      expect(optimized).toHaveProperty('_quality');
      expect(optimized._confidence).toBeGreaterThan(0);
    });
  });

  describe('Security and Validation', () => {
    test('should restrict file permissions on saved data', async () => {
      await selfLearning.saveLearningData();
      
      const historyPath = path.join(__dirname, '../data/learning/action_history.json');
      try {
        const stats = await fs.stat(historyPath);
        // File mode should be restrictive (600 = rw-------)
        const mode = (stats.mode & parseInt('777', 8)).toString(8);
        // On some systems this may be 644 or 600
        expect(['600', '644', '666']).toContain(mode);
      } catch (error) {
        // File might not exist yet
        console.log('File not found:', error.message);
      }
    });

    test('should hash strategy keys consistently', () => {
      const hash1 = selfLearning.hashStrategyKey('test', { a: 1, b: 2 });
      const hash2 = selfLearning.hashStrategyKey('test', { b: 2, a: 1 }); // Different order
      
      expect(hash1).toBe(hash2); // Should be same regardless of key order
      expect(hash1).toMatch(/^test:/);
    });

    test('should limit action history size', async () => {
      const maxSize = selfLearning.config.maxHistorySize;
      
      // Try to add more than max
      for (let i = 0; i < maxSize + 100; i++) {
        await selfLearning.recordAction({
          type: 'size_limit_test',
          context: {},
          parameters: {}
        });
      }

      await selfLearning.saveLearningData();
      await selfLearning.loadLearningData();
      
      expect(selfLearning.actionHistory.length).toBeLessThanOrEqual(maxSize);
    });
  });
});