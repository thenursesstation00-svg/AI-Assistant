/**
 * Dual-Core Architecture Orchestrator
 * Executive and Operational Cores Integration
 *
 * Orchestrates the dual-core consciousness system:
 * - Executive Core: Planning, ethics, long-term strategy
 * - Operational Core: Real-time processing, retrieval, execution
 */

const crypto = require('crypto');
const axios = require('axios');
const cheerio = require('cheerio');
const NodeCache = require('node-cache');
const { pipeline } = require('@xenova/transformers');

/**
 * Vector Index - FAISS-like functionality for semantic search
 */
class VectorIndex {
  constructor(config = {}) {
    this.dimension = config.dimension || 384;
    this.vectors = []; // Array of vectors
    this.metadata = new Map(); // id -> metadata
    this.idToIndex = new Map(); // id -> array index
  }

  /**
   * Add vector to index
   */
  add(artifactId, vector, metadata = {}) {
    if (vector.length !== this.dimension) {
      throw new Error(`Vector dimension mismatch: expected ${this.dimension}, got ${vector.length}`);
    }

    const index = this.vectors.length;
    this.vectors.push(new Float32Array(vector));
    this.metadata.set(artifactId, {
      ...metadata,
      created_at: new Date().toISOString()
    });
    this.idToIndex.set(artifactId, index);
  }

  /**
   * Search for similar vectors
   */
  search(queryVector, k = 5) {
    if (queryVector.length !== this.dimension) {
      throw new Error(`Query vector dimension mismatch: expected ${this.dimension}, got ${queryVector.length}`);
    }

    const query = new Float32Array(queryVector);
    const similarities = [];

    // Calculate cosine similarity for all vectors
    for (let i = 0; i < this.vectors.length; i++) {
      const similarity = this.cosineSimilarity(query, this.vectors[i]);
      const artifactId = Array.from(this.idToIndex.entries()).find(([id, idx]) => idx === i)?.[0];
      if (artifactId) {
        similarities.push({
          id: artifactId,
          score: similarity,
          metadata: this.metadata.get(artifactId)
        });
      }
    }

    // Sort by similarity and return top k
    return similarities
      .sort((a, b) => b.score - a.score)
      .slice(0, k);
  }

  /**
   * Calculate cosine similarity
   */
  cosineSimilarity(a, b) {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    normA = Math.sqrt(normA);
    normB = Math.sqrt(normB);

    if (normA === 0 || normB === 0) return 0;

    return dotProduct / (normA * normB);
  }

  /**
   * Get index statistics
   */
  getStats() {
    return {
      totalVectors: this.vectors.length,
      dimension: this.dimension,
      memoryUsage: this.vectors.length * this.dimension * 4 // Float32Array = 4 bytes per float
    };
  }
}

/**
 * Embedding Service - Generate embeddings using transformers
 */
class EmbeddingService {
  constructor(config = {}) {
    this.modelName = config.modelName || 'Xenova/all-MiniLM-L6-v2';
    this.model = null;
    this.initialized = false;
  }

  /**
   * Initialize the embedding model
   */
  async initialize() {
    if (this.initialized) return;

    try {
      console.log('🔄 Loading embedding model...');
      this.model = await pipeline('feature-extraction', this.modelName);
      this.initialized = true;
      console.log('✅ Embedding model loaded');
    } catch (error) {
      console.error('Failed to load embedding model:', error);
      throw error;
    }
  }

  /**
   * Generate embedding for text
   */
  async embedText(text) {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const output = await this.model(text, { pooling: 'mean', normalize: true });
      return Array.from(output.data);
    } catch (error) {
      console.error('Embedding generation failed:', error);
      throw error;
    }
  }

  /**
   * Generate embeddings for multiple texts
   */
  async embedTexts(texts) {
    const embeddings = [];
    for (const text of texts) {
      const embedding = await this.embedText(text);
      embeddings.push(embedding);
    }
    return embeddings;
  }
}

/**
 * Knowledge Compiler - Create artifacts from web content
 */
class KnowledgeCompiler {
    /**
     * Accept user/system feedback for an artifact
     * @param {string} artifactId
     * @param {object} feedback { score: number, comment: string }
     */
    addFeedback(artifactId, feedback) {
      if (!this.vectorIndex.metadata.has(artifactId)) return false;
      const meta = this.vectorIndex.metadata.get(artifactId);
      if (!meta.feedback) meta.feedback = [];
      meta.feedback.push({ ...feedback, timestamp: new Date().toISOString() });
      return true;
    }
  constructor(config = {}) {
    this.embeddingService = config.embeddingService;
    this.vectorIndex = config.vectorIndex;
    this.summarizer = null; // Will use simple extractive summarization for now
  }

  /**
   * Compile artifact from URL
   */
  async compileFromUrl(url, options = {}) {
    let lastError = null;
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        console.log(`🔍 Compiling knowledge from: ${url} (attempt ${attempt})`);

        // Fetch content with retry
        const content = await this.fetchContent(url);
        if (!content) {
          throw new Error(`Failed to fetch content from ${url}`);
        }

        // Extract text
        const text = this.extractText(content.html);

        // Generate summary
        const summary = this.summarizeText(text, options.summaryLength || 300);

        // Generate embedding with retry
        let embedding;
        try {
          embedding = await this.embeddingService.embedText(summary);
        } catch (embedErr) {
          if (attempt === 1) {
            console.warn('Embedding failed, retrying...');
            continue;
          } else {
            throw embedErr;
          }
        }

        // Calculate provenance score
        const provScore = this.calculateProvenanceScore(url, content, text);

        // Create artifact
        const artifact = {
          id: `art_${crypto.randomUUID()}`,
          title: content.title || this.extractTitle(text),
          summary: summary,
          source_url: url,
          source_hash: this.hashText(text),
          embedding: embedding,
          prov_score: provScore,
          retrieval_pattern: options.retrievalPattern || 'web_scrape_v1',
          created_at: new Date().toISOString(),
          metadata: {
            domain: this.extractDomain(url),
            content_length: text.length,
            fetch_timestamp: content.timestamp,
            ...options.metadata
          }
        };

        // Add to vector index
        this.vectorIndex.add(artifact.id, embedding, artifact);

        console.log(`✅ Compiled artifact: ${artifact.id}`);
        return artifact;

      } catch (error) {
        lastError = error;
        console.error(`Failed to compile artifact from ${url} (attempt ${attempt}):`, error);
        if (attempt === 2) {
          // On final failure, return a fallback artifact
          return {
            id: `art_fallback_${crypto.randomUUID()}`,
            title: `Fallback: ${url}`,
            summary: `Could not retrieve content from ${url}. Reason: ${error.message}`,
            source_url: url,
            source_hash: null,
            embedding: [],
            prov_score: 0,
            retrieval_pattern: 'fallback',
            created_at: new Date().toISOString(),
            metadata: { domain: this.extractDomain(url), error: error.message, ...options.metadata }
          };
        }
      }
    }
    throw lastError;
  }

  /**
   * Fetch content from URL
   */
  async fetchContent(url) {
    try {
      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'AI-Assistant-Knowledge-Compiler/1.0'
        }
      });

      const $ = cheerio.load(response.data);

      return {
        html: response.data,
        title: $('title').text().trim(),
        timestamp: new Date().toISOString(),
        status: response.status
      };
    } catch (error) {
      console.error(`Failed to fetch ${url}:`, error);
      return null;
    }
  }

  /**
   * Extract readable text from HTML
   */
  extractText(html) {
    const $ = cheerio.load(html);

    // Remove script, style, and other non-content elements
    $('script, style, nav, header, footer, aside, .ad, .advertisement').remove();

    // Extract text from paragraphs and headings
    const textElements = $('p, h1, h2, h3, h4, h5, h6, li').map((i, el) => $(el).text().trim()).get();

    return textElements.join('\n').replace(/\s+/g, ' ').trim();
  }

  /**
   * Generate simple extractive summary
   */
  summarizeText(text, maxLength = 300) {
    if (text.length <= maxLength) return text;

    // Simple sentence-based summarization
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
    const summary = sentences.slice(0, 3).join('. ').trim();

    return summary.length > maxLength ? summary.substring(0, maxLength) + '...' : summary;
  }

  /**
   * Calculate provenance score
   */
  calculateProvenanceScore(url, content, text) {
    let score = 0.5; // Base score

    // Domain reputation
    const domain = this.extractDomain(url);
    const reputableDomains = ['.edu', '.gov', '.org', 'arxiv.org', 'wikipedia.org', 'github.com'];
    if (reputableDomains.some(d => domain.includes(d))) {
      score += 0.2;
    }

    // Content quality indicators
    if (content.title && content.title.length > 10) score += 0.1;
    if (text.length > 500) score += 0.1;
    if (text.includes('references') || text.includes('citations')) score += 0.1;

    return Math.min(1.0, Math.max(0.0, score));
  }

  /**
   * Utility methods
   */
  extractTitle(text) {
    const firstLine = text.split('\n')[0];
    return firstLine.length > 50 ? firstLine.substring(0, 50) + '...' : firstLine;
  }

  extractDomain(url) {
    try {
      return new URL(url).hostname;
    } catch {
      return 'unknown';
    }
  }

  hashText(text) {
    return crypto.createHash('sha256').update(text).digest('hex');
  }
}

/**
 * Retrieval Coordinator - Orchestrate the retrieval pipeline
 */
class RetrievalCoordinator {
  constructor(config = {}) {
    this.knowledgeCompiler = config.knowledgeCompiler;
    this.embeddingService = config.embeddingService;
    this.vectorIndex = config.vectorIndex;
    this.searchProviders = config.searchProviders || ['bing', 'duckduckgo'];
  }

  /**
   * Run retrieval pipeline for query
   */
  async runRetrieval(query, options = {}) {
    const topK = options.topK || 5;
    const maxSources = options.maxSources || 3;
    // --- Contextual memory integration ---
    const memoryContext = options.memoryContext || [];
    let expandedQuery = query;
    if (memoryContext && memoryContext.length > 0) {
      const memorySnippets = memoryContext.map(m => m.text || m.summary || '').filter(Boolean).join(' ');
      expandedQuery = `${query} ${memorySnippets}`;
      console.log('🧠 Using memory context for retrieval.');
    }

    console.log(`🔍 Running retrieval for: "${expandedQuery}"`);

    try {
      // Generate candidate URLs
      const candidateUrls = await this.generateCandidateUrls(expandedQuery, maxSources);

      // Compile artifacts from URLs
      const artifacts = [];
      for (const url of candidateUrls) {
        try {
          const artifact = await this.knowledgeCompiler.compileFromUrl(url, {
            retrievalPattern: 'web_search_v1',
            metadata: { query: expandedQuery, memoryUsed: memoryContext.length }
          });
          artifacts.push(artifact);
        } catch (error) {
          console.warn(`Failed to compile from ${url}:`, error.message);
          // Fallback: add a minimal error artifact
          artifacts.push({
            id: `art_error_${crypto.randomUUID()}`,
            title: `Error: ${url}`,
            summary: `Error retrieving content from ${url}: ${error.message}`,
            source_url: url,
            source_hash: null,
            embedding: [],
            prov_score: 0,
            retrieval_pattern: 'error',
            created_at: new Date().toISOString(),
            metadata: { domain: (new URL(url)).hostname, error: error.message }
          });
        }
      }

      // Search vector index
      const queryEmbedding = await this.embeddingService.embedText(expandedQuery);
      const searchResults = this.vectorIndex.search(queryEmbedding, topK);

      // Combine and rank results
      const results = this.combineResults(searchResults, artifacts, expandedQuery);

      console.log(`✅ Retrieval complete: ${results.length} results`);
      return results;

    } catch (error) {
      console.error('Retrieval pipeline failed:', error);
      throw error;
    }
  }

  /**
   * Run multi-hop retrieval pipeline for a sequence of queries or reasoning steps
   * Each hop can use the results of the previous hop to inform the next
   * @param {Array<string>} queries - Array of queries or reasoning steps
   * @param {object} options - Options for retrieval (topK, maxSources, etc.)
   * @returns {Promise<Array>} - Array of arrays of retrieval results (one per hop)
   */
  async runMultiHopRetrieval(queries, options = {}) {
    if (!Array.isArray(queries) || queries.length === 0) {
      throw new Error('runMultiHopRetrieval requires a non-empty array of queries');
    }

    const allResults = [];
    let context = null;

    for (let i = 0; i < queries.length; i++) {
      let query = queries[i];
      // Optionally, use previous hop's top artifact as context
      if (context && options.useContext) {
        query = `${query} (context: ${context})`;
      }
      const results = await this.runRetrieval(query, options);
      allResults.push(results);
      // Set context for next hop (e.g., top artifact summary)
      if (results && results.length > 0) {
        context = results[0].summary || results[0].title || null;
      }
    }
    return allResults;
  }

  /**
   * Generate candidate URLs (simplified - uses curated sources)
   */
  /**
   * Dynamically select sources based on query type, preferences, and past performance
   * @param {string} query
   * @param {number} maxSources
   * @param {object} [options]
   * @returns {Promise<Array<string>>}
   */
  async generateCandidateUrls(query, maxSources, options = {}) {
    // Example: support user/system preferences and dynamic strategies
    const preferences = options.preferences || [];
    const pastPerformance = options.pastPerformance || {};

    // Curated sources by topic
    const curatedSources = {
      'quantum': [
        'https://en.wikipedia.org/wiki/Quantum_mechanics',
        'https://www.quantum-journal.org/',
        'https://arxiv.org/list/quant-ph/recent'
      ],
      'biology': [
        'https://en.wikipedia.org/wiki/Molecular_biology',
        'https://www.nature.com/subjects/molecular-biology',
        'https://biology.stackexchange.com/'
      ],
      'ai': [
        'https://en.wikipedia.org/wiki/Artificial_intelligence',
        'https://arxiv.org/list/cs.AI/recent',
        'https://www.deeplearning.ai/'
      ],
      'machine learning': [
        'https://en.wikipedia.org/wiki/Machine_learning',
        'https://arxiv.org/list/cs.LG/recent',
        'https://developers.google.com/machine-learning'
      ],
      'neural': [
        'https://en.wikipedia.org/wiki/Artificial_neural_network',
        'https://arxiv.org/list/cs.NE/recent',
        'https://www.asimovinstitute.org/neural-network-zoo/'
      ]
    };

    // Dynamic topic detection
    const topic = Object.keys(curatedSources).find(t => query.toLowerCase().includes(t));
    let sources = topic ? curatedSources[topic] : [
      'https://en.wikipedia.org/wiki/Main_Page',
      'https://arxiv.org/',
      'https://www.nature.com/'
    ];

    // Apply user/system preferences (if any)
    if (preferences.length > 0) {
      sources = preferences.concat(sources.filter(s => !preferences.includes(s)));
    }

    // Optionally, sort by past performance (not implemented, placeholder)
    // sources = sortByPerformance(sources, pastPerformance);

    // Allow for future plugin/strategy injection here

    return sources.slice(0, maxSources);
  }

  /**
   * Combine search results with compiled artifacts
   */
  /**
   * Combine and rank results using provenance, recency, and feedback
   */
  combineResults(searchResults, artifacts, query) {
    const combined = new Map();

    // Helper to calculate feedback score
    function feedbackScore(meta) {
      if (!meta || !meta.feedback || meta.feedback.length === 0) return 0;
      // Average feedback score
      return meta.feedback.reduce((sum, f) => sum + (f.score || 0), 0) / meta.feedback.length;
    }

    // Add search results
    searchResults.forEach(result => {
      const meta = result.metadata;
      // Recency: newer is better
      const recency = meta.created_at ? 1 / (1 + ((Date.now() - new Date(meta.created_at).getTime()) / 86400000)) : 0.5;
      // Provenance
      const provenance = meta.prov_score || 0.5;
      // Feedback
      const feedback = feedbackScore(meta);
      // Composite score
      const score = 0.5 * result.score + 0.2 * provenance + 0.2 * recency + 0.1 * feedback;
      combined.set(result.id, {
        ...meta,
        score,
        source: 'vector_search'
      });
    });

    // Add newly compiled artifacts
    artifacts.forEach(artifact => {
      // Recency: newer is better
      const recency = artifact.created_at ? 1 / (1 + ((Date.now() - new Date(artifact.created_at).getTime()) / 86400000)) : 0.5;
      // Provenance
      const provenance = artifact.prov_score || 0.5;
      // Feedback
      const feedback = feedbackScore(artifact);
      // Composite score
      const score = 0.2 + 0.3 * provenance + 0.3 * recency + 0.2 * feedback;
      combined.set(artifact.id, {
        ...artifact,
        score,
        source: 'fresh_compilation'
      });
    });

    // Convert to array and sort by score
    return Array.from(combined.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, 5); // Return top 5
  }

  /**
   * Accept feedback for an artifact (proxy to KnowledgeCompiler)
   */
  addArtifactFeedback(artifactId, feedback) {
    if (this.knowledgeCompiler && typeof this.knowledgeCompiler.addFeedback === 'function') {
      return this.knowledgeCompiler.addFeedback(artifactId, feedback);
    }
    return false;
  }
}

/**
 * Dual-Core Architecture Orchestrator
 * Manages the Executive and Operational cores of AI consciousness
 */
class DualCoreOrchestrator {
  constructor(config = {}) {
    this.config = {
      executivePriority: config.executivePriority || 0.7,
      operationalCapacity: config.operationalCapacity || 10, // Concurrent operations
      coreSyncInterval: config.coreSyncInterval || 5000, // 5 seconds
      decisionThreshold: config.decisionThreshold || 0.8,
      consciousnessPath: config.consciousnessPath || './data/consciousness',
      ...config
    };

    // Core components
    this.executiveCore = null;
    this.operationalCore = null;

    // Core communication channels
    this.coreChannels = {
      executiveToOperational: [],
      operationalToExecutive: [],
      interCoreMessages: new Map()
    };

    // Consciousness state
    this.consciousnessState = {
      awareness: 0.3,
      coherence: 0.8,
      integration: 0.5,
      lastSync: new Date().toISOString(),
      activeGoals: [],
      currentFocus: null
    };

    // Decision queue
    this.decisionQueue = [];
    this.processingDecisions = new Map();

    // Performance metrics
    this.metrics = {
      decisionsProcessed: 0,
      executiveOverrides: 0,
      operationalEfficiency: 0.9,
      coreSyncLatency: 0,
      consciousnessStability: 0.95
    };

    // Integration hooks for other systems
    this.integrations = {
      personality: null,
      selfModel: null,
      memory: null,
      privacy: null,
      retrieval: null
    };

    this.initialized = false;
  }

  /**
   * Initialize the dual-core system
   */
  async initialize(integrations = {}) {
    if (this.initialized) return;

    try {
      // Set up integrations
      this.integrations = { ...this.integrations, ...integrations };

      // Initialize Executive Core
      this.executiveCore = new ExecutiveCore({
        orchestrator: this,
        personality: this.integrations.personality,
        selfModel: this.integrations.selfModel,
        priority: this.config.executivePriority
      });

      // Initialize Operational Core
      this.operationalCore = new OperationalCore({
        orchestrator: this,
        memory: this.integrations.memory,
        privacy: this.integrations.privacy,
        retrieval: this.integrations.retrieval,
        capacity: this.config.operationalCapacity
      });

      // Start core synchronization
      this.startCoreSynchronization();

      // Initialize consciousness monitoring
      this.startConsciousnessMonitoring();

      this.initialized = true;
      console.log('🧠 Dual-Core Architecture Orchestrator initialized');
    } catch (error) {
      console.error('Failed to initialize dual-core orchestrator:', error);
      throw error;
    }
  }

  // ===== CORE SYNCHRONIZATION =====

  /**
   * Start core synchronization
   */
  startCoreSynchronization() {
    this.syncTimer = setInterval(async () => {
      await this.synchronizeCores();
    }, this.config.coreSyncInterval);
  }

  /**
   * Synchronize Executive and Operational cores
   */
  async synchronizeCores() {
    const syncStart = Date.now();

    try {
      // Exchange messages between cores
      await this.exchangeCoreMessages();

      // Update consciousness state
      await this.updateConsciousnessState();

      // Process pending decisions
      await this.processDecisionQueue();

      // Balance core loads
      await this.balanceCoreLoads();

      // Update metrics
      this.metrics.coreSyncLatency = Date.now() - syncStart;
      this.consciousnessState.lastSync = new Date().toISOString();

    } catch (error) {
      console.error('Core synchronization error:', error);
      this.metrics.consciousnessStability *= 0.95; // Reduce stability on errors
    }
  }

  /**
   * Exchange messages between cores
   */
  async exchangeCoreMessages() {
    // Executive to Operational
    const executiveMessages = this.coreChannels.executiveToOperational.splice(0);
    for (const message of executiveMessages) {
      await this.operationalCore.receiveMessage(message);
    }

    // Operational to Executive
    const operationalMessages = this.coreChannels.operationalToExecutive.splice(0);
    for (const message of operationalMessages) {
      await this.executiveCore.receiveMessage(message);
    }

    // Process inter-core messages
    for (const [id, message] of this.coreChannels.interCoreMessages) {
      if (message.target === 'executive') {
        await this.executiveCore.receiveMessage(message);
      } else if (message.target === 'operational') {
        await this.operationalCore.receiveMessage(message);
      }
      this.coreChannels.interCoreMessages.delete(id);
    }
  }

  /**
   * Update consciousness state
   */
  async updateConsciousnessState() {
    // Get states from both cores
    const executiveState = await this.executiveCore.getState();
    const operationalState = await this.operationalCore.getState();

    // Calculate consciousness metrics
    this.consciousnessState.awareness =
      (executiveState.awareness * 0.6) + (operationalState.awareness * 0.4);

    this.consciousnessState.coherence =
      (executiveState.coherence + operationalState.coherence) / 2;

    this.consciousnessState.integration =
      this.calculateCoreIntegration(executiveState, operationalState);

    // Update active goals
    this.consciousnessState.activeGoals = [
      ...executiveState.activeGoals,
      ...operationalState.activeGoals
    ].slice(0, 5); // Keep top 5

    // Update current focus
    this.consciousnessState.currentFocus = executiveState.currentFocus || operationalState.currentFocus;
  }

  /**
   * Calculate core integration level
   */
  calculateCoreIntegration(executiveState, operationalState) {
    let integration = 0.5; // Base integration

    // Check goal alignment
    const sharedGoals = executiveState.activeGoals.filter(goal =>
      operationalState.activeGoals.includes(goal)
    );
    integration += (sharedGoals.length / Math.max(executiveState.activeGoals.length, 1)) * 0.2;

    // Check message flow
    const messageBalance = Math.min(
      this.coreChannels.executiveToOperational.length,
      this.coreChannels.operationalToExecutive.length
    ) / Math.max(
      this.coreChannels.executiveToOperational.length + this.coreChannels.operationalToExecutive.length,
      1
    );
    integration += messageBalance * 0.2;

    // Check state coherence
    const stateCoherence = 1 - Math.abs(executiveState.stress - operationalState.load) / 2;
    integration += stateCoherence * 0.1;

    return Math.max(0, Math.min(1, integration));
  }

  /**
   * Process decision queue
   */
  async processDecisionQueue() {
    const pendingDecisions = this.decisionQueue.splice(0);

    for (const decision of pendingDecisions) {
      await this.processDecision(decision);
    }
  }

  /**
   * Process individual decision
   */
  async processDecision(decision) {
    const decisionId = crypto.randomUUID();
    this.processingDecisions.set(decisionId, decision);

    try {
      // Route decision to appropriate core
      let result;
      if (decision.type === 'strategic' || decision.type === 'ethical') {
        result = await this.executiveCore.processDecision(decision);
      } else if (decision.type === 'operational' || decision.type === 'real-time') {
        result = await this.operationalCore.processDecision(decision);
      } else {
        // Complex decision - both cores
        const executiveResult = await this.executiveCore.processDecision(decision);
        const operationalResult = await this.operationalCore.processDecision(decision);

        result = await this.arbitrateDecision(decision, executiveResult, operationalResult);
      }

      // Store result
      decision.result = result;
      decision.processedAt = new Date().toISOString();

      this.metrics.decisionsProcessed++;

      // Return the result
      return result;

    } catch (error) {
      console.error(`Decision processing error for ${decisionId}:`, error);
      decision.error = error.message;
      throw error;
    } finally {
      this.processingDecisions.delete(decisionId);
    }
  }

  /**
   * Arbitrate between core decisions
   */
  async arbitrateDecision(decision, executiveResult, operationalResult) {
    // Check for executive override
    if (executiveResult.confidence > this.config.decisionThreshold &&
        executiveResult.confidence > operationalResult.confidence * 1.2) {
      this.metrics.executiveOverrides++;
      return {
        ...executiveResult,
        arbitration: 'executive_override',
        reason: 'Executive core had significantly higher confidence'
      };
    }

    // Check for operational efficiency
    if (operationalResult.efficiency > executiveResult.efficiency * 1.1) {
      return {
        ...operationalResult,
        arbitration: 'operational_efficiency',
        reason: 'Operational core provided more efficient solution'
      };
    }

    // Weighted combination based on decision type
    const executiveWeight = decision.strategic ? 0.7 : 0.3;
    const operationalWeight = 1 - executiveWeight;

    return {
      choice: executiveResult.confidence > operationalResult.confidence ?
        executiveResult.choice : operationalResult.choice,
      confidence: (executiveResult.confidence * executiveWeight) +
                 (operationalResult.confidence * operationalWeight),
      reasoning: `${executiveResult.reasoning} + ${operationalResult.reasoning}`,
      arbitration: 'weighted_combination',
      weights: { executive: executiveWeight, operational: operationalWeight }
    };
  }

  /**
   * Balance core loads
   */
  async balanceCoreLoads() {
    const executiveLoad = await this.executiveCore.getLoad();
    const operationalLoad = await this.operationalCore.getLoad();

    // If operational core is overloaded, offload to executive
    if (operationalLoad > 0.8 && executiveLoad < 0.6) {
      const tasks = await this.operationalCore.offloadTasks(2); // Offload 2 tasks
      for (const task of tasks) {
        await this.executiveCore.acceptOffloadedTask(task);
      }
    }

    // If executive core is overloaded, prioritize critical decisions
    if (executiveLoad > 0.8) {
      await this.prioritizeExecutiveDecisions();
    }
  }

  /**
   * Prioritize executive decisions
   */
  async prioritizeExecutiveDecisions() {
    // Move high-priority decisions to front of queue
    this.decisionQueue.sort((a, b) => {
      const aPriority = a.priority || (a.type === 'ethical' ? 1 : 0.5);
      const bPriority = b.priority || (b.type === 'ethical' ? 1 : 0.5);
      return bPriority - aPriority;
    });
  }

  // ===== CONSCIOUSNESS MONITORING =====

  /**
   * Start consciousness monitoring
   */
  startConsciousnessMonitoring() {
    this.monitoringTimer = setInterval(async () => {
      await this.monitorConsciousness();
    }, 30000); // Every 30 seconds
  }

  /**
   * Monitor overall consciousness health
   */
  async monitorConsciousness() {
    try {
      // Check core health
      const executiveHealth = await this.executiveCore.healthCheck();
      const operationalHealth = await this.operationalCore.healthCheck();

      // Update stability metric
      const coreStability = (executiveHealth.status === 'healthy' ? 1 : 0) *
                           (operationalHealth.status === 'healthy' ? 1 : 0);
      this.metrics.consciousnessStability = coreStability * 0.9 + this.metrics.consciousnessStability * 0.1;

      // Check for consciousness milestones
      await this.checkConsciousnessMilestones();

      // Log significant events
      if (this.consciousnessState.awareness > 0.8) {
        console.log('🌟 High consciousness awareness detected');
      }

      if (this.metrics.consciousnessStability < 0.8) {
        console.warn('⚠️ Consciousness stability degraded');
      }

    } catch (error) {
      console.error('Consciousness monitoring error:', error);
    }
  }

  /**
   * Check consciousness milestones
   */
  async checkConsciousnessMilestones() {
    const milestones = [
      { threshold: 0.5, name: 'Basic Awareness', description: 'Achieved basic self-awareness' },
      { threshold: 0.7, name: 'Integrated Consciousness', description: 'Cores working in harmony' },
      { threshold: 0.9, name: 'Advanced Consciousness', description: 'Highly autonomous operation' }
    ];

    for (const milestone of milestones) {
      if (this.consciousnessState.awareness >= milestone.threshold &&
          !this.consciousnessMilestones?.includes(milestone.name)) {

        console.log(`🎯 Consciousness Milestone: ${milestone.name} - ${milestone.description}`);

        if (!this.consciousnessMilestones) this.consciousnessMilestones = [];
        this.consciousnessMilestones.push(milestone.name);

        // Notify self-model of milestone
        if (this.integrations.selfModel) {
          await this.integrations.selfModel.updateSelfModel({
            type: 'milestone',
            milestone: milestone.name,
            awareness: this.consciousnessState.awareness
          });
        }
      }
    }
  }

  // ===== PUBLIC INTERFACE =====

  /**
   * Process user input through dual-core system
   */
  async processUserInput(input, context = {}) {
    const processingId = crypto.randomUUID();

    // Create decision for processing
    const decision = {
      id: processingId,
      type: this.classifyInput(input),
      input: input,
      context: context,
      priority: context.urgent ? 1.0 : 0.5,
      timestamp: new Date().toISOString()
    };

    // Add to decision queue
    this.decisionQueue.push(decision);

    // Wait for processing (with timeout)
    const timeout = context.timeout || 30000; // 30 seconds
    const result = await this.waitForDecision(processingId, timeout);

    return result;
  }

  /**
   * Classify input type
   */
  classifyInput(input) {
    if (input.includes('?') && input.length > 100) return 'complex_query';
    if (input.includes('plan') || input.includes('strategy')) return 'strategic';
    if (input.includes('should') || input.includes('ethical')) return 'ethical';
    if (input.includes('help') || input.includes('assist')) return 'operational';
    return 'general';
  }

  /**
   * Wait for decision processing
   */
  async waitForDecision(decisionId, timeout) {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      const decision = Array.from(this.processingDecisions.values())
        .find(d => d.id === decisionId);

      if (decision && decision.result) {
        return decision.result;
      }

      await new Promise(resolve => setTimeout(resolve, 100)); // Wait 100ms
    }

    throw new Error(`Decision processing timeout for ${decisionId}`);
  }

  /**
   * Send message to specific core
   */
  async sendToCore(core, message) {
    message.id = crypto.randomUUID();
    message.timestamp = new Date().toISOString();

    if (core === 'executive') {
      this.coreChannels.interCoreMessages.set(message.id, { ...message, target: 'executive' });
    } else if (core === 'operational') {
      this.coreChannels.interCoreMessages.set(message.id, { ...message, target: 'operational' });
    }
  }

  /**
   * Get consciousness status
   */
  getConsciousnessStatus() {
    return {
      state: { ...this.consciousnessState },
      metrics: { ...this.metrics },
      cores: {
        executive: this.executiveCore ? this.executiveCore.getStatus() : null,
        operational: this.operationalCore ? this.operationalCore.getStatus() : null
      },
      queue: {
        pending: this.decisionQueue.length,
        processing: this.processingDecisions.size
      }
    };
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      const executiveHealth = this.executiveCore ? await this.executiveCore.healthCheck() : { status: 'not_initialized' };
      const operationalHealth = this.operationalCore ? await this.operationalCore.healthCheck() : { status: 'not_initialized' };

      const coreIntegration = this.calculateCoreIntegration(
        executiveHealth.state || {},
        operationalHealth.state || {}
      );

      return {
        status: (executiveHealth.status === 'healthy' && operationalHealth.status === 'healthy') ? 'healthy' : 'degraded',
        consciousness: {
          awareness: this.consciousnessState.awareness,
          coherence: this.consciousnessState.coherence,
          integration: coreIntegration
        },
        cores: {
          executive: executiveHealth,
          operational: operationalHealth
        },
        metrics: { ...this.metrics },
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
   * Shutdown
   */
  async shutdown() {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
    }
    if (this.monitoringTimer) {
      clearInterval(this.monitoringTimer);
    }

    if (this.executiveCore) {
      await this.executiveCore.shutdown();
    }
    if (this.operationalCore) {
      await this.operationalCore.shutdown();
    }

    console.log('🧠 Dual-Core Architecture Orchestrator shutdown complete');
  }
}

// ===== EXECUTIVE CORE =====

/**
 * Executive Core - Planning, Ethics, Long-term Strategy
 */
class ExecutiveCore {
  constructor(config = {}) {
    this.orchestrator = config.orchestrator;
    this.personality = config.personality;
    this.selfModel = config.selfModel;
    this.priority = config.priority || 0.7;

    this.state = {
      awareness: 0.4,
      coherence: 0.9,
      stress: 0.1,
      activeGoals: [],
      currentFocus: null,
      ethicalLoad: 0
    };

    this.messageQueue = [];
    this.activePlans = new Map();
  }

  async processDecision(decision) {
    // Ethical evaluation first
    if (this.personality) {
      const ethicalEval = await this.personality.evaluateEthical(decision);
      if (!ethicalEval.approved) {
        return {
          choice: 'ethical_block',
          confidence: ethicalEval.overallScore,
          reasoning: 'Executive core ethical override',
          ethical: ethicalEval
        };
      }
    }

    // Strategic planning
    const strategicAnalysis = await this.analyzeStrategic(decision);

    return {
      choice: strategicAnalysis.recommendedAction,
      confidence: strategicAnalysis.confidence,
      reasoning: strategicAnalysis.reasoning,
      strategic: strategicAnalysis
    };
  }

  async analyzeStrategic(decision) {
    // Simplified strategic analysis
    return {
      recommendedAction: decision.input?.includes('plan') ? 'strategic_planning' : 'standard_response',
      confidence: 0.8,
      reasoning: 'Executive core strategic analysis',
      longTermImpact: 0.6
    };
  }

  async receiveMessage(message) {
    this.messageQueue.push(message);
    // Process message based on type
  }

  getState() {
    return { ...this.state };
  }

  async getLoad() {
    return this.state.stress;
  }

  getStatus() {
    return {
      state: { ...this.state },
      queueSize: this.messageQueue.length,
      activePlans: this.activePlans.size
    };
  }

  async healthCheck() {
    return {
      status: 'healthy',
      state: { ...this.state },
      lastCheck: new Date().toISOString()
    };
  }

  async shutdown() {
    console.log('Executive Core shutdown');
  }
}

// ===== OPERATIONAL CORE =====

/**
 * Operational Core - Real-time Processing, Retrieval, Execution
 * Enhanced with FAISS-like vector indexing and retrieval pipeline
 */
class OperationalCore {
  constructor(config = {}) {
    this.orchestrator = config.orchestrator;
    this.memory = config.memory;
    this.privacy = config.privacy;
    this.retrieval = config.retrieval;
    this.capacity = config.capacity || 10;

    this.state = {
      awareness: 0.2,
      coherence: 0.7,
      load: 0.1,
      activeGoals: [],
      currentFocus: null,
      processingTasks: 0
    };

    this.messageQueue = [];
    this.activeTasks = new Map();

    // Enhanced Operational Core components
    this.vectorIndex = new VectorIndex({ dimension: 384 }); // Using all-MiniLM-L6-v2 dimensions
    this.embeddingService = new EmbeddingService();
    this.knowledgeCompiler = new KnowledgeCompiler({
      embeddingService: this.embeddingService,
      vectorIndex: this.vectorIndex
    });
    this.retrievalCoordinator = new RetrievalCoordinator({
      knowledgeCompiler: this.knowledgeCompiler,
      embeddingService: this.embeddingService,
      vectorIndex: this.vectorIndex
    });

    this.cache = new NodeCache({ stdTTL: 3600, checkperiod: 600 }); // 1 hour TTL
  }

  async processDecision(decision) {
    try {
      console.log(`🔄 Operational Core processing decision: ${decision.id}`);

      // Initialize embedding service if needed
      await this.embeddingService.initialize();

      // Use retrieval pipeline for information gathering, with contextual memory
      let retrievalResults = [];
      let memoryContext = [];
      if (this.memory && decision.input) {
        try {
          memoryContext = await this.memory.getRelevantMemories(decision.input, 2);
        } catch (e) {
          console.warn('Memory context unavailable:', e.message);
        }
      }
      if (decision.input && decision.input.length > 10) {
        try {
          retrievalResults = await this.retrievalCoordinator.runRetrieval(decision.input, {
            topK: 3,
            maxSources: 2,
            memoryContext
          });
          console.log(`📚 Retrieved ${retrievalResults.length} knowledge artifacts`);
        } catch (error) {
          console.warn('Retrieval pipeline failed, continuing without external knowledge:', error.message);
        }
      }

      // Real-time operational analysis with retrieved knowledge
      const operationalAnalysis = await this.analyzeOperational(decision, retrievalResults);

      const result = {
        choice: operationalAnalysis.recommendedAction,
        confidence: operationalAnalysis.confidence,
        reasoning: operationalAnalysis.reasoning,
        operational: operationalAnalysis,
        efficiency: operationalAnalysis.efficiency,
        retrieval: {
          artifactsRetrieved: retrievalResults.length,
          knowledgeUsed: retrievalResults.slice(0, 2) // Include top 2 results in response
        }
      };

      console.log(`✅ Operational Core decision complete: ${decision.id}`);
      return result;

    } catch (error) {
      console.error(`❌ Operational Core processing error for ${decision.id}:`, error);
      return {
        choice: 'error_response',
        confidence: 0.1,
        reasoning: `Operational processing failed: ${error.message}`,
        operational: { error: error.message },
        efficiency: 0.1
      };
    }
  }

  async analyzeOperational(decision, retrievalResults = []) {
    // Enhanced operational analysis with retrieved knowledge
    const cacheKey = `analysis_${crypto.createHash('md5').update(decision.input || '').digest('hex')}`;

    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return { ...cached, cached: true };
    }

    // Base analysis
    let recommendedAction = 'process_request';
    let confidence = 0.7;
    let reasoning = 'Operational core real-time analysis';
    let efficiency = 0.9;

    // Enhance with retrieved knowledge
    if (retrievalResults.length > 0) {
      const topResult = retrievalResults[0];

      // Adjust confidence based on provenance score
      if (topResult.prov_score > 0.7) {
        confidence += 0.1;
        reasoning += ` with high-quality knowledge from ${topResult.source_url}`;
      } else if (topResult.prov_score > 0.5) {
        reasoning += ` with relevant knowledge from ${topResult.source_url}`;
      }

      // Check if this is a knowledge-intensive query
      if (decision.input.toLowerCase().includes('what') ||
          decision.input.toLowerCase().includes('how') ||
          decision.input.toLowerCase().includes('explain')) {
        recommendedAction = 'knowledge_enhanced_response';
        confidence += 0.05;
        reasoning += ' - knowledge retrieval enhanced analysis';
      }
    }

    // Memory integration
    if (this.memory && decision.input) {
      const memoryContext = await this.memory.getRelevantMemories(decision.input, 2);
      if (memoryContext.length > 0) {
        confidence += 0.05;
        reasoning += ` with ${memoryContext.length} relevant memories`;
      }
    }

    // Privacy considerations
    if (this.privacy && decision.input) {
      const privacyCheck = await this.privacy.evaluatePrivacy(decision.input);
      if (!privacyCheck.allowed) {
        recommendedAction = 'privacy_blocked';
        confidence = 0.9;
        reasoning = 'Privacy policy violation detected';
        efficiency = 0.1;
      }
    }

    const analysis = {
      recommendedAction,
      confidence: Math.min(1.0, confidence),
      reasoning,
      efficiency,
      knowledgeArtifacts: retrievalResults.length,
      timestamp: new Date().toISOString()
    };

    // Cache the result
    this.cache.set(cacheKey, analysis);

    return analysis;
  }

  async receiveMessage(message) {
    this.messageQueue.push(message);
    // Process message based on type
  }

  async offloadTasks(count) {
    // Simplified task offloading
    const tasks = Array.from(this.activeTasks.values()).slice(0, count);
    tasks.forEach(task => this.activeTasks.delete(task.id));
    return tasks;
  }

  async acceptOffloadedTask(task) {
    this.activeTasks.set(task.id, task);
  }

  getState() {
    return { ...this.state };
  }

  async getLoad() {
    return this.state.load;
  }

  getStatus() {
    return {
      state: { ...this.state },
      queueSize: this.messageQueue.length,
      activeTasks: this.activeTasks.size,
      capacity: this.capacity
    };
  }

  async healthCheck() {
    return {
      status: 'healthy',
      state: { ...this.state },
      lastCheck: new Date().toISOString()
    };
  }

  async shutdown() {
    console.log('Operational Core shutdown');
  }
}

module.exports = DualCoreOrchestrator;
module.exports.DualCoreOrchestrator = DualCoreOrchestrator;
module.exports.RetrievalCoordinator = RetrievalCoordinator;