# Self-Learning AI System - Usage Examples

Real-world examples demonstrating the enhanced self-learning capabilities.

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Code Generation Optimization](#code-generation-optimization)
3. [Bug Fix Pattern Learning](#bug-fix-pattern-learning)
4. [API Response Optimization](#api-response-optimization)
5. [User Interaction Patterns](#user-interaction-patterns)
6. [Performance Monitoring](#performance-monitoring)
7. [Anomaly Detection in Practice](#anomaly-detection-in-practice)
8. [Predictive Analysis](#predictive-analysis)
9. [Batch Processing](#batch-processing)
10. [Real-Time Adaptation](#real-time-adaptation)

---

## Quick Start

### Basic Setup

```javascript
const selfLearning = require('./backend/src/services/ai/selfLearning');

// Initialize the system
await selfLearning.initialize();
console.log('Self-learning system initialized');

// Get current stats
const stats = selfLearning.getStats();
console.log(`System has learned ${stats.strategiesLearned} strategies`);
console.log(`Success rate: ${(stats.successRate * 100).toFixed(1)}%`);
```

### Simple Action-Outcome Recording

```javascript
// Record an action
const actionId = await selfLearning.recordAction({
  type: 'code_format',
  context: { language: 'javascript', size: 'small' },
  parameters: { style: 'prettier', indentation: 2 }
});

// Perform the action
const result = await formatCode(code, options);

// Record the outcome
await selfLearning.recordOutcome(actionId, {
  success: result.success,
  quality: result.quality,
  executionTime: result.duration
});
```

---

## Code Generation Optimization

### Learning Optimal Parameters

```javascript
async function generateCodeWithLearning(prompt, language) {
  const context = {
    language,
    promptLength: prompt.length,
    complexity: analyzeComplexity(prompt)
  };
  
  // Get optimized parameters from previous learnings
  const optimized = await selfLearning.getOptimizedParameters(
    'code_generation',
    context
  );
  
  console.log('Using optimized parameters:', optimized);
  
  // Use optimized or default parameters
  const parameters = {
    temperature: optimized.temperature || 0.7,
    maxTokens: optimized.maxTokens || 2000,
    topP: optimized.topP || 0.9
  };
  
  // Record the action
  const actionId = await selfLearning.recordAction({
    type: 'code_generation',
    context,
    parameters
  });
  
  // Generate code
  const startTime = Date.now();
  const code = await generateCode(prompt, language, parameters);
  const executionTime = Date.now() - startTime;
  
  // Evaluate quality
  const quality = await evaluateCodeQuality(code, language);
  const testsPass = await runTests(code);
  
  // Record outcome
  await selfLearning.recordOutcome(actionId, {
    success: testsPass,
    quality: quality.score,
    efficiency: quality.efficiency,
    executionTime,
    errors: quality.errors,
    userSatisfaction: quality.maintainability
  });
  
  return code;
}

// Usage
const code = await generateCodeWithLearning(
  'Create a REST API endpoint for user authentication',
  'javascript'
);
```

### Monitoring Generation Quality Over Time

```javascript
async function monitorGenerationQuality() {
  const stats = selfLearning.getStats();
  
  console.log('\n📊 Code Generation Statistics:');
  console.log(`Total generations: ${stats.actionTypeDistribution.code_generation || 0}`);
  console.log(`Average quality: ${(stats.avgQuality * 100).toFixed(1)}%`);
  console.log(`Improvement rate: ${(stats.improvementRate * 100).toFixed(1)}%`);
  
  // Get insights
  const insights = await selfLearning.analyzePatterns();
  const codeInsights = insights.filter(i => 
    i.details && i.details.type === 'code_generation'
  );
  
  console.log('\n💡 Insights:');
  codeInsights.forEach(insight => {
    console.log(`  [${insight.priority}] ${insight.recommendation}`);
  });
}

// Run every hour
setInterval(monitorGenerationQuality, 3600000);
```

---

## Bug Fix Pattern Learning

### Learning from Debug Sessions

```javascript
async function debugWithLearning(errorType, codeContext, debugStrategy) {
  const context = {
    errorType,
    language: codeContext.language,
    framework: codeContext.framework,
    errorFrequency: analyzeErrorFrequency(errorType)
  };
  
  const parameters = {
    strategy: debugStrategy,
    depth: 'thorough',
    includeTests: true
  };
  
  // Check prediction
  const prediction = await selfLearning.predictOutcome(
    'debugging',
    context,
    parameters
  );
  
  console.log(`Prediction: ${prediction.confidence} confidence`);
  console.log(`Expected success: ${(prediction.predictedSuccess * 100).toFixed(1)}%`);
  
  if (prediction.confidence === 'low') {
    console.log('⚠️ Warning:', prediction.recommendation);
  }
  
  // Record action
  const actionId = await selfLearning.recordAction({
    type: 'debugging',
    context,
    parameters
  });
  
  // Perform debugging
  const startTime = Date.now();
  const debugResult = await performDebug(codeContext, debugStrategy);
  const executionTime = Date.now() - startTime;
  
  // Record outcome
  await selfLearning.recordOutcome(actionId, {
    success: debugResult.fixed,
    quality: debugResult.quality,
    efficiency: debugResult.efficiency,
    executionTime,
    errors: debugResult.remainingErrors
  });
  
  return debugResult;
}

// Usage
const result = await debugWithLearning(
  'TypeError',
  { language: 'python', framework: 'django' },
  'static_analysis'
);

if (!result.fixed) {
  // Try alternative strategy based on learning
  console.log('Trying alternative strategy...');
  await debugWithLearning(
    'TypeError',
    { language: 'python', framework: 'django' },
    'interactive_debugging'
  );
}
```

### Identifying Common Bug Patterns

```javascript
async function analyzeCommonBugPatterns() {
  const insights = await selfLearning.analyzePatterns();
  
  // Filter debugging-related insights
  const debugPatterns = insights.filter(i => 
    i.details && i.details.type === 'debugging'
  );
  
  console.log('\n🐛 Common Bug Patterns:');
  debugPatterns.forEach(pattern => {
    console.log(`\n${pattern.type.toUpperCase()}`);
    console.log(`  Confidence: ${(pattern.confidence * 100).toFixed(1)}%`);
    console.log(`  Support: ${pattern.support} occurrences`);
    console.log(`  Recommendation: ${pattern.recommendation}`);
  });
  
  // Get top debugging strategies
  const stats = selfLearning.getStats();
  const debugStrategies = stats.topStrategies.filter(s => 
    s.key.startsWith('debugging:')
  );
  
  console.log('\n✅ Most Effective Debugging Strategies:');
  debugStrategies.slice(0, 5).forEach((strategy, index) => {
    console.log(`  ${index + 1}. ${strategy.key}`);
    console.log(`     Success rate: ${(strategy.value * 100).toFixed(1)}%`);
    console.log(`     Used: ${strategy.attempts} times`);
  });
}

await analyzeCommonBugPatterns();
```

---

## API Response Optimization

### Learning Optimal Response Parameters

```javascript
async function handleApiRequest(req, res) {
  const context = {
    endpoint: req.path,
    method: req.method,
    userType: req.user.type,
    dataSize: JSON.stringify(req.body).length,
    timeOfDay: new Date().getHours()
  };
  
  // Get prediction for this request type
  const prediction = await selfLearning.predictOutcome(
    'api_request',
    context,
    { caching: true, compression: true }
  );
  
  // Record action
  const actionId = await selfLearning.recordAction({
    type: 'api_request',
    context,
    parameters: {
      caching: prediction.predictedEfficiency > 0.8,
      compression: req.body && req.body.length > 1000,
      timeout: 5000
    }
  });
  
  // Process request
  const startTime = Date.now();
  try {
    const result = await processRequest(req);
    const executionTime = Date.now() - startTime;
    
    // Record successful outcome
    await selfLearning.recordOutcome(actionId, {
      success: true,
      quality: result.quality || 1.0,
      efficiency: 1.0 - (executionTime / 5000), // Normalized to timeout
      executionTime,
      userSatisfaction: req.headers['x-user-satisfaction'] || 0.8
    });
    
    res.json(result);
  } catch (error) {
    const executionTime = Date.now() - startTime;
    
    // Record failed outcome
    await selfLearning.recordOutcome(actionId, {
      success: false,
      quality: 0,
      efficiency: 0,
      executionTime,
      errors: [error.message],
      errorRate: 1
    });
    
    res.status(500).json({ error: error.message });
  }
}
```

### Adaptive Timeout Learning

```javascript
async function adaptiveApiCall(endpoint, data) {
  const context = {
    endpoint,
    dataSize: JSON.stringify(data).length,
    complexity: analyzeComplexity(data)
  };
  
  // Get optimized parameters
  const optimized = await selfLearning.getOptimizedParameters(
    'api_call',
    context
  );
  
  const timeout = optimized.timeout || 3000;
  const retries = optimized.retries || 2;
  
  console.log(`Using adaptive timeout: ${timeout}ms, retries: ${retries}`);
  
  const actionId = await selfLearning.recordAction({
    type: 'api_call',
    context,
    parameters: { timeout, retries }
  });
  
  const startTime = Date.now();
  let attempts = 0;
  let lastError;
  
  while (attempts < retries) {
    try {
      const result = await callApi(endpoint, data, { timeout });
      const executionTime = Date.now() - startTime;
      
      await selfLearning.recordOutcome(actionId, {
        success: true,
        quality: 1.0,
        efficiency: 1.0 - (executionTime / timeout),
        executionTime
      });
      
      return result;
    } catch (error) {
      attempts++;
      lastError = error;
      
      if (attempts < retries) {
        await sleep(1000 * attempts); // Exponential backoff
      }
    }
  }
  
  // All attempts failed
  const executionTime = Date.now() - startTime;
  await selfLearning.recordOutcome(actionId, {
    success: false,
    quality: 0,
    efficiency: 0,
    executionTime,
    errors: [lastError.message],
    errorRate: retries
  });
  
  throw lastError;
}
```

---

## User Interaction Patterns

### Learning User Preferences

```javascript
async function handleUserAction(userId, actionType, parameters) {
  const context = {
    userId,
    userType: await getUserType(userId),
    timeOfDay: new Date().getHours(),
    dayOfWeek: new Date().getDay(),
    previousActions: await getRecentActions(userId)
  };
  
  // Get prediction for user satisfaction
  const prediction = await selfLearning.predictOutcome(
    actionType,
    context,
    parameters
  );
  
  console.log(`Predicted user satisfaction: ${(prediction.predictedQuality * 100).toFixed(1)}%`);
  
  // Record action
  const actionId = await selfLearning.recordAction({
    type: actionType,
    context,
    parameters,
    metadata: { userId }
  });
  
  // Perform action
  const result = await executeUserAction(actionType, parameters);
  
  // Get user feedback
  const feedback = await getUserFeedback(userId, result);
  
  // Record outcome with user satisfaction
  await selfLearning.recordOutcome(actionId, {
    success: result.success,
    quality: result.quality,
    efficiency: result.efficiency,
    executionTime: result.duration,
    userSatisfaction: feedback.satisfaction,
    errors: result.errors
  });
  
  return result;
}
```

### Personalized Recommendations

```javascript
async function getPersonalizedRecommendations(userId) {
  // Get user's action history
  const userActions = await getUserActionHistory(userId);
  const userContext = {
    userId,
    activityLevel: userActions.length,
    preferredTimes: analyzePreferredTimes(userActions),
    commonPatterns: analyzeCommonPatterns(userActions)
  };
  
  // Predict best actions for this user
  const actionTypes = ['search', 'create', 'edit', 'share', 'export'];
  const predictions = await Promise.all(
    actionTypes.map(async type => ({
      type,
      prediction: await selfLearning.predictOutcome(type, userContext, {})
    }))
  );
  
  // Sort by predicted success and quality
  const recommendations = predictions
    .filter(p => p.prediction.confidence !== 'low')
    .sort((a, b) => {
      const scoreA = a.prediction.predictedSuccess * a.prediction.predictedQuality;
      const scoreB = b.prediction.predictedSuccess * b.prediction.predictedQuality;
      return scoreB - scoreA;
    })
    .slice(0, 5);
  
  console.log('\n🎯 Personalized Recommendations:');
  recommendations.forEach((rec, index) => {
    console.log(`  ${index + 1}. ${rec.type}`);
    console.log(`     Expected success: ${(rec.prediction.predictedSuccess * 100).toFixed(1)}%`);
    console.log(`     Expected quality: ${(rec.prediction.predictedQuality * 100).toFixed(1)}%`);
  });
  
  return recommendations;
}
```

---

## Performance Monitoring

### Continuous Performance Tracking

```javascript
class PerformanceMonitor {
  constructor() {
    this.checkInterval = 300000; // 5 minutes
    this.alertThreshold = 0.7; // Alert if success rate drops below 70%
  }
  
  async start() {
    setInterval(() => this.check(), this.checkInterval);
    console.log('📊 Performance monitoring started');
  }
  
  async check() {
    const stats = selfLearning.getStats();
    const timestamp = new Date().toISOString();
    
    console.log(`\n[${timestamp}] Performance Check:`);
    console.log(`  Success Rate: ${(stats.successRate * 100).toFixed(1)}%`);
    console.log(`  Avg Quality: ${(stats.avgQuality * 100).toFixed(1)}%`);
    console.log(`  Avg Efficiency: ${(stats.avgEfficiency * 100).toFixed(1)}%`);
    console.log(`  Improvement Rate: ${(stats.improvementRate * 100).toFixed(1)}%`);
    console.log(`  Recent Anomalies: ${stats.recentAnomalies}`);
    
    // Check for performance degradation
    if (stats.successRate < this.alertThreshold) {
      await this.handlePerformanceDegradation(stats);
    }
    
    // Check for anomalies
    if (stats.recentAnomalies > 5) {
      await this.handleAnomalies(stats);
    }
    
    // Trigger self-optimization
    if (stats.improvementRate < 0.05) {
      console.log('  ⚙️ Triggering self-optimization...');
      await selfLearning.selfOptimize();
    }
  }
  
  async handlePerformanceDegradation(stats) {
    console.log('\n⚠️ ALERT: Performance degradation detected!');
    
    const insights = await selfLearning.analyzePatterns();
    const degradationInsights = insights.filter(i => 
      i.type === 'degradation' || i.priority === 'high'
    );
    
    console.log('\nDiagnostics:');
    degradationInsights.forEach(insight => {
      console.log(`  - ${insight.recommendation}`);
    });
    
    // Get improvement suggestions
    const improvements = await selfLearning.generateImprovements();
    console.log('\nRecommended Actions:');
    improvements.filter(i => i.priority === 'high').forEach(improvement => {
      console.log(`  - ${improvement.recommendation}`);
    });
    
    // Send alert to monitoring system
    await sendAlert('performance_degradation', { stats, insights, improvements });
  }
  
  async handleAnomalies(stats) {
    console.log('\n🚨 Multiple anomalies detected');
    
    // Export recent anomalies for analysis
    const exportData = await selfLearning.exportLearningData('json');
    const recentAnomalies = exportData.anomalies.slice(-10);
    
    console.log('\nRecent Anomalies:');
    recentAnomalies.forEach(anomaly => {
      console.log(`  [${anomaly.timestamp}] ${anomaly.type}`);
      console.log(`    ${anomaly.reason}`);
      console.log(`    Severity: ${anomaly.severity}`);
    });
    
    await sendAlert('anomaly_spike', { count: stats.recentAnomalies, anomalies: recentAnomalies });
  }
}

// Start monitoring
const monitor = new PerformanceMonitor();
await monitor.start();
```

---

## Anomaly Detection in Practice

### Real-Time Anomaly Alerts

```javascript
async function monitorForAnomalies() {
  let lastAnomalyCount = 0;
  
  setInterval(async () => {
    const stats = selfLearning.getStats();
    
    if (stats.recentAnomalies > lastAnomalyCount) {
      const newAnomalies = stats.recentAnomalies - lastAnomalyCount;
      console.log(`\n🚨 ${newAnomalies} new anomal${newAnomalies > 1 ? 'ies' : 'y'} detected!`);
      
      // Export and analyze
      const data = await selfLearning.exportLearningData('json');
      const latestAnomalies = data.anomalies.slice(-newAnomalies);
      
      latestAnomalies.forEach(anomaly => {
        console.log(`\n[${anomaly.type.toUpperCase()}] ${anomaly.timestamp}`);
        console.log(`  Severity: ${anomaly.severity}`);
        console.log(`  Reason: ${anomaly.reason}`);
        
        if (anomaly.details) {
          console.log(`  Details:`, anomaly.details);
        }
        
        // Take action based on anomaly type
        if (anomaly.severity === 'critical') {
          handleCriticalAnomaly(anomaly);
        }
      });
      
      lastAnomalyCount = stats.recentAnomalies;
    }
  }, 60000); // Check every minute
}

async function handleCriticalAnomaly(anomaly) {
  console.log('\n⚠️ CRITICAL ANOMALY - Taking corrective action');
  
  // Increase monitoring
  // Trigger backup
  await selfLearning.saveLearningData();
  
  // Alert administrators
  await sendAlert('critical_anomaly', anomaly);
  
  // If security-related, take protective measures
  if (anomaly.type === 'security') {
    await enableEnhancedSecurity();
  }
}

await monitorForAnomalies();
```

---

## Predictive Analysis

### Predicting System Load

```javascript
async function predictSystemLoad(timeWindow) {
  const context = {
    hour: new Date().getHours(),
    dayOfWeek: new Date().getDay(),
    month: new Date().getMonth(),
    recentLoad: await getRecentLoad()
  };
  
  const prediction = await selfLearning.predictOutcome(
    'system_load',
    context,
    { window: timeWindow }
  );
  
  console.log(`\n📈 System Load Prediction (${timeWindow} window):`);
  console.log(`  Confidence: ${prediction.confidence}`);
  console.log(`  Predicted load: ${(prediction.predictedEfficiency * 100).toFixed(1)}%`);
  console.log(`  ${prediction.recommendation}`);
  
  // Prepare resources if high load predicted
  if (prediction.predictedEfficiency < 0.5) {
    console.log('\n⚙️ High load predicted - scaling resources...');
    await scaleResources('up');
  }
  
  return prediction;
}

// Predict next hour
await predictSystemLoad('1h');
```

### Predictive Maintenance

```javascript
async function predictiveMaintenance() {
  const stats = selfLearning.getStats();
  const insights = await selfLearning.analyzePatterns();
  
  // Check for degradation patterns
  const degradation = insights.filter(i => 
    i.type === 'degradation' || 
    (i.details && i.details.trend === 'declining')
  );
  
  if (degradation.length > 0) {
    console.log('\n🔧 Predictive Maintenance Recommendations:');
    degradation.forEach(issue => {
      console.log(`\n${issue.priority.toUpperCase()} Priority:`);
      console.log(`  ${issue.recommendation}`);
      console.log(`  Confidence: ${(issue.confidence * 100).toFixed(1)}%`);
    });
    
    // Generate maintenance plan
    const improvements = await selfLearning.generateImprovements();
    console.log('\n📋 Maintenance Plan:');
    improvements
      .sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      })
      .forEach((item, index) => {
        console.log(`  ${index + 1}. [${item.priority}] ${item.area}`);
        console.log(`     ${item.recommendation}`);
        console.log(`     Impact: ${item.potentialImpact}`);
      });
  } else {
    console.log('\n✅ System health: No maintenance required');
  }
}

// Run daily
setInterval(predictiveMaintenance, 86400000);
```

---

## Batch Processing

### Batch Learning from Historical Data

```javascript
async function batchLearnFromHistory(historicalData) {
  console.log(`\n📚 Batch learning from ${historicalData.length} historical records...`);
  
  let processed = 0;
  let successful = 0;
  
  for (const record of historicalData) {
    try {
      const actionId = await selfLearning.recordAction({
        type: record.type,
        context: record.context,
        parameters: record.parameters,
        metadata: { source: 'historical', originalTimestamp: record.timestamp }
      });
      
      await selfLearning.recordOutcome(actionId, record.outcome);
      
      processed++;
      if (record.outcome.success) successful++;
      
      // Progress indicator
      if (processed % 100 === 0) {
        console.log(`  Processed: ${processed}/${historicalData.length}`);
      }
    } catch (error) {
      console.error(`Error processing record:`, error.message);
    }
  }
  
  console.log(`\n✅ Batch learning complete:`);
  console.log(`  Total processed: ${processed}`);
  console.log(`  Successful: ${successful}`);
  console.log(`  Success rate: ${((successful / processed) * 100).toFixed(1)}%`);
  
  // Analyze newly learned patterns
  const insights = await selfLearning.analyzePatterns();
  console.log(`  New insights discovered: ${insights.length}`);
  
  // Save the learned data
  await selfLearning.saveLearningData();
  
  return { processed, successful, insights };
}

// Load and process historical data
const historicalData = await loadHistoricalData('./data/historical.json');
await batchLearnFromHistory(historicalData);
```

---

## Real-Time Adaptation

### Dynamic Strategy Adjustment

```javascript
class AdaptiveSystem {
  constructor() {
    this.adaptationInterval = 60000; // 1 minute
    this.performanceWindow = [];
    this.maxWindowSize = 10;
  }
  
  async start() {
    setInterval(() => this.adapt(), this.adaptationInterval);
    console.log('🔄 Adaptive system started');
  }
  
  async adapt() {
    const stats = selfLearning.getStats();
    
    // Track performance over time
    this.performanceWindow.push({
      timestamp: new Date(),
      successRate: stats.successRate,
      avgQuality: stats.avgQuality,
      avgEfficiency: stats.avgEfficiency
    });
    
    if (this.performanceWindow.length > this.maxWindowSize) {
      this.performanceWindow.shift();
    }
    
    // Calculate trends
    const trend = this.calculateTrend();
    
    if (trend.direction === 'declining') {
      console.log('\n📉 Performance declining - Adapting strategies...');
      await this.adaptStrategies();
    } else if (trend.direction === 'improving') {
      console.log('\n📈 Performance improving - Reinforcing strategies...');
      await this.reinforceStrategies();
    }
  }
  
  calculateTrend() {
    if (this.performanceWindow.length < 3) {
      return { direction: 'stable', magnitude: 0 };
    }
    
    const recent = this.performanceWindow.slice(-3);
    const older = this.performanceWindow.slice(0, 3);
    
    const recentAvg = recent.reduce((sum, p) => sum + p.successRate, 0) / recent.length;
    const olderAvg = older.reduce((sum, p) => sum + p.successRate, 0) / older.length;
    
    const change = recentAvg - olderAvg;
    
    return {
      direction: change < -0.05 ? 'declining' : change > 0.05 ? 'improving' : 'stable',
      magnitude: Math.abs(change)
    };
  }
  
  async adaptStrategies() {
    // Increase exploration to find better strategies
    const currentExploration = selfLearning.config.explorationRate;
    selfLearning.config.explorationRate = Math.min(currentExploration * 1.5, 0.3);
    
    console.log(`  Increased exploration rate to ${selfLearning.config.explorationRate.toFixed(3)}`);
    
    // Get improvement suggestions
    const improvements = await selfLearning.generateImprovements();
    console.log(`  Found ${improvements.length} improvement opportunities`);
    
    // Apply high-priority improvements
    await selfLearning.selfOptimize();
  }
  
  async reinforceStrategies() {
    // Decrease exploration to exploit good strategies
    const currentExploration = selfLearning.config.explorationRate;
    selfLearning.config.explorationRate = Math.max(
      currentExploration * 0.9,
      selfLearning.config.minExploration
    );
    
    console.log(`  Decreased exploration rate to ${selfLearning.config.explorationRate.toFixed(3)}`);
  }
}

// Start adaptive system
const adaptive = new AdaptiveSystem();
await adaptive.start();
```

---

## Complete Application Example

```javascript
const express = require('express');
const selfLearning = require('./backend/src/services/ai/selfLearning');

class IntelligentApp {
  constructor() {
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
  }
  
  async initialize() {
    await selfLearning.initialize();
    console.log('✅ Self-learning system initialized');
    
    // Start background tasks
    this.startPerformanceMonitoring();
    this.startAdaptiveOptimization();
    this.startAnomalyDetection();
    
    // Load historical data if available
    await this.loadHistoricalData();
  }
  
  setupMiddleware() {
    this.app.use(express.json());
    this.app.use(this.requestLogger.bind(this));
  }
  
  async requestLogger(req, res, next) {
    const actionId = await selfLearning.recordAction({
      type: 'api_request',
      context: {
        endpoint: req.path,
        method: req.method,
        userAgent: req.headers['user-agent']
      },
      parameters: {
        hasBody: !!req.body,
        bodySize: JSON.stringify(req.body || {}).length
      }
    });
    
    req.learningActionId = actionId;
    req.learningStartTime = Date.now();
    
    next();
  }
  
  setupRoutes() {
    // Main API endpoint with learning
    this.app.post('/api/process', async (req, res) => {
      try {
        const result = await this.processWithLearning(req.body);
        
        await selfLearning.recordOutcome(req.learningActionId, {
          success: true,
          quality: result.quality,
          efficiency: result.efficiency,
          executionTime: Date.now() - req.learningStartTime
        });
        
        res.json(result);
      } catch (error) {
        await selfLearning.recordOutcome(req.learningActionId, {
          success: false,
          quality: 0,
          executionTime: Date.now() - req.learningStartTime,
          errors: [error.message]
        });
        
        res.status(500).json({ error: error.message });
      }
    });
    
    // Stats endpoint
    this.app.get('/api/stats', (req, res) => {
      const stats = selfLearning.getStats();
      res.json(stats);
    });
    
    // Insights endpoint
    this.app.get('/api/insights', async (req, res) => {
      const insights = await selfLearning.analyzePatterns();
      res.json(insights);
    });
    
    // Prediction endpoint
    this.app.post('/api/predict', async (req, res) => {
      const { type, context, parameters } = req.body;
      const prediction = await selfLearning.predictOutcome(type, context, parameters);
      res.json(prediction);
    });
    
    // Export endpoint
    this.app.get('/api/export/:format', async (req, res) => {
      const format = req.params.format;
      const data = await selfLearning.exportLearningData(format);
      
      if (format === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=learning_data.csv');
      } else {
        res.setHeader('Content-Type', 'application/json');
      }
      
      res.send(data);
    });
  }
  
  async processWithLearning(data) {
    // Get optimized parameters
    const optimized = await selfLearning.getOptimizedParameters(
      'processing',
      { dataSize: JSON.stringify(data).length }
    );
    
    // Process with learned parameters
    return await process(data, optimized);
  }
  
  startPerformanceMonitoring() {
    setInterval(async () => {
      const stats = selfLearning.getStats();
      console.log(`[${new Date().toISOString()}] Performance: Success=${(stats.successRate*100).toFixed(1)}%, Quality=${(stats.avgQuality*100).toFixed(1)}%`);
    }, 300000); // Every 5 minutes
  }
  
  startAdaptiveOptimization() {
    setInterval(async () => {
      await selfLearning.selfOptimize();
      console.log('⚙️ Self-optimization complete');
    }, 3600000); // Every hour
  }
  
  startAnomalyDetection() {
    let lastAnomalyCount = 0;
    setInterval(async () => {
      const stats = selfLearning.getStats();
      if (stats.recentAnomalies > lastAnomalyCount) {
        console.log(`🚨 ${stats.recentAnomalies - lastAnomalyCount} new anomalies detected`);
        lastAnomalyCount = stats.recentAnomalies;
      }
    }, 60000); // Every minute
  }
  
  async loadHistoricalData() {
    try {
      const historical = await loadData('./historical.json');
      await batchLearnFromHistory(historical);
      console.log('📚 Historical data loaded');
    } catch (error) {
      console.log('No historical data found');
    }
  }
  
  async shutdown() {
    console.log('\n🔄 Shutting down...');
    await selfLearning.saveLearningData();
    console.log('✅ Learning data saved');
    process.exit(0);
  }
  
  async start(port = 3000) {
    await this.initialize();
    
    this.app.listen(port, () => {
      console.log(`\n🚀 Intelligent app running on port ${port}`);
      console.log(`   Stats: http://localhost:${port}/api/stats`);
      console.log(`   Insights: http://localhost:${port}/api/insights`);
    });
    
    // Graceful shutdown
    process.on('SIGTERM', () => this.shutdown());
    process.on('SIGINT', () => this.shutdown());
  }
}

// Run the application
const app = new IntelligentApp();
app.start(3000);
```

---

## Tips and Best Practices

1. **Always record actions and outcomes** - The system learns from every interaction
2. **Use predictions before expensive operations** - Save resources
3. **Monitor anomalies regularly** - Catch issues early
4. **Leverage insights for optimization** - Act on discovered patterns
5. **Export data periodically** - For backup and analysis
6. **Use batch learning for historical data** - Bootstrap the system quickly
7. **Implement adaptive strategies** - Let the system self-optimize
8. **Track performance over time** - Measure improvement
9. **Provide rich context** - Better context = better learning
10. **Set up alerts for anomalies** - Respond quickly to issues

---

For more information, see:
- [API Documentation](./SELF_LEARNING_API.md)
- [Architecture Guide](./ADVANCED_AI_FOUNDATION.md)
- [Contributing Guide](./CONTRIBUTING.md)