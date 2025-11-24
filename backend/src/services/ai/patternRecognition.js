/**
 * Advanced Pattern Recognition System
 * 
 * Implements behavioral pattern mining, context-aware suggestions,
 * workflow clustering, and anomaly detection
 */

const fs = require('fs').promises;
const path = require('path');

class PatternRecognitionSystem {
  constructor() {
    this.patterns = new Map();
    this.sequences = [];
    this.clusters = new Map();
    this.anomalies = [];
    this.dataPath = path.join(__dirname, '../../../data/patterns');
    this.initialized = false;

    // Configuration
    this.config = {
      minSequenceLength: 2,
      maxSequenceLength: 10,
      minPatternSupport: 3, // Minimum occurrences to be considered a pattern
      anomalyThreshold: 2.5, // Standard deviations from mean
      clusteringThreshold: 0.7 // Similarity threshold for clustering
    };
  }

  async initialize() {
    if (this.initialized) return;

    try {
      await fs.mkdir(this.dataPath, { recursive: true });
      await this.loadPatterns();
      this.initialized = true;
      console.log('[Pattern Recognition] System initialized');
    } catch (error) {
      console.error('[Pattern Recognition] Initialization error:', error);
    }
  }

  /**
   * Record a new action sequence
   */
  recordSequence(actions) {
    const sequence = {
      id: `seq_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      actions,
      timestamp: new Date().toISOString(),
      context: this.extractContext(actions)
    };

    this.sequences.push(sequence);

    // Mine patterns from recent sequences
    if (this.sequences.length % 10 === 0) {
      this.minePatterns();
    }

    return sequence.id;
  }

  /**
   * Extract context from action sequence
   */
  extractContext(actions) {
    const context = {
      languages: new Set(),
      fileTypes: new Set(),
      actionTypes: new Set(),
      timeOfDay: new Date().getHours(),
      dayOfWeek: new Date().getDay()
    };

    for (const action of actions) {
      if (action.context?.language) {
        context.languages.add(action.context.language);
      }
      if (action.context?.filePath) {
        const ext = path.extname(action.context.filePath);
        context.fileTypes.add(ext);
      }
      context.actionTypes.add(action.type);
    }

    return {
      languages: Array.from(context.languages),
      fileTypes: Array.from(context.fileTypes),
      actionTypes: Array.from(context.actionTypes),
      timeOfDay: context.timeOfDay,
      dayOfWeek: context.dayOfWeek
    };
  }

  /**
   * Mine behavioral patterns from sequences
   */
  minePatterns() {
    console.log('[Pattern Recognition] Mining patterns from', this.sequences.length, 'sequences');

    // Find frequent subsequences
    const candidates = new Map();

    for (const sequence of this.sequences) {
      const subseqs = this.generateSubsequences(sequence.actions);

      for (const subseq of subseqs) {
        const key = this.sequenceToKey(subseq);
        if (!candidates.has(key)) {
          candidates.set(key, {
            pattern: subseq,
            count: 0,
            contexts: []
          });
        }

        const pattern = candidates.get(key);
        pattern.count++;
        pattern.contexts.push(sequence.context);
      }
    }

    // Filter patterns by minimum support
    for (const [key, data] of candidates.entries()) {
      if (data.count >= this.config.minPatternSupport) {
        this.patterns.set(key, {
          pattern: data.pattern,
          frequency: data.count,
          confidence: data.count / this.sequences.length,
          contexts: data.contexts,
          discovered: new Date().toISOString()
        });
      }
    }

    console.log('[Pattern Recognition] Discovered', this.patterns.size, 'patterns');
  }

  /**
   * Generate all subsequences from action sequence
   */
  generateSubsequences(actions) {
    const subsequences = [];

    for (let length = this.config.minSequenceLength; length <= Math.min(this.config.maxSequenceLength, actions.length); length++) {
      for (let i = 0; i <= actions.length - length; i++) {
        subsequences.push(actions.slice(i, i + length));
      }
    }

    return subsequences;
  }

  /**
   * Convert sequence to comparable key
   */
  sequenceToKey(sequence) {
    return sequence.map(action => action.type).join('→');
  }

  /**
   * Get context-aware suggestions for next action
   */
  async getSuggestions(currentSequence, context = {}) {
    const suggestions = [];

    // Find matching patterns
    const currentKey = this.sequenceToKey(currentSequence);

    for (const [key, patternData] of this.patterns.entries()) {
      if (key.startsWith(currentKey + '→')) {
        const nextAction = key.split('→')[currentSequence.length];
        const contextMatch = this.calculateContextSimilarity(context, patternData.contexts);

        suggestions.push({
          action: nextAction,
          confidence: patternData.confidence * contextMatch,
          frequency: patternData.frequency,
          reason: `Observed ${patternData.frequency} times in similar contexts`
        });
      }
    }

    // Sort by confidence
    suggestions.sort((a, b) => b.confidence - a.confidence);

    return suggestions.slice(0, 5); // Top 5 suggestions
  }

  /**
   * Calculate similarity between contexts
   */
  calculateContextSimilarity(context1, contexts2) {
    if (!context1 || contexts2.length === 0) return 0.5;

    let totalSimilarity = 0;

    for (const context2 of contexts2) {
      let similarity = 0;
      let factors = 0;

      // Language similarity
      if (context1.language && context2.languages) {
        similarity += context2.languages.includes(context1.language) ? 1 : 0;
        factors++;
      }

      // Time of day similarity
      if (context1.timeOfDay !== undefined && context2.timeOfDay !== undefined) {
        const timeDiff = Math.abs(context1.timeOfDay - context2.timeOfDay);
        similarity += 1 - (timeDiff / 24);
        factors++;
      }

      // Action type similarity
      if (context1.actionType && context2.actionTypes) {
        similarity += context2.actionTypes.includes(context1.actionType) ? 1 : 0;
        factors++;
      }

      totalSimilarity += factors > 0 ? similarity / factors : 0;
    }

    return contexts2.length > 0 ? totalSimilarity / contexts2.length : 0.5;
  }

  /**
   * Cluster similar workflows
   */
  async clusterWorkflows() {
    console.log('[Pattern Recognition] Clustering workflows');

    const clusters = [];

    for (const sequence of this.sequences) {
      let assigned = false;

      // Try to assign to existing cluster
      for (const cluster of clusters) {
        const similarity = this.calculateSequenceSimilarity(
          sequence.actions,
          cluster.centroid
        );

        if (similarity >= this.config.clusteringThreshold) {
          cluster.sequences.push(sequence);
          cluster.centroid = this.calculateCentroid(cluster.sequences);
          assigned = true;
          break;
        }
      }

      // Create new cluster if not assigned
      if (!assigned) {
        clusters.push({
          id: `cluster_${clusters.length + 1}`,
          sequences: [sequence],
          centroid: sequence.actions
        });
      }
    }

    // Store clusters
    this.clusters.clear();
    for (const cluster of clusters) {
      this.clusters.set(cluster.id, {
        size: cluster.sequences.length,
        representative: cluster.centroid,
        sequences: cluster.sequences.map(s => s.id)
      });
    }

    console.log('[Pattern Recognition] Created', clusters.length, 'workflow clusters');
    return clusters;
  }

  /**
   * Calculate similarity between two sequences
   */
  calculateSequenceSimilarity(seq1, seq2) {
    if (!seq1 || !seq2 || seq1.length === 0 || seq2.length === 0) return 0;

    // Use Longest Common Subsequence
    const lcs = this.longestCommonSubsequence(
      seq1.map(a => a.type),
      seq2.map(a => a.type)
    );

    return (2 * lcs.length) / (seq1.length + seq2.length);
  }

  /**
   * Find longest common subsequence
   */
  longestCommonSubsequence(seq1, seq2) {
    const m = seq1.length;
    const n = seq2.length;
    const dp = Array(m + 1).fill(0).map(() => Array(n + 1).fill(0));

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (seq1[i - 1] === seq2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
      }
    }

    // Reconstruct LCS
    const lcs = [];
    let i = m, j = n;
    while (i > 0 && j > 0) {
      if (seq1[i - 1] === seq2[j - 1]) {
        lcs.unshift(seq1[i - 1]);
        i--;
        j--;
      } else if (dp[i - 1][j] > dp[i][j - 1]) {
        i--;
      } else {
        j--;
      }
    }

    return lcs;
  }

  /**
   * Calculate centroid of sequences
   */
  calculateCentroid(sequences) {
    if (sequences.length === 0) return [];

    // Find most representative sequence (closest to all others on average)
    let bestSequence = sequences[0].actions;
    let bestScore = Infinity;

    for (const candidate of sequences) {
      let totalDistance = 0;

      for (const other of sequences) {
        const similarity = this.calculateSequenceSimilarity(
          candidate.actions,
          other.actions
        );
        totalDistance += (1 - similarity);
      }

      const avgDistance = totalDistance / sequences.length;
      if (avgDistance < bestScore) {
        bestScore = avgDistance;
        bestSequence = candidate.actions;
      }
    }

    return bestSequence;
  }

  /**
   * Detect anomalous behavior
   */
  async detectAnomalies(sequence) {
    const anomalies = [];

    // Check sequence length anomaly
    const lengths = this.sequences.map(s => s.actions.length);
    const lengthStats = this.calculateStats(lengths);

    if (sequence.actions.length > lengthStats.mean + (this.config.anomalyThreshold * lengthStats.stdDev)) {
      anomalies.push({
        type: 'unusual_length',
        severity: 'medium',
        details: `Sequence length ${sequence.actions.length} is unusually long (mean: ${lengthStats.mean.toFixed(1)})`,
        zscore: (sequence.actions.length - lengthStats.mean) / lengthStats.stdDev
      });
    }

    // Check for unusual action combinations
    const sequenceKey = this.sequenceToKey(sequence.actions);
    if (!this.patterns.has(sequenceKey)) {
      const subkeys = this.generateSubsequences(sequence.actions).map(sub => this.sequenceToKey(sub));
      const knownSubkeys = subkeys.filter(key => this.patterns.has(key));

      if (knownSubkeys.length === 0 && sequence.actions.length >= this.config.minSequenceLength) {
        anomalies.push({
          type: 'unknown_pattern',
          severity: 'high',
          details: 'This action sequence has never been observed before',
          pattern: sequenceKey
        });
      }
    }

    // Check execution time anomaly (if available)
    if (sequence.executionTime) {
      const times = this.sequences
        .filter(s => s.executionTime)
        .map(s => s.executionTime);

      if (times.length > 0) {
        const timeStats = this.calculateStats(times);

        if (sequence.executionTime > timeStats.mean + (this.config.anomalyThreshold * timeStats.stdDev)) {
          anomalies.push({
            type: 'slow_execution',
            severity: 'low',
            details: `Execution time ${sequence.executionTime}ms is unusually slow (mean: ${timeStats.mean.toFixed(1)}ms)`,
            zscore: (sequence.executionTime - timeStats.mean) / timeStats.stdDev
          });
        }
      }
    }

    if (anomalies.length > 0) {
      this.anomalies.push({
        sequenceId: sequence.id,
        timestamp: new Date().toISOString(),
        anomalies
      });
    }

    return anomalies;
  }

  /**
   * Calculate statistics (mean, std dev)
   */
  calculateStats(values) {
    if (values.length === 0) return { mean: 0, stdDev: 0 };

    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    return { mean, stdDev, variance };
  }

  /**
   * Get pattern insights
   */
  getInsights() {
    const insights = [];

    // Most common patterns
    const sortedPatterns = Array.from(this.patterns.entries())
      .sort((a, b) => b[1].frequency - a[1].frequency)
      .slice(0, 10);

    insights.push({
      type: 'common_patterns',
      data: sortedPatterns.map(([key, data]) => ({
        pattern: key,
        frequency: data.frequency,
        confidence: data.confidence
      }))
    });

    // Cluster statistics
    insights.push({
      type: 'workflow_clusters',
      data: {
        totalClusters: this.clusters.size,
        clusters: Array.from(this.clusters.entries()).map(([id, cluster]) => ({
          id,
          size: cluster.size,
          representative: this.sequenceToKey(cluster.representative)
        }))
      }
    });

    // Recent anomalies
    const recentAnomalies = this.anomalies.slice(-10);
    insights.push({
      type: 'anomalies',
      data: {
        total: this.anomalies.length,
        recent: recentAnomalies
      }
    });

    // Time-based patterns
    const timePatterns = this.analyzeTimePatterns();
    insights.push({
      type: 'temporal_patterns',
      data: timePatterns
    });

    return insights;
  }

  /**
   * Analyze time-based patterns
   */
  analyzeTimePatterns() {
    const hourlyActivity = new Array(24).fill(0);
    const dailyActivity = new Array(7).fill(0);

    for (const sequence of this.sequences) {
      const hour = sequence.context.timeOfDay;
      const day = sequence.context.dayOfWeek;

      hourlyActivity[hour]++;
      dailyActivity[day]++;
    }

    return {
      mostActiveHour: hourlyActivity.indexOf(Math.max(...hourlyActivity)),
      mostActiveDay: dailyActivity.indexOf(Math.max(...dailyActivity)),
      hourlyDistribution: hourlyActivity,
      dailyDistribution: dailyActivity
    };
  }

  /**
   * Save patterns to disk
   */
  async savePatterns() {
    try {
      const data = {
        patterns: Array.from(this.patterns.entries()),
        clusters: Array.from(this.clusters.entries()),
        anomalies: this.anomalies.slice(-100), // Keep last 100 anomalies
        sequences: this.sequences.slice(-500) // Keep last 500 sequences
      };

      await fs.writeFile(
        path.join(this.dataPath, 'patterns.json'),
        JSON.stringify(data, null, 2)
      );
    } catch (error) {
      console.error('[Pattern Recognition] Save error:', error);
    }
  }

  /**
   * Load patterns from disk
   */
  async loadPatterns() {
    try {
      const data = await fs.readFile(
        path.join(this.dataPath, 'patterns.json'),
        'utf-8'
      );

      const parsed = JSON.parse(data);
      this.patterns = new Map(parsed.patterns || []);
      this.clusters = new Map(parsed.clusters || []);
      this.anomalies = parsed.anomalies || [];
      this.sequences = parsed.sequences || [];

      console.log('[Pattern Recognition] Loaded', this.patterns.size, 'patterns');
    } catch (error) {
      console.log('[Pattern Recognition] No previous data found');
    }
  }

  /**
   * Get statistics
   */
  getStats() {
    return {
      totalPatterns: this.patterns.size,
      totalSequences: this.sequences.length,
      totalClusters: this.clusters.size,
      totalAnomalies: this.anomalies.length,
      avgSequenceLength: this.sequences.length > 0
        ? this.sequences.reduce((sum, s) => sum + s.actions.length, 0) / this.sequences.length
        : 0
    };
  }
}

module.exports = new PatternRecognitionSystem();
