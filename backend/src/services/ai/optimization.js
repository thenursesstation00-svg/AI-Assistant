/**
 * Performance Optimization System
 * 
 * Provides caching, memory optimization, database migration helpers,
 * and performance monitoring
 */

const fs = require('fs').promises;
const path = require('path');
const { EventEmitter } = require('events');

class OptimizationSystem extends EventEmitter {
  constructor() {
    super();
    this.cacheStore = new Map();
    this.cacheStats = {
      hits: 0,
      misses: 0,
      evictions: 0
    };
    this.performanceMetrics = [];
    this.memorySnapshots = [];
    this.initialized = false;
    this.dataPath = path.join(__dirname, '../../../data/optimization');

    // Configuration
    this.config = {
      maxCacheSize: 1000,
      cacheTTL: 3600000, // 1 hour
      maxMetricsHistory: 10000,
      gcInterval: 300000, // 5 minutes
      memoryThreshold: 0.85 // 85% memory usage threshold
    };
  }

  async initialize() {
    if (this.initialized) return;

    try {
      await fs.mkdir(this.dataPath, { recursive: true });
      
      // Start background optimization tasks
      this.startGarbageCollection();
      this.startMemoryMonitoring();
      
      this.initialized = true;
      console.log('[Optimization] System initialized');
    } catch (error) {
      console.error('[Optimization] Initialization error:', error);
    }
  }

  /**
   * Advanced caching with LRU eviction
   */
  async cache(key, fetcher, options = {}) {
    const { ttl = this.config.cacheTTL, tags = [] } = options;

    // Check cache
    if (this.cacheStore.has(key)) {
      const cached = this.cacheStore.get(key);
      
      if (Date.now() - cached.timestamp < ttl) {
        this.cacheStats.hits++;
        
        // Update access time for LRU
        cached.lastAccess = Date.now();
        
        return cached.value;
      } else {
        // Expired, remove
        this.cacheStore.delete(key);
      }
    }

    // Cache miss
    this.cacheStats.misses++;

    // Fetch fresh data
    const value = await fetcher();

    // Store in cache
    this.set(key, value, { ttl, tags });

    return value;
  }

  /**
   * Set cache value
   */
  set(key, value, options = {}) {
    const { ttl = this.config.cacheTTL, tags = [] } = options;

    // Check cache size limit
    if (this.cacheStore.size >= this.config.maxCacheSize) {
      this.evictLRU();
    }

    this.cacheStore.set(key, {
      value,
      timestamp: Date.now(),
      lastAccess: Date.now(),
      ttl,
      tags
    });
  }

  /**
   * Get cache value
   */
  get(key) {
    if (this.cacheStore.has(key)) {
      const cached = this.cacheStore.get(key);
      
      if (Date.now() - cached.timestamp < cached.ttl) {
        cached.lastAccess = Date.now();
        this.cacheStats.hits++;
        return cached.value;
      } else {
        this.cacheStore.delete(key);
      }
    }

    this.cacheStats.misses++;
    return null;
  }

  /**
   * Evict least recently used entry
   */
  evictLRU() {
    let oldestKey = null;
    let oldestTime = Infinity;

    for (const [key, entry] of this.cacheStore.entries()) {
      if (entry.lastAccess < oldestTime) {
        oldestTime = entry.lastAccess;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cacheStore.delete(oldestKey);
      this.cacheStats.evictions++;
    }
  }

  /**
   * Invalidate cache by tag
   */
  invalidateTag(tag) {
    let count = 0;
    
    for (const [key, entry] of this.cacheStore.entries()) {
      if (entry.tags.includes(tag)) {
        this.cacheStore.delete(key);
        count++;
      }
    }

    console.log(`[Optimization] Invalidated ${count} cache entries with tag: ${tag}`);
    return count;
  }

  /**
   * Clear all cache
   */
  clearCache() {
    const size = this.cacheStore.size;
    this.cacheStore.clear();
    console.log(`[Optimization] Cleared ${size} cache entries`);
  }

  /**
   * Performance tracking
   */
  trackPerformance(operation, duration, metadata = {}) {
    const metric = {
      operation,
      duration,
      timestamp: new Date().toISOString(),
      metadata
    };

    this.performanceMetrics.push(metric);

    // Limit history
    if (this.performanceMetrics.length > this.config.maxMetricsHistory) {
      this.performanceMetrics = this.performanceMetrics.slice(-this.config.maxMetricsHistory);
    }

    // Emit event for monitoring
    this.emit('performance_tracked', metric);

    return metric;
  }

  /**
   * Measure async function performance
   */
  async measure(name, fn) {
    const start = Date.now();
    
    try {
      const result = await fn();
      const duration = Date.now() - start;
      
      this.trackPerformance(name, duration, { success: true });
      
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      
      this.trackPerformance(name, duration, { 
        success: false, 
        error: error.message 
      });
      
      throw error;
    }
  }

  /**
   * Get performance statistics
   */
  getPerformanceStats(operationName = null) {
    let metrics = this.performanceMetrics;

    if (operationName) {
      metrics = metrics.filter(m => m.operation === operationName);
    }

    if (metrics.length === 0) {
      return { count: 0, avg: 0, min: 0, max: 0, p95: 0 };
    }

    const durations = metrics.map(m => m.duration).sort((a, b) => a - b);
    const sum = durations.reduce((a, b) => a + b, 0);

    return {
      count: metrics.length,
      avg: sum / metrics.length,
      min: durations[0],
      max: durations[durations.length - 1],
      p50: durations[Math.floor(durations.length * 0.5)],
      p95: durations[Math.floor(durations.length * 0.95)],
      p99: durations[Math.floor(durations.length * 0.99)]
    };
  }

  /**
   * Memory optimization
   */
  getMemoryUsage() {
    const usage = process.memoryUsage();
    
    return {
      heapUsed: usage.heapUsed,
      heapTotal: usage.heapTotal,
      external: usage.external,
      rss: usage.rss,
      heapUsedMB: (usage.heapUsed / 1024 / 1024).toFixed(2),
      heapTotalMB: (usage.heapTotal / 1024 / 1024).toFixed(2),
      percentUsed: ((usage.heapUsed / usage.heapTotal) * 100).toFixed(2)
    };
  }

  /**
   * Monitor memory and trigger GC if needed
   */
  startMemoryMonitoring() {
    setInterval(() => {
      const usage = this.getMemoryUsage();
      
      this.memorySnapshots.push({
        ...usage,
        timestamp: new Date().toISOString()
      });

      // Keep last 100 snapshots
      if (this.memorySnapshots.length > 100) {
        this.memorySnapshots = this.memorySnapshots.slice(-100);
      }

      // Check threshold
      if (usage.percentUsed > this.config.memoryThreshold * 100) {
        console.warn('[Optimization] High memory usage detected:', usage.percentUsed + '%');
        this.emit('high_memory_usage', usage);
        
        // Trigger aggressive cleanup
        this.aggressiveCleanup();
      }
    }, 60000); // Check every minute
  }

  /**
   * Aggressive cleanup
   */
  aggressiveCleanup() {
    console.log('[Optimization] Running aggressive cleanup...');

    // Clear old cache entries
    const now = Date.now();
    let cleared = 0;

    for (const [key, entry] of this.cacheStore.entries()) {
      if (now - entry.timestamp > entry.ttl * 0.5) { // Clear entries > 50% TTL
        this.cacheStore.delete(key);
        cleared++;
      }
    }

    // Trim metrics
    if (this.performanceMetrics.length > 1000) {
      this.performanceMetrics = this.performanceMetrics.slice(-1000);
    }

    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }

    console.log(`[Optimization] Cleanup complete: ${cleared} cache entries removed`);
  }

  /**
   * Start periodic garbage collection
   */
  startGarbageCollection() {
    setInterval(() => {
      const before = this.getMemoryUsage();

      // Clear expired cache entries
      const now = Date.now();
      let cleared = 0;

      for (const [key, entry] of this.cacheStore.entries()) {
        if (now - entry.timestamp > entry.ttl) {
          this.cacheStore.delete(key);
          cleared++;
        }
      }

      if (cleared > 0) {
        const after = this.getMemoryUsage();
        console.log(`[Optimization] GC: Cleared ${cleared} expired cache entries`);
        console.log(`[Optimization] Memory: ${before.heapUsedMB}MB -> ${after.heapUsedMB}MB`);
      }
    }, this.config.gcInterval);
  }

  /**
   * Database query optimization helper
   */
  optimizeQuery(query, params = {}) {
    const suggestions = [];
    const normalized = query.toLowerCase();
    const hasIndexHint = normalized.includes('index');
    const isSimpleSelect = /select\s+[^*]+\s+from/i.test(query) && !/join/i.test(query);
    const isPrimaryKeyFilter = /where\s+[\w.]*id\s*=\s*[^\s]+/i.test(query) && !/and|or/i.test(query);

    if (normalized.includes('where') && !hasIndexHint) {
      if (!(isSimpleSelect && isPrimaryKeyFilter)) {
        suggestions.push('Consider adding index on WHERE clause columns');
      }
    }

    if (normalized.includes('join') && !hasIndexHint) {
      suggestions.push('Consider adding index on JOIN columns');
    }

    if (normalized.includes('order by') && !hasIndexHint) {
      suggestions.push('Consider adding index on ORDER BY columns');
    }

    if (/select\s+\*/i.test(query)) {
      suggestions.push('Avoid SELECT *, specify needed columns');
    }

    return {
      original: query,
      suggestions,
      estimatedImprovement: suggestions.length > 0 ? '20-50%' : 'none'
    };
  }

  /**
   * Batch processing helper
   */
  async batchProcess(items, processor, options = {}) {
    const { 
      batchSize = 100, 
      concurrency = 5,
      onProgress = null 
    } = options;

    const results = [];
    const batches = [];

    // Create batches
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }

    // Process batches with concurrency control
    for (let i = 0; i < batches.length; i += concurrency) {
      const batchGroup = batches.slice(i, i + concurrency);
      
      const batchResults = await Promise.all(
        batchGroup.map(batch => this.processBatch(batch, processor))
      );

      results.push(...batchResults.flat());

      if (onProgress) {
        onProgress({
          processed: Math.min((i + concurrency) * batchSize, items.length),
          total: items.length,
          percentage: Math.min(((i + concurrency) / batches.length) * 100, 100).toFixed(2)
        });
      }
    }

    return results;
  }

  /**
   * Process single batch
   */
  async processBatch(batch, processor) {
    return Promise.all(batch.map(item => processor(item)));
  }

  /**
   * Debounce helper
   */
  debounce(func, wait) {
    let timeout;
    
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };

      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * Throttle helper
   */
  throttle(func, limit) {
    let inThrottle;
    
    return function executedFunction(...args) {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  /**
   * Memoization helper
   */
  memoize(func, resolver) {
    const cache = new Map();
    
    return function memoized(...args) {
      const key = resolver ? resolver(...args) : JSON.stringify(args);
      
      if (cache.has(key)) {
        return cache.get(key);
      }

      const result = func(...args);
      cache.set(key, result);
      
      return result;
    };
  }

  /**
   * Get comprehensive statistics
   */
  getStats() {
    const memory = this.getMemoryUsage();

    return {
      cache: {
        size: this.cacheStore.size,
        maxSize: this.config.maxCacheSize,
        hits: this.cacheStats.hits,
        misses: this.cacheStats.misses,
        hitRate: this.cacheStats.hits + this.cacheStats.misses > 0
          ? ((this.cacheStats.hits / (this.cacheStats.hits + this.cacheStats.misses)) * 100).toFixed(2) + '%'
          : '0%',
        evictions: this.cacheStats.evictions
      },
      memory: {
        current: memory,
        snapshots: this.memorySnapshots.length,
        threshold: (this.config.memoryThreshold * 100).toFixed(0) + '%'
      },
      performance: {
        totalMetrics: this.performanceMetrics.length,
        operations: [...new Set(this.performanceMetrics.map(m => m.operation))]
      }
    };
  }

  /**
   * Generate optimization report
   */
  async generateReport() {
    const stats = this.getStats();
    const perfStats = this.getPerformanceStats();

    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        cacheEfficiency: stats.cache.hitRate,
        memoryUsage: stats.memory.current.percentUsed + '%',
        avgResponseTime: perfStats.avg?.toFixed(2) + 'ms',
        p95ResponseTime: perfStats.p95?.toFixed(2) + 'ms'
      },
      recommendations: this.generateRecommendations(stats, perfStats),
      detailedStats: stats,
      performanceStats: perfStats
    };

    // Save report
    await this.saveReport(report);

    return report;
  }

  /**
   * Generate optimization recommendations
   */
  generateRecommendations(stats, perfStats) {
    const recommendations = [];

    // Cache recommendations
    if (parseFloat(stats.cache.hitRate) < 50) {
      recommendations.push({
        type: 'cache',
        priority: 'high',
        message: 'Cache hit rate is low. Consider increasing cache size or TTL.',
        action: 'Increase maxCacheSize or cacheTTL'
      });
    }

    // Memory recommendations
    if (parseFloat(stats.memory.current.percentUsed) > 70) {
      recommendations.push({
        type: 'memory',
        priority: 'high',
        message: 'Memory usage is high. Consider optimization or scaling.',
        action: 'Run aggressiveCleanup() or add more memory'
      });
    }

    // Performance recommendations
    if (perfStats.avg > 1000) {
      recommendations.push({
        type: 'performance',
        priority: 'medium',
        message: 'Average response time is slow. Consider optimization.',
        action: 'Review slow operations and add caching'
      });
    }

    return recommendations;
  }

  /**
   * Save optimization report
   */
  async saveReport(report) {
    try {
      const filename = `optimization_report_${Date.now()}.json`;
      const filepath = path.join(this.dataPath, filename);
      
      await fs.writeFile(filepath, JSON.stringify(report, null, 2));
      
      console.log(`[Optimization] Report saved: ${filename}`);
    } catch (error) {
      console.error('[Optimization] Report save error:', error);
    }
  }
}

module.exports = new OptimizationSystem();
