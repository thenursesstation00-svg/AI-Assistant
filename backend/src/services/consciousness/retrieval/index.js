/**
 * Information Retrieval Cognitive Loop
 * Main orchestrator for the retrieval system
 *
 * This is the first component of AI Consciousness Evolution
 */

const RetrievalEngine = require('./engine');
const KnowledgeCompiler = require('./compiler');
const ValidationLayer = require('./validation');

/**
 * Information Retrieval Cognitive Loop
 * Continuous learning cycle that fetches, processes, and integrates global knowledge
 */
class InformationRetrievalLoop {
  constructor(config = {}) {
    this.config = {
      maxIterations: config.maxIterations || 5,
      convergenceThreshold: config.convergenceThreshold || 0.8,
      learningRate: config.learningRate || 0.1,
      ...config
    };

    // Initialize components
    this.retrievalEngine = new RetrievalEngine(config.retrieval || {});
    this.knowledgeCompiler = new KnowledgeCompiler(config.compiler || {});
    this.validationLayer = new ValidationLayer(config.validation || {});

    // Learning state
    this.iterationHistory = [];
    this.knowledgeState = new Map();
    this.performanceMetrics = {
      retrievalAccuracy: 0,
      compilationEfficiency: 0,
      validationQuality: 0,
      overallLearning: 0
    };

    this.initialized = false;
  }

  /**
   * Initialize the retrieval system
   */
  async initialize() {
    if (this.initialized) return;

    try {
      // Initialize components if they have initialize methods
      if (typeof this.retrievalEngine.initialize === 'function') {
        await this.retrievalEngine.initialize();
      }
      if (typeof this.knowledgeCompiler.initialize === 'function') {
        await this.knowledgeCompiler.initialize();
      }
      if (typeof this.validationLayer.initialize === 'function') {
        await this.validationLayer.initialize();
      }

      this.initialized = true;
      console.log('🔍 Information Retrieval Cognitive Loop initialized');
    } catch (error) {
      console.error('Failed to initialize retrieval system:', error);
      throw error;
    }
  }

  /**
   * Execute the complete cognitive loop
   */
  async execute(query, context = {}) {
    const loopId = this.generateLoopId();
    const startTime = Date.now();

    console.log(`🔄 Starting Information Retrieval Cognitive Loop: ${loopId}`);

    try {
      let currentQuery = query;
      let iteration = 0;
      let converged = false;
      const loopResults = [];

      while (iteration < this.config.maxIterations && !converged) {
        console.log(`📊 Iteration ${iteration + 1}/${this.config.maxIterations}`);

        // Step 1: Retrieve information
        const retrievalResult = await this.retrievalEngine.multiSourceSearch(
          currentQuery,
          context.searchOptions || {}
        );

        // Step 2: Validate sources
        const validationResult = await this.validationLayer.validate(
          retrievalResult,
          context
        );

        // Step 3: Filter and rank sources
        const filteredSources = this.filterValidatedSources(
          retrievalResult,
          validationResult
        );

        // Step 4: Compile knowledge
        const compilationResult = await this.knowledgeCompiler.compile(
          filteredSources,
          context
        );

        // Step 5: Assess convergence
        const iterationResult = {
          iteration: iteration + 1,
          query: currentQuery,
          retrieval: {
            sourcesFound: retrievalResult.length,
            validatedSources: validationResult.results.length
          },
          validation: validationResult.summary,
          compilation: {
            concepts: compilationResult.concepts.length,
            abstractions: compilationResult.abstractions.length
          },
          knowledge: compilationResult.abstractions
        };

        loopResults.push(iterationResult);

        // Check for convergence
        converged = this.assessConvergence(loopResults);

        // Update query for next iteration if needed
        if (!converged && iteration < this.config.maxIterations - 1) {
          currentQuery = await this.refineQuery(currentQuery, iterationResult);
        }

        iteration++;
      }

      // Final knowledge integration
      const finalKnowledge = await this.integrateKnowledge(loopResults);

      // Update learning metrics
      await this.updateLearningMetrics(loopResults);

      const executionTime = Date.now() - startTime;

      const result = {
        loopId,
        query: query,
        iterations: loopResults.length,
        converged,
        knowledge: finalKnowledge,
        metrics: {
          executionTime,
          ...this.performanceMetrics
        },
        history: loopResults,
        timestamp: new Date().toISOString()
      };

      // Store in history
      this.iterationHistory.push(result);

      console.log(`✅ Cognitive Loop completed: ${loopId} (${executionTime}ms)`);

      return result;

    } catch (error) {
      console.error(`❌ Cognitive Loop failed: ${loopId}`, error);
      throw new Error(`Information Retrieval Cognitive Loop failed: ${error.message}`);
    }
  }

  /**
   * Filter sources based on validation results
   */
  filterValidatedSources(retrievalResults, validationResults) {
    const validatedMap = new Map(
      validationResults.results.map(r => [r.url, r])
    );

    return retrievalResults
      .filter(source => {
        const validation = validatedMap.get(source.url);
        return validation && validation.overallScore >= this.config.credibilityThreshold;
      })
      .map(source => {
        const validation = validatedMap.get(source.url);
        return {
          ...source,
          validation: {
            credibility: validation.credibility,
            bias: validation.bias,
            overallScore: validation.overallScore
          }
        };
      })
      .sort((a, b) => b.validation.overallScore - a.validation.overallScore);
  }

  /**
   * Assess if the loop has converged on sufficient knowledge
   */
  assessConvergence(loopResults) {
    if (loopResults.length < 2) return false;

    const latest = loopResults[loopResults.length - 1];
    const previous = loopResults[loopResults.length - 2];

    // Convergence criteria
    const knowledgeGrowth = latest.compilation.abstractions - previous.compilation.abstractions;
    const qualityImprovement = latest.validation.averageCredibility - previous.validation.averageCredibility;

    const convergenceScore = (
      (knowledgeGrowth > 0 ? 0.4 : 0) +
      (qualityImprovement > 0.05 ? 0.3 : 0) +
      (latest.compilation.abstractions >= 3 ? 0.3 : 0)
    );

    return convergenceScore >= this.config.convergenceThreshold;
  }

  /**
   * Refine query for next iteration based on current results
   */
  async refineQuery(currentQuery, iterationResult) {
    // Simple query refinement - in production, use LLM
    const concepts = iterationResult.compilation?.concepts || [];
    const topConcepts = concepts
      .slice(0, 3)
      .map(c => c.term);

    if (topConcepts.length > 0) {
      return `${currentQuery} ${topConcepts.join(' ')}`;
    }

    return currentQuery;
  }

  /**
   * Integrate knowledge from all iterations
   */
  async integrateKnowledge(loopResults) {
    const allAbstractions = [];
    const conceptFrequency = new Map();

    // Collect all abstractions and track concept frequency
    for (const result of loopResults) {
      allAbstractions.push(...result.knowledge);

      const concepts = result.compilation?.concepts || [];
      concepts.forEach(concept => {
        conceptFrequency.set(
          concept.term,
          (conceptFrequency.get(concept.term) || 0) + 1
        );
      });
    }

    // Deduplicate and rank abstractions
    const uniqueAbstractions = this.deduplicateAbstractions(allAbstractions);

    // Calculate confidence based on iteration consistency
    const finalKnowledge = uniqueAbstractions.map(abstraction => ({
      ...abstraction,
      confidence: this.calculateKnowledgeConfidence(abstraction, loopResults),
      iterationsPresent: this.countIterationsWithAbstraction(abstraction, loopResults)
    }));

    return {
      abstractions: finalKnowledge.sort((a, b) => b.confidence - a.confidence),
      concepts: Array.from(conceptFrequency.entries())
        .map(([concept, frequency]) => ({ term: concept, frequency }))
        .sort((a, b) => b.frequency - a.frequency),
      summary: {
        totalAbstractions: finalKnowledge.length,
        totalConcepts: conceptFrequency.size,
        averageConfidence: finalKnowledge.reduce((sum, a) => sum + a.confidence, 0) / finalKnowledge.length
      }
    };
  }

  /**
   * Update learning metrics based on loop performance
   */
  async updateLearningMetrics(loopResults) {
    const latest = loopResults[loopResults.length - 1];

    // Update metrics with exponential moving average
    const alpha = this.config.learningRate;

    this.performanceMetrics.retrievalAccuracy =
      alpha * (latest.retrieval.validatedSources / latest.retrieval.sourcesFound) +
      (1 - alpha) * this.performanceMetrics.retrievalAccuracy;

    this.performanceMetrics.compilationEfficiency =
      alpha * (latest.compilation.abstractions / Math.max(latest.retrieval.validatedSources, 1)) +
      (1 - alpha) * this.performanceMetrics.compilationEfficiency;

    this.performanceMetrics.validationQuality =
      alpha * latest.validation.averageCredibility +
      (1 - alpha) * this.performanceMetrics.validationQuality;

    this.performanceMetrics.overallLearning =
      (this.performanceMetrics.retrievalAccuracy +
       this.performanceMetrics.compilationEfficiency +
       this.performanceMetrics.validationQuality) / 3;
  }

  // Helper methods

  generateLoopId() {
    return `irl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  deduplicateAbstractions(abstractions) {
    const seen = new Set();
    return abstractions.filter(abstraction => {
      const key = abstraction.id || abstraction.title;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  calculateKnowledgeConfidence(abstraction, loopResults) {
    // Base confidence from abstraction level
    let confidence = 0.5;
    if (abstraction.level === 'high') confidence += 0.3;
    else if (abstraction.level === 'medium') confidence += 0.2;
    else if (abstraction.level === 'low') confidence += 0.1;

    // Boost confidence based on iterations present
    const iterationsPresent = this.countIterationsWithAbstraction(abstraction, loopResults);
    confidence += (iterationsPresent / loopResults.length) * 0.2;

    return Math.min(1, confidence);
  }

  countIterationsWithAbstraction(abstraction, loopResults) {
    return loopResults.filter(result =>
      result.knowledge.some(k => k.id === abstraction.id || k.title === abstraction.title)
    ).length;
  }

  /**
   * Query existing knowledge
   */
  async queryKnowledge(concept, options = {}) {
    const {
      maxResults = 10,
      minConfidence = 0.3,
      includeConcepts = true
    } = options;

    // Query knowledge graph
    const graphResults = await this.knowledgeCompiler.queryKnowledge(concept, 2);

    // Filter and rank results
    const filtered = graphResults
      .filter(item => item.data.confidence >= minConfidence)
      .sort((a, b) => b.data.confidence - a.data.confidence)
      .slice(0, maxResults);

    const result = {
      query: concept,
      results: filtered,
      totalFound: graphResults.length,
      filteredCount: filtered.length
    };

    if (includeConcepts) {
      result.relatedConcepts = await this.findRelatedConcepts(concept, filtered);
    }

    return result;
  }

  async findRelatedConcepts(concept, knowledgeResults) {
    const related = new Set();

    for (const result of knowledgeResults) {
      if (result.data.concepts) {
        result.data.concepts.forEach(c => {
          if (c !== concept) related.add(c);
        });
      }
    }

    return Array.from(related).slice(0, 10);
  }

  /**
   * Get learning statistics
   */
  getLearningStats() {
    const totalLoops = this.iterationHistory.length;
    const avgIterations = totalLoops > 0 ?
      this.iterationHistory.reduce((sum, loop) => sum + loop.iterations, 0) / totalLoops : 0;

    const convergenceRate = totalLoops > 0 ?
      this.iterationHistory.filter(loop => loop.converged).length / totalLoops : 0;

    return {
      totalLoops,
      averageIterations: avgIterations,
      convergenceRate,
      performanceMetrics: this.performanceMetrics,
      knowledgeGraphSize: this.knowledgeCompiler.knowledgeGraph.size,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Health check for the cognitive loop
   */
  async healthCheck() {
    try {
      const componentChecks = await Promise.all([
        this.retrievalEngine.healthCheck(),
        this.knowledgeCompiler.healthCheck(),
        this.validationLayer.healthCheck()
      ]);

      const allHealthy = componentChecks.every(check => check.status === 'healthy');

      return {
        status: allHealthy ? 'healthy' : 'degraded',
        components: {
          retrieval: componentChecks[0],
          compiler: componentChecks[1],
          validation: componentChecks[2]
        },
        loopStats: this.getLearningStats(),
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
   * Reset learning state (for testing/debugging)
   */
  reset() {
    this.iterationHistory = [];
    this.knowledgeState.clear();
    this.performanceMetrics = {
      retrievalAccuracy: 0,
      compilationEfficiency: 0,
      validationQuality: 0,
      overallLearning: 0
    };

    // Reset components
    this.knowledgeCompiler.knowledgeGraph.clear();
    this.validationLayer.credibilityCache.clear();
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      // Test basic functionality
      const testQuery = "test query";
      const result = await this.execute(testQuery, { test: true });

      return {
        status: 'healthy',
        iterationsCompleted: this.iterationHistory.length,
        knowledgeStateSize: this.knowledgeState.size,
        performanceMetrics: { ...this.performanceMetrics },
        components: {
          retrieval: 'active',
          compiler: 'active',
          validation: 'active'
        },
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
    // Clear state
    this.reset();
    console.log('🔍 Information Retrieval Cognitive Loop shutdown complete');
  }
}

module.exports = InformationRetrievalLoop;