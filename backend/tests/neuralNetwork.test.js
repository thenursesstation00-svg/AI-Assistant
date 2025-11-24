/**
 * Neural Network System Tests
 */

const neuralNetwork = require('../src/services/ai/neuralNetwork');

describe('Neural Network System', () => {
  beforeAll(async () => {
    await neuralNetwork.initialize();
  });

  describe('Code Embeddings', () => {
    test('should generate embeddings for JavaScript code', async () => {
      const code = `
        function hello(name) {
          return "Hello, " + name;
        }
      `;

      const embedding = await neuralNetwork.getCodeEmbedding(code, 'javascript');

      expect(embedding).toBeDefined();
      expect(Array.isArray(embedding)).toBe(true);
      expect(embedding.length).toBeGreaterThan(0);
    });

    test('should cache embeddings for identical code', async () => {
      const code = 'const x = 42;';

      const embedding1 = await neuralNetwork.getCodeEmbedding(code);
      const embedding2 = await neuralNetwork.getCodeEmbedding(code);

      expect(embedding1).toEqual(embedding2);
    });

    test('should handle different languages', async () => {
      const jsCode = 'const x = 1;';
      const pyCode = 'x = 1';

      const jsEmbedding = await neuralNetwork.getCodeEmbedding(jsCode, 'javascript');
      const pyEmbedding = await neuralNetwork.getCodeEmbedding(pyCode, 'python');

      expect(jsEmbedding).toBeDefined();
      expect(pyEmbedding).toBeDefined();
    });
  });

  describe('Quality Prediction', () => {
    test('should predict quality for good code', async () => {
      const code = `
        /**
         * Calculate sum of two numbers
         */
        function sum(a, b) {
          try {
            if (typeof a !== 'number' || typeof b !== 'number') {
              throw new Error('Invalid input');
            }
            return a + b;
          } catch (error) {
            console.error(error);
            return null;
          }
        }
      `;

      const result = await neuralNetwork.predictQuality(code, { language: 'javascript' });

      expect(result.quality).toBeDefined();
      expect(result.quality).toBeGreaterThan(0.5);
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.factors).toHaveProperty('documentation');
      expect(result.factors).toHaveProperty('errorHandling');
    });

    test('should predict lower quality for bad code', async () => {
      const code = 'function x(a,b){return a+b}';

      const result = await neuralNetwork.predictQuality(code);

      expect(result.quality).toBeDefined();
      expect(result.quality).toBeLessThan(0.8);
    });

    test('should consider complexity in quality score', async () => {
      const simpleCode = 'const x = 1;';
      const complexCode = `
        if (a) { if (b) { if (c) { if (d) { if (e) { return true; } } } } }
      `;

      const simpleResult = await neuralNetwork.predictQuality(simpleCode);
      const complexResult = await neuralNetwork.predictQuality(complexCode);

      expect(simpleResult.quality).toBeGreaterThan(complexResult.quality);
    });
  });

  describe('Code Completion', () => {
    test('should generate completions', async () => {
      const prefix = 'function calculate';

      const result = await neuralNetwork.generateCompletion(prefix, {
        language: 'javascript',
        maxTokens: 30
      });

      expect(result.completions).toBeDefined();
      expect(Array.isArray(result.completions)).toBe(true);
      expect(result.confidence).toBeDefined();
    });

    test('should rank completions by quality', async () => {
      const prefix = 'const user = ';

      const result = await neuralNetwork.generateCompletion(prefix);

      if (result.completions.length > 1) {
        expect(result.completions[0].score).toBeGreaterThanOrEqual(
          result.completions[1].score
        );
      }
    });
  });

  describe('Transfer Learning', () => {
    test('should process codebase samples', async () => {
      const codebaseData = {
        samples: [
          { code: 'function test() {}', language: 'javascript' },
          { code: 'class User {}', language: 'javascript' },
          { code: 'const data = [];', language: 'javascript' }
        ]
      };

      const result = await neuralNetwork.transferLearning(codebaseData);

      expect(result.success).toBe(true);
      expect(result.samplesProcessed).toBe(3);
      expect(result.patternsLearned).toBeGreaterThan(0);
    });

    test('should handle empty samples', async () => {
      const codebaseData = { samples: [] };

      const result = await neuralNetwork.transferLearning(codebaseData);

      expect(result.success).toBe(true);
      expect(result.samplesProcessed).toBe(0);
    });
  });

  describe('Code Similarity', () => {
    test('should detect identical code', async () => {
      const code1 = 'function test() { return 42; }';
      const code2 = 'function test() { return 42; }';

      const result = await neuralNetwork.calculateSimilarity(code1, code2);

      expect(result.similarity).toBeGreaterThan(0.9);
      expect(result.category).toBe('identical');
    });

    test('should detect similar code', async () => {
      const code1 = 'function add(a, b) { return a + b; }';
      const code2 = 'function sum(x, y) { return x + y; }';

      const result = await neuralNetwork.calculateSimilarity(code1, code2);

      expect(result.similarity).toBeGreaterThan(0.5);
    });

    test('should detect different code', async () => {
      const code1 = 'function hello() { console.log("hi"); }';
      const code2 = 'const data = [1, 2, 3, 4, 5];';

      const result = await neuralNetwork.calculateSimilarity(code1, code2);

      expect(result.similarity).toBeLessThan(0.5);
      expect(result.category).toMatch(/different|somewhat_similar/);
    });
  });

  describe('Statistics', () => {
    test('should track neural network stats', async () => {
      const stats = neuralNetwork.getStats();

      expect(stats).toHaveProperty('totalPredictions');
      expect(stats).toHaveProperty('cacheSize');
      expect(stats).toHaveProperty('modelsAvailable');
      expect(stats.modelsAvailable).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid code gracefully', async () => {
      const result = await neuralNetwork.predictQuality('');

      expect(result).toBeDefined();
      expect(result.quality).toBeDefined();
    });

    test('should handle missing parameters', async () => {
      const embedding = await neuralNetwork.getCodeEmbedding('test');

      expect(embedding).toBeDefined();
    });
  });
});
