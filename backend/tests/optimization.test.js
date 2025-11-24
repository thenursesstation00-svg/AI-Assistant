/**
 * Optimization System Tests
 */

const optimization = require('../src/services/ai/optimization');

describe('Optimization System', () => {
  beforeAll(async () => {
    await optimization.initialize();
    optimization.clearCache(); // Start fresh
  });

  afterEach(() => {
    optimization.clearCache();
  });

  describe('Caching System', () => {
    test('should cache and retrieve values', async () => {
      const key = 'test-key';
      const value = { data: 'test data' };

      optimization.set(key, value);
      const retrieved = optimization.get(key);

      expect(retrieved).toEqual(value);
    });

    test('should cache with async fetcher', async () => {
      const key = 'async-test';
      const fetcher = async () => {
        return { result: 'fetched data' };
      };

      const result = await optimization.cache(key, fetcher);

      expect(result).toEqual({ result: 'fetched data' });
    });

    test('should use cached value on subsequent calls', async () => {
      const key = 'fetch-once';
      let callCount = 0;

      const fetcher = async () => {
        callCount++;
        return { count: callCount };
      };

      const result1 = await optimization.cache(key, fetcher);
      const result2 = await optimization.cache(key, fetcher);

      expect(callCount).toBe(1);
      expect(result1).toEqual(result2);
    });

    test('should respect TTL expiration', async () => {
      const key = 'ttl-test';
      const shortTTL = 100; // 100ms

      optimization.set(key, 'original', { ttl: shortTTL });

      const immediate = optimization.get(key);
      expect(immediate).toBe('original');

      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 150));

      const expired = optimization.get(key);
      expect(expired).toBeNull();
    });

    test('should invalidate cache by tag', () => {
      optimization.set('key1', 'value1', { tags: ['user'] });
      optimization.set('key2', 'value2', { tags: ['user'] });
      optimization.set('key3', 'value3', { tags: ['post'] });

      const count = optimization.invalidateTag('user');

      expect(count).toBe(2);
      expect(optimization.get('key1')).toBeNull();
      expect(optimization.get('key2')).toBeNull();
      expect(optimization.get('key3')).toBe('value3');
    });

    test('should evict LRU when cache is full', () => {
      // Set small cache size for testing
      const originalSize = optimization.config.maxCacheSize;
      optimization.config.maxCacheSize = 3;

      optimization.set('key1', 'value1');
      optimization.set('key2', 'value2');
      optimization.set('key3', 'value3');

      // Access key1 and key2 to make them more recent
      optimization.get('key1');
      optimization.get('key2');

      // Add new key, should evict key3 (least recently used)
      optimization.set('key4', 'value4');

      expect(optimization.get('key1')).toBe('value1');
      expect(optimization.get('key2')).toBe('value2');
      expect(optimization.get('key3')).toBeNull();
      expect(optimization.get('key4')).toBe('value4');

      // Restore original size
      optimization.config.maxCacheSize = originalSize;
    });

    test('should track cache statistics', () => {
      optimization.set('test', 'value');
      
      optimization.get('test'); // Hit
      optimization.get('missing'); // Miss

      const stats = optimization.getStats();

      expect(stats.cache.hits).toBeGreaterThan(0);
      expect(stats.cache.misses).toBeGreaterThan(0);
      expect(stats.cache.hitRate).toBeDefined();
    });
  });

  describe('Performance Tracking', () => {
    test('should track performance metrics', () => {
      optimization.trackPerformance('test_operation', 150, { success: true });

      const stats = optimization.getPerformanceStats('test_operation');

      expect(stats.count).toBe(1);
      expect(stats.avg).toBe(150);
      expect(stats.min).toBe(150);
      expect(stats.max).toBe(150);
    });

    test('should measure async function performance', async () => {
      const testFn = async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
        return 'result';
      };

      const result = await optimization.measure('async_test', testFn);

      expect(result).toBe('result');

      const stats = optimization.getPerformanceStats('async_test');
      expect(stats.count).toBe(1);
      expect(stats.avg).toBeGreaterThan(40); // Should be ~50ms
    });

    test('should calculate percentiles correctly', () => {
      for (let i = 1; i <= 100; i++) {
        optimization.trackPerformance('percentile_test', i);
      }

      const stats = optimization.getPerformanceStats('percentile_test');

      expect(stats.min).toBe(1);
      expect(stats.max).toBe(100);
      expect(stats.p50).toBeGreaterThan(40);
      expect(stats.p50).toBeLessThan(60);
      expect(stats.p95).toBeGreaterThan(90);
    });

    test('should track errors in performance', async () => {
      const errorFn = async () => {
        throw new Error('Test error');
      };

      await expect(
        optimization.measure('error_test', errorFn)
      ).rejects.toThrow('Test error');

      const stats = optimization.getPerformanceStats('error_test');
      expect(stats.count).toBe(1);
    });
  });

  describe('Memory Management', () => {
    test('should get memory usage', () => {
      const usage = optimization.getMemoryUsage();

      expect(usage).toHaveProperty('heapUsed');
      expect(usage).toHaveProperty('heapTotal');
      expect(usage).toHaveProperty('heapUsedMB');
      expect(usage).toHaveProperty('percentUsed');
      expect(parseFloat(usage.percentUsed)).toBeGreaterThan(0);
    });

    test('should track memory snapshots', async () => {
      const statsBefore = optimization.memorySnapshots.length;

      // Trigger memory monitoring (normally runs on interval)
      const usage = optimization.getMemoryUsage();
      optimization.memorySnapshots.push({
        ...usage,
        timestamp: new Date().toISOString()
      });

      const statsAfter = optimization.memorySnapshots.length;

      expect(statsAfter).toBeGreaterThan(statsBefore);
    });

    test('should perform aggressive cleanup', () => {
      // Add some old cache entries
      optimization.set('old1', 'value', { ttl: 100 });
      optimization.set('old2', 'value', { ttl: 100 });

      optimization.aggressiveCleanup();

      const stats = optimization.getStats();
      expect(stats.cache.size).toBeLessThanOrEqual(optimization.config.maxCacheSize);
    });
  });

  describe('Query Optimization', () => {
    test('should suggest indexes for WHERE clauses', () => {
      const query = 'SELECT * FROM users WHERE age > 18';
      const result = optimization.optimizeQuery(query);

      expect(result.suggestions).toBeDefined();
      expect(result.suggestions.some(s => s.includes('index'))).toBe(true);
      expect(result.suggestions.some(s => s.includes('SELECT *'))).toBe(true);
    });

    test('should suggest indexes for JOIN operations', () => {
      const query = 'SELECT u.name FROM users u JOIN posts p ON u.id = p.user_id';
      const result = optimization.optimizeQuery(query);

      expect(result.suggestions.some(s => s.includes('JOIN'))).toBe(true);
    });

    test('should suggest indexes for ORDER BY', () => {
      const query = 'SELECT name FROM users ORDER BY created_at';
      const result = optimization.optimizeQuery(query);

      expect(result.suggestions.some(s => s.includes('ORDER BY'))).toBe(true);
    });

    test('should have no suggestions for optimal query', () => {
      const query = 'SELECT id, name FROM users WHERE id = 1';
      const result = optimization.optimizeQuery(query);

      expect(result.estimatedImprovement).toBe('none');
    });
  });

  describe('Batch Processing', () => {
    test('should process items in batches', async () => {
      const items = Array.from({ length: 250 }, (_, i) => i);
      const processor = async (item) => item * 2;

      const results = await optimization.batchProcess(items, processor, {
        batchSize: 50,
        concurrency: 3
      });

      expect(results.length).toBe(250);
      expect(results[0]).toBe(0);
      expect(results[249]).toBe(498);
    });

    test('should report progress', async () => {
      const items = Array.from({ length: 100 }, (_, i) => i);
      const processor = async (item) => item;
      const progressUpdates = [];

      await optimization.batchProcess(items, processor, {
        batchSize: 25,
        onProgress: (progress) => {
          progressUpdates.push(progress);
        }
      });

      expect(progressUpdates.length).toBeGreaterThan(0);
      expect(progressUpdates[progressUpdates.length - 1].processed).toBe(100);
    });
  });

  describe('Utility Functions', () => {
    test('should debounce function calls', (done) => {
      let callCount = 0;
      const fn = () => { callCount++; };
      const debounced = optimization.debounce(fn, 100);

      debounced();
      debounced();
      debounced();

      setTimeout(() => {
        expect(callCount).toBe(1);
        done();
      }, 150);
    });

    test('should throttle function calls', (done) => {
      let callCount = 0;
      const fn = () => { callCount++; };
      const throttled = optimization.throttle(fn, 100);

      throttled();
      throttled();
      throttled();

      expect(callCount).toBe(1);

      setTimeout(() => {
        throttled();
        expect(callCount).toBe(2);
        done();
      }, 150);
    });

    test('should memoize function results', () => {
      let callCount = 0;
      const expensiveFn = (a, b) => {
        callCount++;
        return a + b;
      };

      const memoized = optimization.memoize(expensiveFn);

      const result1 = memoized(2, 3);
      const result2 = memoized(2, 3);
      const result3 = memoized(4, 5);

      expect(result1).toBe(5);
      expect(result2).toBe(5);
      expect(result3).toBe(9);
      expect(callCount).toBe(2); // Called twice, not three times
    });
  });

  describe('Reporting', () => {
    test('should generate optimization report', async () => {
      // Add some data
      optimization.set('test', 'value');
      optimization.trackPerformance('test_op', 100);

      const report = await optimization.generateReport();

      expect(report).toHaveProperty('timestamp');
      expect(report).toHaveProperty('summary');
      expect(report).toHaveProperty('recommendations');
      expect(report).toHaveProperty('detailedStats');
      expect(report.summary).toHaveProperty('cacheEfficiency');
      expect(report.summary).toHaveProperty('memoryUsage');
    });

    test('should generate recommendations', () => {
      const stats = optimization.getStats();
      const perfStats = optimization.getPerformanceStats();
      const recommendations = optimization.generateRecommendations(stats, perfStats);

      expect(Array.isArray(recommendations)).toBe(true);
      recommendations.forEach(rec => {
        expect(rec).toHaveProperty('type');
        expect(rec).toHaveProperty('priority');
        expect(rec).toHaveProperty('message');
        expect(rec).toHaveProperty('action');
      });
    });
  });

  describe('Statistics', () => {
    test('should provide comprehensive stats', () => {
      optimization.set('test1', 'value1');
      optimization.set('test2', 'value2');
      optimization.get('test1');

      const stats = optimization.getStats();

      expect(stats).toHaveProperty('cache');
      expect(stats).toHaveProperty('memory');
      expect(stats).toHaveProperty('performance');

      expect(stats.cache).toHaveProperty('size');
      expect(stats.cache).toHaveProperty('hitRate');
      expect(stats.memory).toHaveProperty('current');
      expect(stats.performance).toHaveProperty('totalMetrics');
    });
  });
});
