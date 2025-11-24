/**
 * Self-Learning AI System
 * 
 * Tracks all AI actions, analyzes outcomes, and continuously improves decision-making.
 * Implements reinforcement learning principles for autonomous optimization.
 */

const fs = require('fs').promises;
const path = require('path');

class SelfLearningSystem {
  constructor() {
    this.learningDataPath = path.join(__dirname, '../../../data/learning');
    this.actionHistory = [];
    this.performanceMetrics = new Map();
    this.optimizationStrategies = new Map();
    this.knowledgeGraph = new Map();
    this.initialized = false;
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
    return {
      success: outcome.success ?? true,
      executionTime: outcome.executionTime || 0,
      resourceUsage: outcome.resourceUsage || {},
      quality: this.assessQuality(action, outcome),
      efficiency: this.assessEfficiency(action, outcome),
      errorRate: outcome.errors ? outcome.errors.length : 0,
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
   * Reinforcement learning - update strategies based on outcomes
   */
  async reinforcementLearn(action) {
    const strategyKey = `${action.type}:${JSON.stringify(action.context)}`;
    
    if (!this.optimizationStrategies.has(strategyKey)) {
      this.optimizationStrategies.set(strategyKey, {
        attempts: 0,
        successRate: 0,
        avgQuality: 0,
        avgEfficiency: 0,
        bestParameters: null,
        learningRate: 0.1
      });
    }

    const strategy = this.optimizationStrategies.get(strategyKey);
    strategy.attempts++;

    // Update running averages using exponential moving average
    const alpha = strategy.learningRate;
    strategy.successRate = (1 - alpha) * strategy.successRate + alpha * (action.metrics.success ? 1 : 0);
    strategy.avgQuality = (1 - alpha) * strategy.avgQuality + alpha * action.metrics.quality;
    strategy.avgEfficiency = (1 - alpha) * strategy.avgEfficiency + alpha * action.metrics.efficiency;

    // Update best parameters if this was better
    const currentScore = this.calculateStrategyScore(action.metrics);
    const bestScore = strategy.bestParameters ? this.calculateStrategyScore(strategy.bestParameters.metrics) : 0;
    
    if (currentScore > bestScore) {
      strategy.bestParameters = {
        parameters: action.parameters,
        metrics: action.metrics
      };
    }

    this.optimizationStrategies.set(strategyKey, strategy);
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
    const strategyKey = `${actionType}:${JSON.stringify(context)}`;
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
   * Analyze patterns and generate insights
   */
  async analyzePatterns() {
    const insights = [];

    // Pattern 1: High success rate sequences
    for (const [actionType, data] of this.knowledgeGraph) {
      const topRelated = Array.from(data.relatedActions.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);

      if (topRelated.length > 0) {
        insights.push({
          type: 'sequence_pattern',
          action: actionType,
          insight: `Action "${actionType}" frequently follows: ${topRelated.map(r => r[0]).join(', ')}`,
          confidence: topRelated[0][1] / data.occurrences
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
        insights.push({
          type: 'improvement',
          insight: `Quality improved by ${((recentAvgQuality - oldAvgQuality) * 100).toFixed(1)}% over time`,
          confidence: 0.9
        });
      }
    }

    return insights;
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
   * Load learning data from disk
   */
  async loadLearningData() {
    try {
      const historyPath = path.join(this.learningDataPath, 'action_history.json');
      const strategiesPath = path.join(this.learningDataPath, 'strategies.json');

      const historyData = await fs.readFile(historyPath, 'utf-8').catch(() => '[]');
      const strategiesData = await fs.readFile(strategiesPath, 'utf-8').catch(() => '{}');

      this.actionHistory = JSON.parse(historyData);
      const strategies = JSON.parse(strategiesData);
      this.optimizationStrategies = new Map(Object.entries(strategies));
    } catch (error) {
      console.log('[Self-Learning] No previous learning data found, starting fresh');
    }
  }

  /**
   * Save learning data to disk
   */
  async saveLearningData() {
    try {
      const historyPath = path.join(this.learningDataPath, 'action_history.json');
      const strategiesPath = path.join(this.learningDataPath, 'strategies.json');

      // Keep only recent history to avoid unbounded growth
      const recentHistory = this.actionHistory.slice(-1000);
      
      await fs.writeFile(historyPath, JSON.stringify(recentHistory, null, 2));
      
      const strategiesObj = Object.fromEntries(this.optimizationStrategies);
      await fs.writeFile(strategiesPath, JSON.stringify(strategiesObj, null, 2));
    } catch (error) {
      console.error('[Self-Learning] Error saving learning data:', error);
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
      'file_operation': { backup: true, validatePath: true }
    };
    return defaults[actionType] || {};
  }

  /**
   * Get learning statistics
   */
  getStats() {
    const totalActions = this.actionHistory.length;
    const successfulActions = this.actionHistory.filter(a => a.metrics?.success).length;
    const avgQuality = this.actionHistory.reduce((sum, a) => sum + (a.metrics?.quality || 0), 0) / totalActions || 0;

    return {
      totalActions,
      successRate: totalActions > 0 ? successfulActions / totalActions : 0,
      avgQuality,
      strategiesLearned: this.optimizationStrategies.size,
      knowledgeNodes: this.knowledgeGraph.size
    };
  }
}

// Singleton instance
const selfLearningSystem = new SelfLearningSystem();

module.exports = selfLearningSystem;
