/**
 * Key Pool Manager
 * Manages multiple API keys per provider with automatic rotation and failover
 */

class KeyPoolManager {
  constructor() {
    this.pools = new Map(); // provider -> { keys: [], currentIndex: 0, failures: Map }
    this.rateLimitRetryDelay = 60000; // 1 minute
  }

  /**
   * Initialize key pool for a provider
   * @param {string} provider - Provider name (e.g., 'anthropic', 'openai')
   * @param {Array<string>} keys - Array of API keys
   */
  initPool(provider, keys) {
    if (!keys || keys.length === 0) {
      throw new Error(`No keys provided for ${provider}`);
    }

    const validKeys = keys.filter(k => k && k.trim().length > 0);
    if (validKeys.length === 0) {
      throw new Error(`No valid keys provided for ${provider}`);
    }

    this.pools.set(provider, {
      keys: validKeys,
      currentIndex: 0,
      failures: new Map(), // key -> { count: number, lastFailure: timestamp }
      stats: {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        rotations: 0,
      },
    });

    console.log(`✓ Initialized key pool for ${provider}: ${validKeys.length} key(s)`);
  }

  /**
   * Get next available key for a provider
   * @param {string} provider - Provider name
   * @returns {string} API key
   */
  getKey(provider) {
    const pool = this.pools.get(provider);
    if (!pool) {
      throw new Error(`No key pool initialized for ${provider}`);
    }

    // Try each key in rotation until we find a working one
    const startIndex = pool.currentIndex;
    let attempts = 0;

    while (attempts < pool.keys.length) {
      const key = pool.keys[pool.currentIndex];
      const failure = pool.failures.get(key);

      // Check if key is temporarily blocked due to rate limit
      if (failure && failure.rateLimited) {
        const timeSinceFailure = Date.now() - failure.lastFailure;
        if (timeSinceFailure < this.rateLimitRetryDelay) {
          // Skip this key, try next
          this._rotateIndex(pool);
          attempts++;
          continue;
        } else {
          // Rate limit cooldown expired, clear the flag
          failure.rateLimited = false;
        }
      }

      pool.stats.totalRequests++;
      return key;
    }

    // All keys are rate limited, return the least recently failed one
    console.warn(`⚠️  All keys for ${provider} are rate limited, using least recently failed`);
    return pool.keys[pool.currentIndex];
  }

  /**
   * Mark a key as successful
   * @param {string} provider - Provider name
   * @param {string} key - API key
   */
  markSuccess(provider, key) {
    const pool = this.pools.get(provider);
    if (!pool) return;

    pool.stats.successfulRequests++;
    
    // Clear failure record on success
    if (pool.failures.has(key)) {
      pool.failures.delete(key);
    }
  }

  /**
   * Mark a key as failed and rotate to next
   * @param {string} provider - Provider name
   * @param {string} key - API key
   * @param {Object} error - Error object
   * @param {boolean} isRateLimit - Whether failure was due to rate limit
   */
  markFailure(provider, key, error = {}, isRateLimit = false) {
    const pool = this.pools.get(provider);
    if (!pool) return;

    pool.stats.failedRequests++;

    const failure = pool.failures.get(key) || { count: 0, lastFailure: 0 };
    failure.count++;
    failure.lastFailure = Date.now();
    failure.rateLimited = isRateLimit;
    failure.error = error.message || error;

    pool.failures.set(key, failure);

    if (isRateLimit) {
      console.warn(`⚠️  Key for ${provider} hit rate limit, rotating to next key`);
    } else {
      console.warn(`⚠️  Key for ${provider} failed (attempt ${failure.count}), rotating to next key`);
    }

    // Rotate to next key
    this._rotateIndex(pool);
    pool.stats.rotations++;
  }

  /**
   * Get all keys for a provider (for admin purposes)
   * @param {string} provider - Provider name
   * @returns {Array} Array of key info (masked)
   */
  getPoolStatus(provider) {
    const pool = this.pools.get(provider);
    if (!pool) return null;

    return {
      totalKeys: pool.keys.length,
      currentIndex: pool.currentIndex,
      keys: pool.keys.map((key, idx) => {
        const failure = pool.failures.get(key);
        return {
          index: idx,
          masked: this._maskKey(key),
          current: idx === pool.currentIndex,
          failures: failure ? failure.count : 0,
          rateLimited: failure ? failure.rateLimited : false,
          lastFailure: failure ? new Date(failure.lastFailure).toISOString() : null,
        };
      }),
      stats: pool.stats,
    };
  }

  /**
   * Get statistics for all providers
   * @returns {Object} Stats for all providers
   */
  getAllStats() {
    const stats = {};
    for (const [provider, pool] of this.pools) {
      stats[provider] = {
        ...pool.stats,
        totalKeys: pool.keys.length,
        currentKeyIndex: pool.currentIndex,
      };
    }
    return stats;
  }

  /**
   * Reset failure counts for a provider (admin function)
   * @param {string} provider - Provider name
   */
  resetFailures(provider) {
    const pool = this.pools.get(provider);
    if (!pool) return;

    pool.failures.clear();
    console.log(`✓ Reset failure counts for ${provider}`);
  }

  /**
   * Rotate to next key index
   * @private
   */
  _rotateIndex(pool) {
    pool.currentIndex = (pool.currentIndex + 1) % pool.keys.length;
  }

  /**
   * Mask API key for display
   * @private
   */
  _maskKey(key) {
    if (key.length <= 10) return '***';
    return key.substring(0, 7) + '...' + key.substring(key.length - 4);
  }
}

// Singleton instance
const keyPoolManager = new KeyPoolManager();

module.exports = keyPoolManager;
