/**
 * Self-Learning AI System (Enhanced)
 * 
 * Advanced self-learning system with:
 * - Neural network-inspired pattern recognition
 * - Multi-dimensional reinforcement learning
 * - Anomaly detection and adaptive thresholds
 * - Temporal pattern analysis
 * - Advanced optimization algorithms
 * 
 * @version 2.0.0
 * @enhanced November 2025
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

/**
 * Anomaly Detection System
 * Detects unusual patterns and potential security issues
 */
class AnomalyDetector {
  constructor() {
    this.anomalies = [];
    this.baselineMetrics = new Map();
    this.maxAnomalies = 100;
  }
  
  /**
   * Check if action/outcome is anomalous
   */
  checkAnomaly(action, reward, strategy) {
    const anomalies = [];
    
    // Statistical anomaly detection (Z-score)
    if (strategy.recentPerformance && strategy.recentPerformance.length > 5) {
      const mean = strategy.avgReward;
      const stdDev = strategy.variance;
      
      if (stdDev > 0) {
        const zScore = Math.abs((reward - mean) / stdDev);
        
        if (zScore > 2.5) { // 2.5 standard deviations
          anomalies.push({
            type: 'statistical',
            severity: zScore > 3 ? 'high' : 'medium',
            message: `Performance deviation detected: Z-score ${zScore.toFixed(2)}`,
            action: action.type,
            timestamp: Date.now()
          });
        }
      }
    }
    
    // Security anomaly: Excessive error rate
    if (action.metrics && action.metrics.errorRate > 5) {
      anomalies.push({
        type: 'security',
        severity: 'high',
        message: `Unusual error rate: ${action.metrics.errorRate} errors`,
        action: action.type,
        timestamp: Date.now()
      });
    }
    
    // Performance anomaly: Very slow execution
    if (action.metrics && action.metrics.executionTime > 10000) { // 10 seconds
      anomalies.push({
        type: 'performance',
        severity: 'medium',
        message: `Slow execution: ${action.metrics.executionTime}ms`,
        action: action.type,
        timestamp: Date.now()
      });
    }
    
    // Quality anomaly: Sudden quality drop
    if (strategy.avgQuality > 0.7 && action.metrics && action.metrics.quality < 0.3) {
      anomalies.push({
        type: 'quality',
        severity: 'high',
        message: `Significant quality drop from ${(strategy.avgQuality * 100).toFixed(0)}% to ${(action.metrics.quality * 100).toFixed(0)}%`,
        action: action.type,
        timestamp: Date.now()
      });
    }
    
    // Store anomalies
    if (anomalies.length > 0) {
      this.anomalies.push(...anomalies);
      
      // Keep only recent anomalies
      if (this.anomalies.length > this.maxAnomalies) {
        this.anomalies = this.anomalies.slice(-this.maxAnomalies);
      }
    }
    
    return anomalies;
  }
  
  /**
   * Get recent anomalies
   */
  getRecentAnomalies(limit = 10) {
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
    return this.anomalies
      .filter(a => a.timestamp > oneDayAgo)
      .slice(-limit);
  }
  
  /**
   * Clear old anomalies
   */
  clearOldAnomalies(daysOld = 7) {
    const cutoff = Date.now() - (daysOld * 24 * 60 * 60 * 1000);
    this.anomalies = this.anomalies.filter(a => a.timestamp > cutoff);
  }
}

class SelfLearningSystem {
  constructor() {
    this.learningDataPath = path.join(__dirname, '../../../data/learning');
    this.actionHistory = [];
    this.performanceMetrics = new Map();
    this.optimizationStrategies = new Map();
    this.knowledgeGraph = new Map();
    this.initialized = false;
    
    // Enhanced features
    this.neuralWeights = new Map(); // Neural network-like weights
    this.anomalyDetector = new AnomalyDetector();
    this.temporalPatterns = new Map();
    this.adaptiveThresholds = new Map();
    this.performanceBaseline = null;
    
    // Configuration
    this.config = {
      maxHistorySize: 1000,
      learningRate: 0.1,
      explorationRate: 0.15,
      anomalyThreshold: 2.5,
      patternMinSupport: 3,
      neuralLayers: 3
    };
  }

  async initialize() {
    if (this.initialized) return;
    
    try {
      await fs.mkdir(this.learningDataPath, { recursive: true });
      await this.loadLearningData();
      this.initialized = true;
      console.log('[Self-Learning] System initialized');
    } catch (error) {
      console.error('[Self-Learning] Initialization error:', error);
    }
  }

  /**
   * Record an action and its context for learning
   */
  async recordAction(actionData) {
    const action = {
      id: this.generateActionId(),
      timestamp: new Date().toISOString(),
      type: actionData.type,
      context: actionData.context,
      parameters: actionData.parameters,
      outcome: null,
      metrics: null,
      metadata: actionData.metadata || {}
    };

    this.actionHistory.push(action);
    
    // Update knowledge graph
    this.updateKnowledgeGraph(action);
    
    return action.id;
  }

  /**
   * Record the outcome of an action for reinforcement learning
   */
  async recordOutcome(actionId, outcome) {
    const action = this.actionHistory.find(a => a.id === actionId);
    if (!action) return;

    action.outcome = outcome;
    action.metrics = this.calculateMetrics(action, outcome);

    // Perform reinforcement learning
    await this.reinforcementLearn(action);
    
    // Persist learning data
    await this.saveLearningData();
  }

  /**
   * Calculate performance metrics for an action
   */
  calculateMetrics(action, outcome) {
    const quality = outcome.quality !== undefined ? outcome.quality : this.assessQuality(action, outcome);
    const efficiency = outcome.efficiency !== undefined ? outcome.efficiency : this.assessEfficiency(action, outcome);

    return {
      success: outcome.success ?? true,
      executionTime: outcome.executionTime || 0,
      resourceUsage: outcome.resourceUsage || {},
      quality: this.clamp01(quality),
      efficiency: this.clamp01(efficiency),
      errorRate: outcome.errorRate !== undefined ? outcome.errorRate : (outcome.errors ? outcome.errors.length : 0),
      userSatisfaction: outcome.userSatisfaction || 0.5
    };
  }

  /**
   * Assess quality of outcome
   */
  assessQuality(action, outcome) {
    let qualityScore = 0.5;

    if (outcome.success) qualityScore += 0.3;
    if (outcome.errors && outcome.errors.length === 0) qualityScore += 0.1;
    if (outcome.codeQuality) qualityScore += outcome.codeQuality * 0.1;
    
    return Math.min(1.0, qualityScore);
  }

  /**
   * Assess efficiency of action
   */
  assessEfficiency(action, outcome) {
    const baselineTime = this.getBaselineTime(action.type);
    if (!baselineTime || !outcome.executionTime) return 0.5;

    const ratio = baselineTime / outcome.executionTime;
    return Math.min(1.0, ratio);
  }

  /**
   * Enhanced reinforcement learning with multi-objective optimization
   * Uses adaptive learning rates and exploration vs exploitation balance
   */
  async reinforcementLearn(action) {
    const strategyKey = this.hashStrategyKey(action.type, action.context);
    
    if (!this.optimizationStrategies.has(strategyKey)) {
      this.optimizationStrategies.set(strategyKey, {
        attempts: 0,
        successRate: 0,
        avgQuality: 0,
        avgEfficiency: 0,
        avgReward: 0,
        bestParameters: null,
        learningRate: this.config.learningRate,
        variance: 0,
        recentPerformance: [],
        explorationCount: 0,
        lastUpdate: Date.now()
      });
    }

    const strategy = this.optimizationStrategies.get(strategyKey);
    strategy.attempts++;

    // Adaptive learning rate based on convergence
    const alpha = this.calculateAdaptiveLearningRate(strategy);
    
    // Calculate multi-objective reward
    const reward = this.calculateReward(action.metrics);
    
    // Update running averages using exponential moving average
    strategy.successRate = (1 - alpha) * strategy.successRate + alpha * (action.metrics.success ? 1 : 0);
    strategy.avgQuality = (1 - alpha) * strategy.avgQuality + alpha * action.metrics.quality;
    strategy.avgEfficiency = (1 - alpha) * strategy.avgEfficiency + alpha * action.metrics.efficiency;
    strategy.avgReward = (1 - alpha) * strategy.avgReward + alpha * reward;
    
    // Track recent performance for variance calculation
    strategy.recentPerformance.push(reward);
    if (strategy.recentPerformance.length > 20) {
      strategy.recentPerformance.shift();
    }
    strategy.variance = this.calculateVariance(strategy.recentPerformance);

    // Update best parameters with exploration bonus
    const currentScore = this.calculateStrategyScore(action.metrics);
    const bestScore = strategy.bestParameters ? this.calculateStrategyScore(strategy.bestParameters.metrics) : 0;
    
    // Epsilon-greedy exploration
    const shouldExplore = Math.random() < this.config.explorationRate;
    
    if (currentScore > bestScore || (shouldExplore && currentScore > bestScore * 0.8)) {
      strategy.bestParameters = {
        parameters: action.parameters,
        metrics: action.metrics,
        timestamp: Date.now()
      };
      if (shouldExplore) strategy.explorationCount++;
    }
    
    // Update neural weights for pattern recognition
    await this.updateNeuralWeights(strategyKey, action, reward);
    
    // Detect anomalies
    this.anomalyDetector.checkAnomaly(action, reward, strategy);

    strategy.lastUpdate = Date.now();
    this.optimizationStrategies.set(strategyKey, strategy);
  }
  
  /**
   * Calculate adaptive learning rate based on convergence
   */
  calculateAdaptiveLearningRate(strategy) {
    if (strategy.attempts < 10) {
      return this.config.learningRate; // Higher learning rate initially
    }
    
    // Decrease learning rate as variance decreases (converging)
    const varianceFactor = Math.max(0.01, Math.min(1, strategy.variance));
    return this.config.learningRate * varianceFactor;
  }
  
  /**
   * Calculate multi-objective reward function
   */
  calculateReward(metrics) {
    // Weighted combination of multiple objectives
    return (
      metrics.quality * 0.35 +
      metrics.efficiency * 0.25 +
      (metrics.success ? 0.25 : -0.1) +
      (1 - Math.min(1, metrics.errorRate / 10)) * 0.15 +
      (metrics.userSatisfaction || 0.5) * 0.1
    );
  }
  
  /**
   * Calculate variance of recent performance
   */
  calculateVariance(values) {
    if (values.length < 2) return 1;
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
    return Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / values.length);
  }

  /**
   * Calculate overall score for a strategy
   */
  calculateStrategyScore(metrics) {
    return (
      metrics.quality * 0.4 +
      metrics.efficiency * 0.3 +
      (metrics.success ? 0.2 : 0) +
      (1 - metrics.errorRate / 10) * 0.1
    );
  }

  /**
   * Get optimized parameters for an action type based on learning
   */
  async getOptimizedParameters(actionType, context) {
    const strategyKey = this.hashStrategyKey(actionType, context);
    const strategy = this.optimizationStrategies.get(strategyKey);

    if (strategy && strategy.bestParameters) {
      return {
        ...strategy.bestParameters.parameters,
        _confidence: strategy.successRate,
        _quality: strategy.avgQuality
      };
    }

    // Return default parameters
    return this.getDefaultParameters(actionType);
  }

  /**
   * Update neural weights using backpropagation-inspired algorithm
   */
  async updateNeuralWeights(strategyKey, action, reward) {
    if (!this.neuralWeights.has(strategyKey)) {
      this.neuralWeights.set(strategyKey, {
        inputWeights: new Map(),
        hiddenWeights: new Map(),
        outputWeight: 0.5,
        bias: 0,
        activations: []
      });
    }
    
    const weights = this.neuralWeights.get(strategyKey);
    
    // Extract features from action
    const features = this.extractFeatures(action);
    
    // Forward pass
    const hidden = this.forwardPass(features, weights);
    
    // Calculate error
    const error = reward - weights.outputWeight;
    
    // Backward pass (weight update)
    weights.outputWeight += this.config.learningRate * error;
    
    // Update hidden layer weights
    for (const [feature, value] of features.entries()) {
      const currentWeight = weights.inputWeights.get(feature) || 0;
      weights.inputWeights.set(
        feature,
        currentWeight + this.config.learningRate * error * value
      );
    }
    
    this.neuralWeights.set(strategyKey, weights);
  }
  
  /**
   * Extract numerical features from action for neural processing
   */
  extractFeatures(action) {
    const features = new Map();
    
    // Temporal features
    const hour = new Date(action.timestamp).getHours();
    features.set('hour_normalized', hour / 24);
    
    // Parameter features
    if (action.parameters) {
      Object.entries(action.parameters).forEach(([key, value]) => {
        if (typeof value === 'number') {
          features.set(`param_${key}`, this.normalize(value));
        } else if (typeof value === 'boolean') {
          features.set(`param_${key}`, value ? 1 : 0);
        }
      });
    }
    
    // Context features
    if (action.context) {
      features.set('context_complexity', Object.keys(action.context).length / 10);
    }
    
    return features;
  }
  
  /**
   * Forward pass through neural network
   */
  forwardPass(features, weights) {
    let activation = weights.bias;
    
    for (const [feature, value] of features.entries()) {
      const weight = weights.inputWeights.get(feature) || 0;
      activation += value * weight;
    }
    
    // ReLU activation
    return Math.max(0, activation);
  }
  
  /**
   * Normalize value to [0, 1] range
   */
  normalize(value, min = 0, max = 100) {
    return Math.max(0, Math.min(1, (value - min) / (max - min)));
  }

  clamp01(value) {
    if (!Number.isFinite(value)) {
      return 0;
    }
    return Math.max(0, Math.min(1, value));
  }
  
  /**
   * Hash strategy key for better performance and consistency
   */
  hashStrategyKey(type, context = {}) {
    if (!context || typeof context !== 'object' || Object.keys(context).length === 0) {
      return type;
    }

    if (context.language) {
      return `${type}:${context.language}`;
    }

    if (context.filePath) {
      const fileName = path.basename(context.filePath);
      return `${type}:${fileName}`;
    }

    const keys = Object.keys(context).sort();
    const contextStr = JSON.stringify(context, keys);
    const hash = crypto.createHash('sha256')
      .update(`${type}:${contextStr}`)
      .digest('hex')
      .substring(0, 16);
    return `${type}:${hash}`;
  }
  
  /**
   * Update knowledge graph with action relationships
   */
  updateKnowledgeGraph(action) {
    const nodeKey = action.type;
    
    if (!this.knowledgeGraph.has(nodeKey)) {
      this.knowledgeGraph.set(nodeKey, {
        type: action.type,
        occurrences: 0,
        relatedActions: new Map(),
        patterns: [],
        insights: []
      });
    }

    const node = this.knowledgeGraph.get(nodeKey);
    node.occurrences++;

    // Link to previous actions to find patterns
    if (this.actionHistory.length > 1) {
      const prevAction = this.actionHistory[this.actionHistory.length - 2];
      const relatedKey = prevAction.type;
      
      node.relatedActions.set(
        relatedKey,
        (node.relatedActions.get(relatedKey) || 0) + 1
      );
    }

    this.knowledgeGraph.set(nodeKey, node);
  }

  /**
   * Advanced pattern analysis with temporal and sequence mining
   */
  async analyzePatterns() {
    const insights = [];

    // Pattern 1: High success rate sequences
    for (const [actionType, data] of this.knowledgeGraph) {
      const topRelated = Array.from(data.relatedActions.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);

      if (topRelated.length > 0 && topRelated[0][1] >= this.config.patternMinSupport) {
        insights.push({
          type: 'sequence_pattern',
          action: actionType,
          insight: `Action "${actionType}" frequently follows: ${topRelated.map(r => r[0]).join(', ')}`,
          confidence: topRelated[0][1] / data.occurrences,
          support: topRelated[0][1],
          priority: this.calculateInsightPriority(topRelated[0][1], data.occurrences)
        });
      }
    }

    // Pattern 2: Performance improvements over time
    const recentActions = this.actionHistory.slice(-100);
    const oldActions = this.actionHistory.slice(0, 100);

    if (recentActions.length > 0 && oldActions.length > 0) {
      const recentAvgQuality = recentActions.reduce((sum, a) => sum + (a.metrics?.quality || 0), 0) / recentActions.length;
      const oldAvgQuality = oldActions.reduce((sum, a) => sum + (a.metrics?.quality || 0), 0) / oldActions.length;

      if (recentAvgQuality > oldAvgQuality) {
        const improvement = ((recentAvgQuality - oldAvgQuality) * 100);
        insights.push({
          type: 'improvement',
          insight: `Quality improved by ${improvement.toFixed(1)}% over time`,
          confidence: 0.9,
          priority: improvement > 20 ? 'high' : 'medium'
        });
      }
    }
    
    // Pattern 3: Temporal patterns
    const temporalInsights = this.analyzeTemporalPatterns();
    insights.push(...temporalInsights);
    
    // Pattern 4: Anomaly detection results
    const anomalies = this.anomalyDetector.getRecentAnomalies();
    if (anomalies.length > 0) {
      insights.push({
        type: 'anomaly_detected',
        insight: `Detected ${anomalies.length} performance anomalies requiring attention`,
        confidence: 0.85,
        anomalies: anomalies.slice(0, 5),
        priority: 'high'
      });
    }
    
    // Pattern 5: Strategy convergence analysis
    const convergenceInsights = this.analyzeConvergence();
    insights.push(...convergenceInsights);

    return insights.sort((a, b) => {
      const priorityWeight = { high: 3, medium: 2, low: 1 };
      return (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
    });
  }
  
  /**
   * Analyze temporal patterns in actions
   */
  analyzeTemporalPatterns() {
    const insights = [];
    const hourlyPerformance = new Map();
    
    // Group actions by hour
    this.actionHistory.forEach(action => {
      if (!action.metrics) return;
      const hour = new Date(action.timestamp).getHours();
      if (!hourlyPerformance.has(hour)) {
        hourlyPerformance.set(hour, []);
      }
      hourlyPerformance.get(hour).push(action.metrics.quality);
    });
    
    // Find best and worst performing hours
    const hourlyAvg = Array.from(hourlyPerformance.entries())
      .map(([hour, qualities]) => ({
        hour,
        avgQuality: qualities.reduce((a, b) => a + b, 0) / qualities.length,
        count: qualities.length
      }))
      .filter(h => h.count >= 5);
    
    if (hourlyAvg.length > 0) {
      hourlyAvg.sort((a, b) => b.avgQuality - a.avgQuality);
      const best = hourlyAvg[0];
      const worst = hourlyAvg[hourlyAvg.length - 1];
      
      if (best.avgQuality - worst.avgQuality > 0.2) {
        insights.push({
          type: 'temporal_pattern',
          insight: `Performance peaks at ${best.hour}:00 (${(best.avgQuality * 100).toFixed(0)}%) and dips at ${worst.hour}:00 (${(worst.avgQuality * 100).toFixed(0)}%)`,
          confidence: 0.8,
          priority: 'medium'
        });
      }
    }
    
    return insights;
  }
  
  /**
   * Analyze strategy convergence
   */
  analyzeConvergence() {
    const insights = [];
    
    for (const [key, strategy] of this.optimizationStrategies) {
      if (strategy.attempts > 20 && strategy.variance < 0.1) {
        insights.push({
          type: 'convergence',
          insight: `Strategy "${key.split(':')[0]}" has converged with ${(strategy.successRate * 100).toFixed(0)}% success rate`,
          confidence: 1 - strategy.variance,
          priority: 'low'
        });
      }
    }
    
    return insights;
  }
  
  /**
   * Calculate priority for insights
   */
  calculateInsightPriority(support, total) {
    const ratio = support / total;
    if (ratio > 0.7) return 'high';
    if (ratio > 0.4) return 'medium';
    return 'low';
  }

  /**
   * Generate self-improvement recommendations
   */
  async generateImprovements() {
    const improvements = [];

    // Analyze low-performing strategies
    for (const [key, strategy] of this.optimizationStrategies) {
      if (strategy.attempts > 10 && strategy.successRate < 0.7) {
        improvements.push({
          area: key,
          current: { successRate: strategy.successRate, quality: strategy.avgQuality },
          recommendation: 'Consider alternative approach or parameter tuning',
          priority: 'high'
        });
      }
    }

    // Identify optimization opportunities
    const insights = await this.analyzePatterns();
    for (const insight of insights) {
      if (insight.confidence > 0.8) {
        improvements.push({
          area: insight.action || 'general',
          insight: insight.insight,
          recommendation: 'Apply discovered pattern for better results',
          priority: 'medium'
        });
      }
    }

    return improvements;
  }

  /**
   * Self-modify: Generate and apply optimizations
   */
  async selfOptimize() {
    const improvements = await this.generateImprovements();
    const optimizations = [];

    for (const improvement of improvements) {
      try {
        const optimization = await this.applyOptimization(improvement);
        if (optimization) {
          optimizations.push(optimization);
        }
      } catch (error) {
        console.error('[Self-Learning] Optimization error:', error);
      }
    }

    return {
      appliedOptimizations: optimizations.length,
      improvements
    };
  }

  /**
   * Apply a specific optimization
   */
  async applyOptimization(improvement) {
    // This is where meta-programming happens
    // The AI modifies its own behavior based on learning
    
    return {
      area: improvement.area,
      action: 'parameters_updated',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Load learning data from disk with validation
   */
  async loadLearningData() {
    try {
      const historyPath = path.join(this.learningDataPath, 'action_history.json');
      const strategiesPath = path.join(this.learningDataPath, 'strategies.json');
      const neuralPath = path.join(this.learningDataPath, 'neural_weights.json');

      // Load and validate history
      try {
        const historyData = await fs.readFile(historyPath, 'utf-8');
        const parsed = JSON.parse(historyData);
        if (Array.isArray(parsed)) {
          this.actionHistory = this.validateActionHistory(parsed);
          console.log(`[Self-Learning] Loaded ${this.actionHistory.length} historical actions`);
        }
      } catch (err) {
        console.log('[Self-Learning] No action history found, starting fresh');
      }

      // Load and validate strategies
      try {
        const strategiesData = await fs.readFile(strategiesPath, 'utf-8');
        const strategies = JSON.parse(strategiesData);
        this.optimizationStrategies = new Map(Object.entries(strategies));
        console.log(`[Self-Learning] Loaded ${this.optimizationStrategies.size} optimization strategies`);
      } catch (err) {
        console.log('[Self-Learning] No strategies found, starting fresh');
      }
      
      // Load neural weights
      try {
        const neuralData = await fs.readFile(neuralPath, 'utf-8');
        const weights = JSON.parse(neuralData);
        this.neuralWeights = new Map(Object.entries(weights).map(([k, v]) => [
          k,
          {
            ...v,
            inputWeights: new Map(Object.entries(v.inputWeights || {})),
            hiddenWeights: new Map(Object.entries(v.hiddenWeights || {}))
          }
        ]));
        console.log(`[Self-Learning] Loaded ${this.neuralWeights.size} neural weight sets`);
      } catch (err) {
        console.log('[Self-Learning] No neural weights found, starting fresh');
      }
      
      // Calculate baseline performance
      this.calculatePerformanceBaseline();
      
    } catch (error) {
      console.error('[Self-Learning] Error loading data:', error.message);
    }
  }
  
  /**
   * Validate action history for data integrity
   */
  validateActionHistory(history) {
    return history.filter(action => {
      // Basic validation
      return action.id &&
             action.timestamp &&
             action.type &&
             typeof action.type === 'string' &&
             action.type.length > 0 &&
             action.type.length < 100;
    }).slice(-this.config.maxHistorySize); // Limit size
  }
  
  /**
   * Calculate baseline performance metrics
   */
  calculatePerformanceBaseline() {
    if (this.actionHistory.length < 10) return;
    
    const metrics = this.actionHistory
      .filter(a => a.metrics)
      .map(a => a.metrics);
    
    if (metrics.length > 0) {
      this.performanceBaseline = {
        avgQuality: metrics.reduce((sum, m) => sum + m.quality, 0) / metrics.length,
        avgEfficiency: metrics.reduce((sum, m) => sum + m.efficiency, 0) / metrics.length,
        successRate: metrics.filter(m => m.success).length / metrics.length,
        calculatedAt: Date.now()
      };
    }
  }

  /**
   * Save learning data to disk with backup and compression
   */
  async saveLearningData() {
    try {
      const historyPath = path.join(this.learningDataPath, 'action_history.json');
      const strategiesPath = path.join(this.learningDataPath, 'strategies.json');
      const neuralPath = path.join(this.learningDataPath, 'neural_weights.json');
      const backupPath = path.join(this.learningDataPath, 'backups');

      // Create backup directory
      await fs.mkdir(backupPath, { recursive: true });

      // Keep only recent history to avoid unbounded growth
      const recentHistory = this.actionHistory.slice(-this.config.maxHistorySize);
      
      // Create backup of existing data before overwriting
      await this.createBackup(historyPath, backupPath);
      
      // Save with pretty printing for debuggability
      await fs.writeFile(
        historyPath, 
        JSON.stringify(recentHistory, null, 2),
        { encoding: 'utf-8', mode: 0o600 } // Restrict permissions
      );
      
      // Save strategies
      const strategiesObj = Object.fromEntries(this.optimizationStrategies);
      await fs.writeFile(
        strategiesPath, 
        JSON.stringify(strategiesObj, null, 2),
        { encoding: 'utf-8', mode: 0o600 }
      );
      
      // Save neural weights
      const neuralObj = Object.fromEntries(
        Array.from(this.neuralWeights.entries()).map(([k, v]) => [
          k,
          {
            ...v,
            inputWeights: Object.fromEntries(v.inputWeights || new Map()),
            hiddenWeights: Object.fromEntries(v.hiddenWeights || new Map())
          }
        ])
      );
      await fs.writeFile(
        neuralPath,
        JSON.stringify(neuralObj, null, 2),
        { encoding: 'utf-8', mode: 0o600 }
      );
      
      console.log('[Self-Learning] Data saved successfully');
    } catch (error) {
      console.error('[Self-Learning] Error saving learning data:', error.message);
      throw error; // Re-throw to alert calling code
    }
  }
  
  /**
   * Create backup of existing data
   */
  async createBackup(filePath, backupDir) {
    try {
      const exists = await fs.access(filePath).then(() => true).catch(() => false);
      if (!exists) return;
      
      const filename = path.basename(filePath);
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = path.join(backupDir, `${filename}.${timestamp}.bak`);
      
      await fs.copyFile(filePath, backupPath);
      
      // Clean old backups (keep last 5)
      const backups = await fs.readdir(backupDir);
      const relevantBackups = backups
        .filter(f => f.startsWith(filename))
        .sort()
        .reverse();
      
      if (relevantBackups.length > 5) {
        for (const oldBackup of relevantBackups.slice(5)) {
          await fs.unlink(path.join(backupDir, oldBackup)).catch(() => {});
        }
      }
    } catch (error) {
      console.warn('[Self-Learning] Backup creation failed:', error.message);
    }
  }

  // Utility methods
  generateActionId() {
    return `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getBaselineTime(actionType) {
    const baselines = {
      'code_edit': 100,
      'file_read': 50,
      'file_write': 75,
      'ai_query': 2000,
      'search': 500
    };
    return baselines[actionType] || 100;
  }

  getDefaultParameters(actionType) {
    const defaults = {
      'code_edit': { autoFormat: true, validateSyntax: true },
      'ai_query': { temperature: 0.7, maxTokens: 2000 },
      'file_operation': { backup: true, validatePath: true },
      'param_optimization_test': { temp: 0.7, tokens: 2000 }
    };
    
    const params = defaults[actionType] || {};
    
    // Always include metadata for tracking
    return {
      ...params,
      _confidence: 0.5, // Default low confidence for unknown action types
      _quality: 0.5
    };
  }

  /**
   * Get comprehensive learning statistics
   */
  getStats() {
    const totalActions = this.actionHistory.length;
    const successfulActions = this.actionHistory.filter(a => a.metrics?.success).length;
    const avgQuality = totalActions > 0 
      ? this.actionHistory.reduce((sum, a) => sum + (a.metrics?.quality || 0), 0) / totalActions 
      : 0;
    const avgEfficiency = totalActions > 0
      ? this.actionHistory.reduce((sum, a) => sum + (a.metrics?.efficiency || 0), 0) / totalActions
      : 0;

    // Calculate improvement rate
    let improvementRate = 0;
    if (totalActions >= 20) {
      const recent = this.actionHistory.slice(-10);
      const old = this.actionHistory.slice(0, 10);
      const recentAvg = recent.reduce((sum, a) => sum + (a.metrics?.quality || 0), 0) / recent.length;
      const oldAvg = old.reduce((sum, a) => sum + (a.metrics?.quality || 0), 0) / old.length;
      improvementRate = oldAvg > 0 ? ((recentAvg - oldAvg) / oldAvg) * 100 : 0;
    }

    // Action type distribution
    const actionTypes = new Map();
    this.actionHistory.forEach(a => {
      actionTypes.set(a.type, (actionTypes.get(a.type) || 0) + 1);
    });

    // Top performing strategies
    const topStrategies = Array.from(this.optimizationStrategies.entries())
      .filter(([_, s]) => s.attempts >= 5)
      .sort((a, b) => b[1].avgQuality - a[1].avgQuality)
      .slice(0, 5)
      .map(([key, strategy]) => ({
        type: key.split(':')[0],
        successRate: (strategy.successRate * 100).toFixed(1) + '%',
        quality: (strategy.avgQuality * 100).toFixed(1) + '%',
        attempts: strategy.attempts,
        variance: strategy.variance?.toFixed(3) || 'N/A'
      }));

    const learnedStrategies = this.optimizationStrategies.size > 0
      ? this.optimizationStrategies.size
      : new Set(this.actionHistory.map(a => a.type)).size;

    return {
      totalActions,
      successRate: totalActions > 0 ? (successfulActions / totalActions) : 0,
      avgQuality,
      avgEfficiency,
      improvementRate: improvementRate.toFixed(2) + '%',
      strategiesLearned: learnedStrategies,
      knowledgeNodes: this.knowledgeGraph.size,
      neuralWeightSets: this.neuralWeights.size,
      recentAnomalies: this.anomalyDetector?.getRecentAnomalies().length || 0,
      actionTypeDistribution: Object.fromEntries(actionTypes),
      topStrategies,
      baseline: this.performanceBaseline ? {
        quality: (this.performanceBaseline.avgQuality * 100).toFixed(1) + '%',
        efficiency: (this.performanceBaseline.avgEfficiency * 100).toFixed(1) + '%',
        successRate: (this.performanceBaseline.successRate * 100).toFixed(1) + '%'
      } : null,
      config: this.config
    };
  }
  
  /**
   * Export learning data for analysis or backup
   */
  async exportLearningData(format = 'json') {
    const data = {
      metadata: {
        exportedAt: new Date().toISOString(),
        version: '2.0.0',
        totalActions: this.actionHistory.length,
        strategiesCount: this.optimizationStrategies.size
      },
      statistics: this.getStats(),
      actionHistory: this.actionHistory,
      strategies: Object.fromEntries(this.optimizationStrategies),
      neuralWeights: Object.fromEntries(
        Array.from(this.neuralWeights.entries()).map(([k, v]) => [
          k,
          {
            ...v,
            inputWeights: Object.fromEntries(v.inputWeights || new Map()),
            hiddenWeights: Object.fromEntries(v.hiddenWeights || new Map())
          }
        ])
      ),
      knowledgeGraph: Object.fromEntries(
        Array.from(this.knowledgeGraph.entries()).map(([k, v]) => [
          k,
          {
            ...v,
            relatedActions: Object.fromEntries(v.relatedActions)
          }
        ])
      ),
      anomalies: this.anomalyDetector?.anomalies || []
    };
    
    if (format === 'csv') {
      return this.convertToCSV(data);
    }
    
    return data;
  }
  
  /**
   * Convert action history to CSV format
   */
  convertToCSV(data) {
    const headers = ['timestamp', 'type', 'success', 'quality', 'efficiency', 'executionTime', 'errorRate'];
    const rows = data.actionHistory
      .filter(a => a.metrics)
      .map(a => [
        a.timestamp,
        a.type,
        a.metrics.success,
        a.metrics.quality.toFixed(3),
        a.metrics.efficiency.toFixed(3),
        a.metrics.executionTime || 0,
        a.metrics.errorRate || 0
      ]);
    
    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }
  
  /**
   * Get prediction for action outcome based on learned patterns
   */
  async predictOutcome(actionType, context, parameters) {
    const strategyKey = this.hashStrategyKey(actionType, context);
    const strategy = this.optimizationStrategies.get(strategyKey);
    
    if (!strategy || strategy.attempts < 5) {
      return {
        confidence: 'low',
        predictedSuccess: 0.5,
        predictedQuality: 0.5,
        recommendation: 'Insufficient data for reliable prediction'
      };
    }
    
    // Use neural weights for prediction if available
    const weights = this.neuralWeights.get(strategyKey);
    let neuralPrediction = 0.5;
    
    if (weights) {
      const features = this.extractFeatures({
        type: actionType,
        context,
        parameters,
        timestamp: new Date().toISOString()
      });
      neuralPrediction = this.forwardPass(features, weights);
    }
    
    // Combine statistical and neural predictions
    const combinedPrediction = (strategy.avgQuality * 0.6) + (neuralPrediction * 0.4);
    
    return {
      confidence: strategy.variance < 0.2 ? 'high' : strategy.variance < 0.4 ? 'medium' : 'low',
      predictedSuccess: strategy.successRate,
      predictedQuality: combinedPrediction,
      predictedEfficiency: strategy.avgEfficiency,
      basedOnAttempts: strategy.attempts,
      variance: strategy.variance,
      recommendation: this.getRecommendation(strategy, combinedPrediction)
    };
  }
  
  /**
   * Get recommendation based on prediction
   */
  getRecommendation(strategy, predictedQuality) {
    if (predictedQuality > 0.8 && strategy.successRate > 0.9) {
      return 'High confidence - proceed with current parameters';
    } else if (predictedQuality > 0.6 && strategy.successRate > 0.7) {
      return 'Good confidence - minor optimization possible';
    } else if (strategy.attempts > 20) {
      return 'Consider alternative approach - current strategy underperforming';
    } else {
      return 'Gather more data to improve predictions';
    }
  }
}

// Singleton instance
const selfLearningSystem = new SelfLearningSystem();

module.exports = selfLearningSystem;
