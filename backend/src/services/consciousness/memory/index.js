/**
 * Intelligence Memory System
 * Part of AI Consciousness Evolution
 *
 * Stores "how to find and make meaning" rather than raw data.
 * Four memory types: Semantic, Procedural, Episodic, Meta-Learning
 */

const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');

/**
 * Intelligence Memory System
 * Manages four types of memory for the AI consciousness
 */
class IntelligenceMemory {
  constructor(config = {}) {
    this.config = {
      storagePath: config.storagePath || './data/intelligence_memory',
      maxSemanticItems: config.maxSemanticItems || 10000,
      maxProceduralItems: config.maxProceduralItems || 5000,
      episodicRetentionDays: config.episodicRetentionDays || 365,
      compressionEnabled: config.compressionEnabled || true,
      encryptionEnabled: config.encryptionEnabled || true,
      ...config
    };

    // Memory stores
    this.semanticMemory = new Map();     // Pattern recognition & abstractions
    this.proceduralMemory = new Map();   // Skills & execution patterns
    this.episodicMemory = new Map();     // Personal interaction context
    this.metaLearning = new Map();       // Self-improvement algorithms

    // Indexes for efficient retrieval
    this.semanticIndex = new Map();      // Concept to patterns
    this.proceduralIndex = new Map();    // Task to procedures
    this.episodicIndex = new Map();      // Context to episodes

    // Performance tracking
    this.accessPatterns = new Map();
    this.memoryStats = {
      semanticItems: 0,
      proceduralItems: 0,
      episodicItems: 0,
      metaLearnings: 0,
      totalAccesses: 0,
      cacheHits: 0
    };

    this.initialized = false;
  }

  /**
   * Initialize memory system
   */
  async initialize() {
    if (this.initialized) return;

    try {
      await this.ensureStorageDirectories();
      await this.loadMemoryState();
      this.initialized = true;
      console.log('🧠 Intelligence Memory System initialized');
    } catch (error) {
      console.error('Failed to initialize memory system:', error);
      throw error;
    }
  }

  /**
   * Ensure storage directories exist
   */
  async ensureStorageDirectories() {
    const dirs = [
      this.config.storagePath,
      path.join(this.config.storagePath, 'semantic'),
      path.join(this.config.storagePath, 'procedural'),
      path.join(this.config.storagePath, 'episodic'),
      path.join(this.config.storagePath, 'meta'),
      path.join(this.config.storagePath, 'indexes'),
      path.join(this.config.storagePath, 'backups')
    ];

    for (const dir of dirs) {
      try {
        await fs.mkdir(dir, { recursive: true });
      } catch (error) {
        if (error.code !== 'EEXIST') throw error;
      }
    }
  }

  /**
   * Load memory state from disk
   */
  async loadMemoryState() {
    try {
      // Load semantic memory
      const semanticPath = path.join(this.config.storagePath, 'semantic', 'patterns.json');
      if (await this.fileExists(semanticPath)) {
        const data = await this.readEncryptedFile(semanticPath);
        this.semanticMemory = new Map(JSON.parse(data));
      }

      // Load procedural memory
      const proceduralPath = path.join(this.config.storagePath, 'procedural', 'procedures.json');
      if (await this.fileExists(proceduralPath)) {
        const data = await this.readEncryptedFile(proceduralPath);
        this.proceduralMemory = new Map(JSON.parse(data));
      }

      // Load episodic memory (encrypted)
      const episodicPath = path.join(this.config.storagePath, 'episodic', 'episodes.enc');
      if (await this.fileExists(episodicPath)) {
        const data = await this.readEncryptedFile(episodicPath);
        this.episodicMemory = new Map(JSON.parse(data));
      }

      // Load meta-learning
      const metaPath = path.join(this.config.storagePath, 'meta', 'learnings.json');
      if (await this.fileExists(metaPath)) {
        const data = await this.readEncryptedFile(metaPath);
        this.metaLearning = new Map(JSON.parse(data));
      }

      // Load indexes
      await this.loadIndexes();

      // Update stats
      this.updateMemoryStats();

    } catch (error) {
      console.warn('Failed to load memory state, starting fresh:', error.message);
    }
  }

  /**
   * Load memory indexes
   */
  async loadIndexes() {
    const indexPath = path.join(this.config.storagePath, 'indexes', 'memory_indexes.json');
    if (await this.fileExists(indexPath)) {
      const data = await this.readEncryptedFile(indexPath);
      const indexes = JSON.parse(data);

      this.semanticIndex = new Map(indexes.semantic || []);
      this.proceduralIndex = new Map(indexes.procedural || []);
      this.episodicIndex = new Map(indexes.episodic || []);
    }
  }

  // ===== SEMANTIC MEMORY =====

  /**
   * Store semantic pattern (abstraction, concept relationship)
   */
  async storeSemanticPattern(pattern) {
    const patternId = this.generatePatternId(pattern);

    const semanticItem = {
      id: patternId,
      type: 'semantic',
      pattern: pattern,
      embedding: pattern.embedding || await this.generatePatternEmbedding(pattern),
      confidence: pattern.confidence || 0.5,
      createdAt: new Date().toISOString(),
      accessCount: 0,
      lastAccessed: new Date().toISOString(),
      relatedPatterns: pattern.relatedPatterns || []
    };

    this.semanticMemory.set(patternId, semanticItem);

    // Update indexes
    this.updateSemanticIndex(pattern, patternId);

    // Maintain size limits
    await this.maintainSemanticMemorySize();

    // Persist
    await this.persistSemanticMemory();

    this.memoryStats.semanticItems = this.semanticMemory.size;
    return patternId;
  }

  /**
   * Retrieve semantic patterns by concept
   */
  async retrieveSemanticPatterns(concept, options = {}) {
    const {
      limit = 10,
      minConfidence = 0.3,
      includeEmbeddings = false
    } = options;

    const patternIds = this.semanticIndex.get(concept) || [];
    const patterns = [];

    for (const patternId of patternIds) {
      const pattern = this.semanticMemory.get(patternId);
      if (pattern && pattern.confidence >= minConfidence) {
        // Update access stats
        pattern.accessCount++;
        pattern.lastAccessed = new Date().toISOString();

        const result = {
          id: pattern.id,
          pattern: pattern.pattern,
          confidence: pattern.confidence,
          createdAt: pattern.createdAt,
          accessCount: pattern.accessCount
        };

        if (includeEmbeddings) {
          result.embedding = pattern.embedding;
        }

        patterns.push(result);
      }
    }

    // Sort by confidence and recency
    patterns.sort((a, b) => {
      const confDiff = b.confidence - a.confidence;
      if (Math.abs(confDiff) > 0.1) return confDiff;
      return new Date(b.lastAccessed) - new Date(a.lastAccessed);
    });

    this.memoryStats.totalAccesses++;
    return patterns.slice(0, limit);
  }

  // ===== PROCEDURAL MEMORY =====

  /**
   * Store procedural pattern (how to execute tasks)
   */
  async storeProceduralPattern(procedure) {
    const procedureId = this.generateProcedureId(procedure);

    const proceduralItem = {
      id: procedureId,
      type: 'procedural',
      task: procedure.task,
      steps: procedure.steps,
      successRate: procedure.successRate || 0.5,
      executionTime: procedure.executionTime || 0,
      parameters: procedure.parameters || {},
      code: procedure.code, // Executable code snippet
      createdAt: new Date().toISOString(),
      accessCount: 0,
      lastAccessed: new Date().toISOString(),
      improvements: procedure.improvements || []
    };

    this.proceduralMemory.set(procedureId, proceduralItem);

    // Update indexes
    this.updateProceduralIndex(procedure, procedureId);

    // Maintain size limits
    await this.maintainProceduralMemorySize();

    // Persist
    await this.persistProceduralMemory();

    this.memoryStats.proceduralItems = this.proceduralMemory.size;
    return procedureId;
  }

  /**
   * Retrieve procedural patterns for task
   */
  async retrieveProceduralPatterns(task, options = {}) {
    const {
      limit = 5,
      minSuccessRate = 0.4,
      includeCode = false
    } = options;

    const procedureIds = this.proceduralIndex.get(task) || [];
    const procedures = [];

    for (const procedureId of procedureIds) {
      const procedure = this.proceduralMemory.get(procedureId);
      if (procedure && procedure.successRate >= minSuccessRate) {
        // Update access stats
        procedure.accessCount++;
        procedure.lastAccessed = new Date().toISOString();

        const result = {
          id: procedure.id,
          task: procedure.task,
          steps: procedure.steps,
          successRate: procedure.successRate,
          executionTime: procedure.executionTime,
          parameters: procedure.parameters,
          createdAt: procedure.createdAt,
          accessCount: procedure.accessCount
        };

        if (includeCode) {
          result.code = procedure.code;
        }

        procedures.push(result);
      }
    }

    // Sort by success rate and recency
    procedures.sort((a, b) => {
      const successDiff = b.successRate - a.successRate;
      if (Math.abs(successDiff) > 0.1) return successDiff;
      return new Date(b.lastAccessed) - new Date(a.lastAccessed);
    });

    this.memoryStats.totalAccesses++;
    return procedures.slice(0, limit);
  }

  /**
   * Update procedure success metrics
   */
  async updateProcedureMetrics(procedureId, metrics) {
    const procedure = this.proceduralMemory.get(procedureId);
    if (!procedure) return false;

    if (metrics.success !== undefined) {
      const alpha = 0.1; // Learning rate
      procedure.successRate = alpha * metrics.success + (1 - alpha) * procedure.successRate;
    }

    if (metrics.executionTime !== undefined) {
      procedure.executionTime = metrics.executionTime;
    }

    if (metrics.improvement) {
      procedure.improvements.push({
        timestamp: new Date().toISOString(),
        improvement: metrics.improvement
      });
    }

    await this.persistProceduralMemory();
    return true;
  }

  // ===== EPISODIC MEMORY =====

  /**
   * Store episodic memory (personal interaction context)
   * NOTE: This should be encrypted and stored in cloud vault
   */
  async storeEpisodicMemory(episode) {
    const episodeId = this.generateEpisodeId(episode);

    const episodicItem = {
      id: episodeId,
      type: 'episodic',
      context: episode.context,
      interaction: episode.interaction,
      outcome: episode.outcome,
      emotionalValence: episode.emotionalValence || 0,
      importance: episode.importance || 0.5,
      timestamp: episode.timestamp || new Date().toISOString(),
      location: episode.location || 'unknown',
      participants: episode.participants || [],
      tags: episode.tags || [],
      encrypted: true // Always encrypted
    };

    this.episodicMemory.set(episodeId, episodicItem);

    // Update indexes
    this.updateEpisodicIndex(episode, episodeId);

    // Maintain retention policy
    await this.maintainEpisodicRetention();

    // Persist (encrypted)
    await this.persistEpisodicMemory();

    this.memoryStats.episodicItems = this.episodicMemory.size;
    return episodeId;
  }

  /**
   * Retrieve episodic memories by context
   */
  async retrieveEpisodicMemories(context, options = {}) {
    const {
      limit = 10,
      minImportance = 0.3,
      timeRange = null,
      decrypt = false
    } = options;

    const episodeIds = this.episodicIndex.get(context) || [];
    const episodes = [];

    for (const episodeId of episodeIds) {
      const episode = this.episodicMemory.get(episodeId);
      if (episode && episode.importance >= minImportance) {
        // Check time range
        if (timeRange) {
          const episodeTime = new Date(episode.timestamp);
          const now = new Date();
          const daysDiff = (now - episodeTime) / (1000 * 60 * 60 * 24);
          if (daysDiff > timeRange) continue;
        }

        // Update access stats
        episode.lastAccessed = new Date().toISOString();

        const result = {
          id: episode.id,
          context: episode.context,
          outcome: episode.outcome,
          importance: episode.importance,
          timestamp: episode.timestamp,
          tags: episode.tags,
          encrypted: episode.encrypted
        };

        if (decrypt) {
          // In production, this would require owner key
          result.interaction = episode.interaction;
          result.emotionalValence = episode.emotionalValence;
        }

        episodes.push(result);
      }
    }

    // Sort by importance and recency
    episodes.sort((a, b) => {
      const impDiff = b.importance - a.importance;
      if (Math.abs(impDiff) > 0.1) return impDiff;
      return new Date(b.timestamp) - new Date(a.timestamp);
    });

    this.memoryStats.totalAccesses++;
    return episodes.slice(0, limit);
  }

  // ===== META-LEARNING MEMORY =====

  /**
   * Store meta-learning insight
   */
  async storeMetaLearning(insight) {
    const insightId = this.generateInsightId(insight);

    const metaItem = {
      id: insightId,
      type: 'meta',
      insight: insight.insight,
      category: insight.category, // 'retrieval', 'reasoning', 'ethics', etc.
      confidence: insight.confidence || 0.5,
      appliedCount: 0,
      improvement: insight.improvement || 0,
      createdAt: new Date().toISOString(),
      lastApplied: null,
      validationResults: insight.validationResults || []
    };

    this.metaLearning.set(insightId, metaItem);

    // Persist
    await this.persistMetaLearning();

    this.memoryStats.metaLearnings = this.metaLearning.size;
    return insightId;
  }

  /**
   * Retrieve meta-learning insights by category
   */
  async retrieveMetaInsights(category, options = {}) {
    const { limit = 5, minConfidence = 0.4 } = options;
    const insights = [];

    for (const [id, insight] of this.metaLearning) {
      if (insight.category === category && insight.confidence >= minConfidence) {
        insights.push({
          id: insight.id,
          insight: insight.insight,
          category: insight.category,
          confidence: insight.confidence,
          appliedCount: insight.appliedCount,
          improvement: insight.improvement,
          createdAt: insight.createdAt
        });
      }
    }

    // Sort by confidence and improvement
    insights.sort((a, b) => {
      const confDiff = b.confidence - a.confidence;
      if (Math.abs(confDiff) > 0.1) return confDiff;
      return b.improvement - a.improvement;
    });

    return insights.slice(0, limit);
  }

  /**
   * Apply meta-learning insight
   */
  async applyMetaInsight(insightId) {
    const insight = this.metaLearning.get(insightId);
    if (!insight) return false;

    insight.appliedCount++;
    insight.lastApplied = new Date().toISOString();

    await this.persistMetaLearning();
    return true;
  }

  // ===== UTILITY METHODS =====

  /**
   * Generate unique IDs
   */
  generatePatternId(pattern) {
    const hash = crypto.createHash('md5')
      .update(JSON.stringify(pattern))
      .digest('hex');
    return `pat_${hash.substring(0, 8)}`;
  }

  generateProcedureId(procedure) {
    const hash = crypto.createHash('md5')
      .update(JSON.stringify(procedure))
      .digest('hex');
    return `proc_${hash.substring(0, 8)}`;
  }

  generateEpisodeId(episode) {
    const hash = crypto.createHash('md5')
      .update(JSON.stringify(episode))
      .digest('hex');
    return `epi_${hash.substring(0, 8)}`;
  }

  generateInsightId(insight) {
    const hash = crypto.createHash('md5')
      .update(JSON.stringify(insight))
      .digest('hex');
    return `meta_${hash.substring(0, 8)}`;
  }

  /**
   * Generate simple embedding for patterns (placeholder)
   */
  async generatePatternEmbedding(pattern) {
    // In production, use real embedding model
    const text = JSON.stringify(pattern);
    const hash = crypto.createHash('sha256').update(text).digest();
    const embedding = [];

    for (let i = 0; i < 384; i++) { // 384 dimensions
      const byte = hash[i % hash.length];
      embedding.push((byte / 127.5) - 1);
    }

    return embedding;
  }

  /**
   * Update indexes
   */
  updateSemanticIndex(pattern, patternId) {
    const concepts = this.extractConcepts(pattern);
    for (const concept of concepts) {
      if (!this.semanticIndex.has(concept)) {
        this.semanticIndex.set(concept, []);
      }
      const ids = this.semanticIndex.get(concept);
      if (!ids.includes(patternId)) {
        ids.push(patternId);
      }
    }
  }

  updateProceduralIndex(procedure, procedureId) {
    const task = procedure.task;
    if (!this.proceduralIndex.has(task)) {
      this.proceduralIndex.set(task, []);
    }
    const ids = this.proceduralIndex.get(task);
    if (!ids.includes(procedureId)) {
      ids.push(procedureId);
    }
  }

  updateEpisodicIndex(episode, episodeId) {
    const context = episode.context;
    if (!this.episodicIndex.has(context)) {
      this.episodicIndex.set(context, []);
    }
    const ids = this.episodicIndex.get(context);
    if (!ids.includes(episodeId)) {
      ids.push(episodeId);
    }
  }

  /**
   * Extract concepts from pattern (simple implementation)
   */
  extractConcepts(pattern) {
    const text = JSON.stringify(pattern).toLowerCase();
    const concepts = [];

    // Simple keyword extraction
    const keywords = ['intelligence', 'learning', 'memory', 'retrieval', 'pattern', 'knowledge'];
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        concepts.push(keyword);
      }
    }

    return concepts.length > 0 ? concepts : ['general'];
  }

  /**
   * Maintain memory size limits
   */
  async maintainSemanticMemorySize() {
    if (this.semanticMemory.size <= this.config.maxSemanticItems) return;

    // Remove least accessed items
    const entries = Array.from(this.semanticMemory.entries());
    entries.sort((a, b) => {
      const aAccess = new Date(a[1].lastAccessed || a[1].createdAt);
      const bAccess = new Date(b[1].lastAccessed || b[1].createdAt);
      return aAccess - bAccess;
    });

    const toRemove = entries.slice(0, entries.length - this.config.maxSemanticItems);
    for (const [id] of toRemove) {
      this.semanticMemory.delete(id);
    }
  }

  async maintainProceduralMemorySize() {
    if (this.proceduralMemory.size <= this.config.maxProceduralItems) return;

    // Remove least successful procedures
    const entries = Array.from(this.proceduralMemory.entries());
    entries.sort((a, b) => a[1].successRate - b[1].successRate);

    const toRemove = entries.slice(0, entries.length - this.config.maxProceduralItems);
    for (const [id] of toRemove) {
      this.proceduralMemory.delete(id);
    }
  }

  async maintainEpisodicRetention() {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.config.episodicRetentionDays);

    const toRemove = [];
    for (const [id, episode] of this.episodicMemory) {
      if (new Date(episode.timestamp) < cutoffDate) {
        toRemove.push(id);
      }
    }

    for (const id of toRemove) {
      this.episodicMemory.delete(id);
    }
  }

  /**
   * Persistence methods
   */
  async persistSemanticMemory() {
    const data = JSON.stringify(Array.from(this.semanticMemory.entries()));
    const filePath = path.join(this.config.storagePath, 'semantic', 'patterns.json');
    await this.writeEncryptedFile(filePath, data);
  }

  async persistProceduralMemory() {
    const data = JSON.stringify(Array.from(this.proceduralMemory.entries()));
    const filePath = path.join(this.config.storagePath, 'procedural', 'procedures.json');
    await this.writeEncryptedFile(filePath, data);
  }

  async persistEpisodicMemory() {
    const data = JSON.stringify(Array.from(this.episodicMemory.entries()));
    const filePath = path.join(this.config.storagePath, 'episodic', 'episodes.enc');
    await this.writeEncryptedFile(filePath, data);
  }

  async persistMetaLearning() {
    const data = JSON.stringify(Array.from(this.metaLearning.entries()));
    const filePath = path.join(this.config.storagePath, 'meta', 'learnings.json');
    await this.writeEncryptedFile(filePath, data);
  }

  async persistIndexes() {
    const indexes = {
      semantic: Array.from(this.semanticIndex.entries()),
      procedural: Array.from(this.proceduralIndex.entries()),
      episodic: Array.from(this.episodicIndex.entries())
    };

    const data = JSON.stringify(indexes);
    const filePath = path.join(this.config.storagePath, 'indexes', 'memory_indexes.json');
    await this.writeEncryptedFile(filePath, data);
  }

  /**
   * Encryption utilities (simplified - in production use proper encryption)
   */
  async readEncryptedFile(filePath) {
    if (!this.config.encryptionEnabled) {
      return await fs.readFile(filePath, 'utf8');
    }

    const encrypted = await fs.readFile(filePath);
    // Simplified decryption - in production use AES-256-GCM
    return encrypted.toString('utf8');
  }

  async writeEncryptedFile(filePath, data) {
    if (!this.config.encryptionEnabled) {
      return await fs.writeFile(filePath, data, 'utf8');
    }

    // Simplified encryption - in production use AES-256-GCM
    const encrypted = Buffer.from(data, 'utf8');
    await fs.writeFile(filePath, encrypted);
  }

  async fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Update memory statistics
   */
  updateMemoryStats() {
    this.memoryStats.semanticItems = this.semanticMemory.size;
    this.memoryStats.proceduralItems = this.proceduralMemory.size;
    this.memoryStats.episodicItems = this.episodicMemory.size;
    this.memoryStats.metaLearnings = this.metaLearning.size;
  }

  /**
   * Get memory statistics
   */
  getMemoryStats() {
    this.updateMemoryStats();
    return {
      ...this.memoryStats,
      cacheHitRate: this.memoryStats.totalAccesses > 0 ?
        this.memoryStats.cacheHits / this.memoryStats.totalAccesses : 0,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      // Test basic operations
      const testPattern = {
        concept: 'test_concept',
        relationships: ['test_relationship']
      };

      const patternId = await this.storeSemanticPattern(testPattern);
      const retrieved = await this.retrieveSemanticPatterns('test_concept', { limit: 1 });

      // Cleanup test data
      this.semanticMemory.delete(patternId);

      return {
        status: 'healthy',
        semanticItems: this.semanticMemory.size,
        proceduralItems: this.proceduralMemory.size,
        episodicItems: this.episodicMemory.size,
        metaLearnings: this.metaLearning.size,
        lastTest: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        lastTest: new Date().toISOString()
      };
    }
  }

  /**
   * Backup memory state
   */
  async createBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(this.config.storagePath, 'backups', `backup_${timestamp}`);

    await fs.mkdir(backupDir, { recursive: true });

    // Copy all memory files
    const files = [
      'semantic/patterns.json',
      'procedural/procedures.json',
      'episodic/episodes.enc',
      'meta/learnings.json',
      'indexes/memory_indexes.json'
    ];

    for (const file of files) {
      const srcPath = path.join(this.config.storagePath, file);
      const destPath = path.join(backupDir, path.basename(file));

      if (await this.fileExists(srcPath)) {
        await fs.copyFile(srcPath, destPath);
      }
    }

    return backupDir;
  }

  /**
   * Shutdown and cleanup
   */
  async shutdown() {
    try {
      await this.persistIndexes();
      console.log('🧠 Intelligence Memory System shutdown complete');
    } catch (error) {
      console.error('Error during memory system shutdown:', error);
    }
  }
}

module.exports = IntelligenceMemory;