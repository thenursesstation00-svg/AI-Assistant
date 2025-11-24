# Self-Learning AI System - API Documentation

## Overview

The Enhanced Self-Learning AI System is a sophisticated reinforcement learning engine with neural network-inspired pattern recognition, anomaly detection, and temporal analysis capabilities. It continuously learns from actions and outcomes to optimize decision-making.

**Version:** 2.0.0  
**Module:** `backend/src/services/ai/selfLearning.js`

---

## Table of Contents

1. [Architecture](#architecture)
2. [Core Concepts](#core-concepts)
3. [API Reference](#api-reference)
4. [Configuration](#configuration)
5. [Usage Examples](#usage-examples)
6. [Advanced Features](#advanced-features)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

---

## Architecture

### System Components

```
┌─────────────────────────────────────────────────┐
│           Self-Learning Engine                  │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌──────────────┐     ┌────────────────────┐  │
│  │  Action      │────▶│  Reinforcement     │  │
│  │  Recording   │     │  Learning Engine   │  │
│  └──────────────┘     └────────────────────┘  │
│         │                      │               │
│         ▼                      ▼               │
│  ┌──────────────┐     ┌────────────────────┐  │
│  │  Neural      │────▶│  Pattern           │  │
│  │  Network     │     │  Recognition       │  │
│  └──────────────┘     └────────────────────┘  │
│         │                      │               │
│         ▼                      ▼               │
│  ┌──────────────┐     ┌────────────────────┐  │
│  │  Anomaly     │     │  Temporal          │  │
│  │  Detection   │     │  Analysis          │  │
│  └──────────────┘     └────────────────────┘  │
│         │                      │               │
│         └──────────┬───────────┘               │
│                    ▼                           │
│         ┌────────────────────┐                 │
│         │  Data Persistence  │                 │
│         │  & Backup System   │                 │
│         └────────────────────┘                 │
└─────────────────────────────────────────────────┘
```

### Data Flow

```
Action → Feature Extraction → Neural Weights → Strategy Selection
   ↓                                                    ↓
Outcome → Reward Calculation → Weight Update → Learning
   ↓                                                    ↓
Anomaly Detection → Pattern Analysis → Insights → Optimization
```

---

## Core Concepts

### 1. Actions

Actions represent discrete operations performed by the system:

```javascript
{
  id: "action_1234567890",
  type: "code_edit",
  timestamp: "2025-01-15T10:30:00.000Z",
  context: { file: "app.js", language: "javascript" },
  parameters: { temperature: 0.7, maxTokens: 2000 },
  metadata: { user: "developer" }
}
```

### 2. Outcomes

Outcomes measure the result of actions:

```javascript
{
  success: true,
  quality: 0.85,
  efficiency: 0.90,
  executionTime: 150,
  errors: [],
  userSatisfaction: 0.92
}
```

### 3. Strategies

Strategies are learned patterns of successful actions:

```javascript
{
  key: "code_edit:{context_hash}",
  value: 0.87,        // Learned success probability
  attempts: 42,
  variance: 0.12,
  lastUpdate: "2025-01-15T10:30:00.000Z"
}
```

### 4. Neural Weights

Feature-based weights for pattern recognition:

```javascript
{
  featureSet: "code_edit",
  weights: {
    "hour_normalized": 0.15,
    "param_temperature": 0.23,
    "context_complexity": 0.18,
    // ...
  },
  activationFunction: "relu"
}
```

---

## API Reference

### Core Methods

#### `initialize()`

Initialize the self-learning system.

```javascript
await selfLearning.initialize();
```

**Returns:** `Promise<void>`

**Example:**
```javascript
const selfLearning = require('./services/ai/selfLearning');
await selfLearning.initialize();
console.log('Self-learning system ready');
```

---

#### `recordAction(action)`

Record a new action for learning.

**Parameters:**
- `action` (Object):
  - `type` (String, required): Action type identifier
  - `context` (Object, optional): Contextual information
  - `parameters` (Object, optional): Action parameters
  - `metadata` (Object, optional): Additional metadata

**Returns:** `Promise<String>` - Unique action ID

**Example:**
```javascript
const actionId = await selfLearning.recordAction({
  type: 'code_generation',
  context: {
    language: 'python',
    complexity: 'medium',
    domain: 'data_science'
  },
  parameters: {
    temperature: 0.7,
    maxTokens: 2000,
    useCache: true
  },
  metadata: {
    user: 'alice',
    session: 'session_123'
  }
});

console.log('Action recorded:', actionId);
```

---

#### `recordOutcome(actionId, outcome)`

Record the outcome of a previously recorded action.

**Parameters:**
- `actionId` (String, required): ID from `recordAction()`
- `outcome` (Object, required):
  - `success` (Boolean, required): Whether action succeeded
  - `quality` (Number, optional, 0-1): Quality metric
  - `efficiency` (Number, optional, 0-1): Efficiency metric
  - `executionTime` (Number, optional): Time in milliseconds
  - `errors` (Array, optional): List of errors
  - `userSatisfaction` (Number, optional, 0-1): User feedback
  - `errorRate` (Number, optional): Number of errors

**Returns:** `Promise<void>`

**Example:**
```javascript
await selfLearning.recordOutcome(actionId, {
  success: true,
  quality: 0.92,
  efficiency: 0.88,
  executionTime: 250,
  errors: [],
  userSatisfaction: 0.95
});
```

---

#### `analyzePatterns()`

Analyze action history to discover patterns and insights.

**Returns:** `Promise<Array<Insight>>`

**Insight Object:**
```javascript
{
  type: "sequence_pattern" | "temporal_pattern" | "improvement" | "convergence",
  confidence: 0.85,
  priority: "high" | "medium" | "low",
  details: { /* type-specific details */ },
  support: 15,  // Number of supporting data points
  recommendation: "Consider using strategy X..."
}
```

**Example:**
```javascript
const insights = await selfLearning.analyzePatterns();

insights.forEach(insight => {
  console.log(`[${insight.priority}] ${insight.type}`);
  console.log(`  Confidence: ${(insight.confidence * 100).toFixed(1)}%`);
  console.log(`  ${insight.recommendation}`);
});
```

---

#### `getStats()`

Get comprehensive statistics about the learning system.

**Returns:** `Object` - Statistics object

**Statistics Object:**
```javascript
{
  totalActions: 1523,
  successRate: 0.87,
  avgQuality: 0.82,
  avgEfficiency: 0.85,
  avgExecutionTime: 145,
  improvementRate: 0.12,  // Quality improvement over time
  strategiesLearned: 47,
  knowledgeNodes: 128,
  neuralWeightSets: 23,
  recentAnomalies: 3,
  
  actionTypeDistribution: {
    "code_edit": 450,
    "code_generation": 320,
    "debugging": 280,
    // ...
  },
  
  topStrategies: [
    { key: "code_edit:hash123", value: 0.94, attempts: 56 },
    { key: "debugging:hash456", value: 0.91, attempts: 42 },
    // ...
  ],
  
  baseline: {
    avgQuality: 0.75,
    avgEfficiency: 0.78
  },
  
  config: { /* current configuration */ }
}
```

**Example:**
```javascript
const stats = selfLearning.getStats();
console.log(`Success Rate: ${(stats.successRate * 100).toFixed(1)}%`);
console.log(`Improvement: ${(stats.improvementRate * 100).toFixed(1)}%`);
console.log(`Strategies Learned: ${stats.strategiesLearned}`);
```

---

#### `exportLearningData(format)`

Export all learning data for analysis or backup.

**Parameters:**
- `format` (String, optional): Export format - `'json'` (default) or `'csv'`

**Returns:** `Promise<Object|String>` - Exported data

**JSON Export Structure:**
```javascript
{
  metadata: {
    version: "2.0.0",
    exportDate: "2025-01-15T10:30:00.000Z",
    totalActions: 1523,
    dataIntegrity: "valid"
  },
  statistics: { /* getStats() output */ },
  actionHistory: [ /* all actions */ ],
  strategies: { /* all learned strategies */ },
  neuralWeights: [ /* all neural weight sets */ ],
  knowledgeGraph: { /* knowledge graph nodes */ },
  anomalies: [ /* detected anomalies */ ]
}
```

**CSV Export:** Returns CSV string with columns:
- timestamp, type, success, quality, efficiency, executionTime, errors, anomaly

**Example:**
```javascript
// JSON export
const jsonData = await selfLearning.exportLearningData('json');
await fs.writeFile('learning_data.json', JSON.stringify(jsonData, null, 2));

// CSV export
const csvData = await selfLearning.exportLearningData('csv');
await fs.writeFile('learning_data.csv', csvData);
```

---

#### `predictOutcome(type, context, parameters)`

Predict the outcome of an action before executing it.

**Parameters:**
- `type` (String, required): Action type
- `context` (Object, required): Action context
- `parameters` (Object, required): Action parameters

**Returns:** `Promise<Prediction>`

**Prediction Object:**
```javascript
{
  confidence: "low" | "medium" | "high",
  predictedSuccess: 0.87,
  predictedQuality: 0.84,
  predictedEfficiency: 0.89,
  basedOnSamples: 42,
  recommendation: "High confidence prediction. This action type has performed well in similar contexts."
}
```

**Example:**
```javascript
const prediction = await selfLearning.predictOutcome(
  'code_generation',
  { language: 'python', complexity: 'medium' },
  { temperature: 0.7, maxTokens: 2000 }
);

if (prediction.confidence === 'high' && prediction.predictedSuccess > 0.8) {
  console.log('Proceed with action');
} else {
  console.log('Consider alternative approach');
  console.log(prediction.recommendation);
}
```

---

#### `getOptimizedParameters(type, context)`

Get optimized parameters for a specific action type and context.

**Parameters:**
- `type` (String, required): Action type
- `context` (Object, required): Action context

**Returns:** `Promise<Object>` - Optimized parameters with metadata

**Example:**
```javascript
const optimized = await selfLearning.getOptimizedParameters(
  'code_generation',
  { language: 'javascript', complexity: 'high' }
);

console.log('Recommended temperature:', optimized.temperature);
console.log('Recommended maxTokens:', optimized.maxTokens);
console.log('Confidence:', optimized._confidence);
console.log('Expected quality:', optimized._quality);
```

---

#### `generateImprovements()`

Generate recommendations for system improvements.

**Returns:** `Promise<Array<Improvement>>`

**Improvement Object:**
```javascript
{
  area: "parameter_tuning" | "strategy_expansion" | "anomaly_reduction",
  recommendation: "Detailed recommendation text",
  priority: "high" | "medium" | "low",
  potentialImpact: "High" | "Medium" | "Low"
}
```

**Example:**
```javascript
const improvements = await selfLearning.generateImprovements();

improvements
  .filter(i => i.priority === 'high')
  .forEach(improvement => {
    console.log(`\n[${improvement.area}]`);
    console.log(improvement.recommendation);
  });
```

---

#### `selfOptimize()`

Automatically apply optimization based on learned patterns.

**Returns:** `Promise<Object>` - Optimization results

**Example:**
```javascript
const result = await selfLearning.selfOptimize();
console.log(`Applied ${result.appliedOptimizations} optimizations`);
result.improvements.forEach(improvement => {
  console.log(`- ${improvement.recommendation}`);
});
```

---

### Data Persistence Methods

#### `saveLearningData()`

Save all learning data to disk with automatic backups.

**Returns:** `Promise<void>`

**Features:**
- Atomic writes with temp files
- Automatic backup rotation (keeps last 5 backups)
- File permission restriction (0o600)
- Data validation before save

**Example:**
```javascript
await selfLearning.saveLearningData();
console.log('Learning data saved successfully');
```

---

#### `loadLearningData()`

Load learning data from disk.

**Returns:** `Promise<void>`

**Features:**
- Validates data integrity
- Handles corrupted data gracefully
- Migrates old data formats
- Limits history size to configured maximum

**Example:**
```javascript
await selfLearning.loadLearningData();
console.log('Learning data loaded successfully');
```

---

### Utility Methods

#### `extractFeatures(action)`

Extract numerical features from an action for neural network processing.

**Parameters:**
- `action` (Object): Action object

**Returns:** `Map<String, Number>` - Feature map

**Example:**
```javascript
const features = selfLearning.extractFeatures({
  type: 'code_edit',
  timestamp: new Date().toISOString(),
  parameters: { temperature: 0.7, maxTokens: 2000 },
  context: { complexity: 5 }
});

console.log('Extracted features:');
for (const [feature, value] of features) {
  console.log(`  ${feature}: ${value.toFixed(4)}`);
}
```

---

#### `normalize(value, min, max)`

Normalize a value to 0-1 range.

**Parameters:**
- `value` (Number): Value to normalize
- `min` (Number): Minimum value
- `max` (Number): Maximum value

**Returns:** `Number` - Normalized value (0-1)

**Example:**
```javascript
const normalized = selfLearning.normalize(50, 0, 100);
console.log(normalized); // 0.5
```

---

#### `hashStrategyKey(type, context)`

Generate a consistent hash for strategy identification.

**Parameters:**
- `type` (String): Action type
- `context` (Object): Context object

**Returns:** `String` - Strategy key hash

**Example:**
```javascript
const key = selfLearning.hashStrategyKey('code_edit', { file: 'app.js' });
console.log(key); // "code_edit:abc123def456..."
```

---

## Configuration

Default configuration can be customized:

```javascript
{
  learningRate: 0.1,              // Base learning rate
  explorationRate: 0.15,          // Exploration vs exploitation
  explorationDecay: 0.995,        // Decay rate for exploration
  minExploration: 0.01,           // Minimum exploration rate
  discountFactor: 0.9,            // Future reward discount
  maxHistorySize: 10000,          // Maximum action history
  anomalyThreshold: 2.5,          // Z-score threshold for anomalies
  anomalyWindowSize: 100,         // Rolling window for anomaly detection
  
  // Multi-objective weights
  qualityWeight: 0.4,
  efficiencyWeight: 0.3,
  successWeight: 0.2,
  userSatisfactionWeight: 0.1,
  
  // Pattern detection
  minPatternSupport: 3,           // Minimum occurrences
  minPatternConfidence: 0.7,      // Minimum confidence
  
  // Neural network
  neuralLearningRate: 0.01,
  activationFunction: 'relu'
}
```

---

## Usage Examples

### Complete Workflow Example

```javascript
const selfLearning = require('./services/ai/selfLearning');

async function completeWorkflow() {
  // 1. Initialize
  await selfLearning.initialize();
  
  // 2. Get prediction before action
  const prediction = await selfLearning.predictOutcome(
    'code_review',
    { language: 'python', size: 'large' },
    { depth: 'thorough', checkStyle: true }
  );
  
  console.log('Prediction:', prediction);
  
  // 3. Record action
  const actionId = await selfLearning.recordAction({
    type: 'code_review',
    context: { language: 'python', size: 'large' },
    parameters: { depth: 'thorough', checkStyle: true }
  });
  
  // 4. Execute action (your code here)
  const result = await performCodeReview();
  
  // 5. Record outcome
  await selfLearning.recordOutcome(actionId, {
    success: result.success,
    quality: result.quality,
    efficiency: result.efficiency,
    executionTime: result.duration,
    errors: result.errors
  });
  
  // 6. Analyze patterns periodically
  const insights = await selfLearning.analyzePatterns();
  insights.forEach(insight => {
    if (insight.priority === 'high') {
      console.log('Important insight:', insight.recommendation);
    }
  });
  
  // 7. Get statistics
  const stats = selfLearning.getStats();
  console.log('System performance:', stats);
  
  // 8. Self-optimize
  await selfLearning.selfOptimize();
  
  // 9. Save progress
  await selfLearning.saveLearningData();
}

completeWorkflow().catch(console.error);
```

### Integration with Express Routes

```javascript
// routes/ai.js
const express = require('express');
const router = express.Router();
const selfLearning = require('../services/ai/selfLearning');

router.post('/analyze', async (req, res) => {
  const actionId = await selfLearning.recordAction({
    type: 'analysis',
    context: req.body.context,
    parameters: req.body.parameters
  });
  
  try {
    const result = await performAnalysis(req.body);
    
    await selfLearning.recordOutcome(actionId, {
      success: true,
      quality: result.quality,
      executionTime: result.duration
    });
    
    res.json(result);
  } catch (error) {
    await selfLearning.recordOutcome(actionId, {
      success: false,
      errors: [error.message]
    });
    
    res.status(500).json({ error: error.message });
  }
});

router.get('/stats', (req, res) => {
  const stats = selfLearning.getStats();
  res.json(stats);
});

router.get('/insights', async (req, res) => {
  const insights = await selfLearning.analyzePatterns();
  res.json(insights);
});

module.exports = router;
```

---

## Advanced Features

### Neural Network Integration

The system uses feature extraction and weight-based predictions:

```javascript
// Features are automatically extracted from actions
const features = selfLearning.extractFeatures(action);

// Neural weights are updated using backpropagation-like algorithm
// based on outcome quality and success
```

### Anomaly Detection

Detects unusual patterns using statistical analysis:

```javascript
const stats = selfLearning.getStats();
console.log('Recent anomalies:', stats.recentAnomalies);

// Anomalies are detected for:
// - Statistical outliers (Z-score > threshold)
// - Security issues (high error rates)
// - Performance degradation
```

### Temporal Pattern Analysis

Identifies time-based patterns:

```javascript
const insights = await selfLearning.analyzePatterns();
const temporalPatterns = insights.filter(i => i.type === 'temporal_pattern');

temporalPatterns.forEach(pattern => {
  console.log(`Better performance at: ${pattern.details.peakHours}`);
});
```

### Adaptive Learning Rate

Learning rate automatically adjusts based on strategy performance:

```javascript
// High variance → higher learning rate (more exploration)
// Low variance → lower learning rate (exploitation)
// Many attempts → lower learning rate (convergence)
```

---

## Best Practices

### 1. Record All Actions

```javascript
// ✅ Good - Record all meaningful actions
const actionId = await selfLearning.recordAction({ type, context, parameters });
await performAction();
await selfLearning.recordOutcome(actionId, outcome);

// ❌ Bad - Skipping action recording
await performAction();
```

### 2. Provide Rich Context

```javascript
// ✅ Good - Detailed context
await selfLearning.recordAction({
  type: 'code_generation',
  context: {
    language: 'python',
    complexity: 'medium',
    domain: 'data_science',
    framework: 'pandas'
  },
  parameters: { temperature: 0.7, maxTokens: 2000 }
});

// ❌ Bad - Minimal context
await selfLearning.recordAction({
  type: 'code_generation'
});
```

### 3. Use Predictions

```javascript
// ✅ Good - Check prediction before expensive operations
const prediction = await selfLearning.predictOutcome(type, context, parameters);
if (prediction.confidence === 'high' && prediction.predictedSuccess > 0.8) {
  await performExpensiveOperation();
} else {
  await tryAlternativeApproach();
}
```

### 4. Analyze Patterns Regularly

```javascript
// ✅ Good - Periodic analysis
setInterval(async () => {
  const insights = await selfLearning.analyzePatterns();
  await applyInsights(insights);
}, 3600000); // Every hour
```

### 5. Save Data Periodically

```javascript
// ✅ Good - Periodic saves
setInterval(async () => {
  await selfLearning.saveLearningData();
}, 300000); // Every 5 minutes

// ✅ Good - Save on shutdown
process.on('SIGTERM', async () => {
  await selfLearning.saveLearningData();
  process.exit(0);
});
```

---

## Troubleshooting

### High Memory Usage

**Problem:** Action history growing too large

**Solution:**
```javascript
// Reduce maxHistorySize in configuration
selfLearning.config.maxHistorySize = 5000;

// Or manually trigger data cleanup
await selfLearning.saveLearningData(); // Triggers cleanup
```

### Low Prediction Confidence

**Problem:** Predictions always show "low" confidence

**Solution:**
```javascript
// Need more training data for specific action types
// Ensure you're recording outcomes for all actions
const stats = selfLearning.getStats();
console.log('Actions per type:', stats.actionTypeDistribution);

// May need to reduce minPatternSupport
selfLearning.config.minPatternSupport = 2;
```

### Anomaly False Positives

**Problem:** Too many anomalies detected

**Solution:**
```javascript
// Increase anomaly threshold
selfLearning.config.anomalyThreshold = 3.0; // More strict

// Increase window size for more stable baseline
selfLearning.config.anomalyWindowSize = 200;
```

### Slow Learning

**Problem:** System not adapting quickly enough

**Solution:**
```javascript
// Increase learning rate
selfLearning.config.learningRate = 0.2;

// Increase exploration rate
selfLearning.config.explorationRate = 0.25;

// Decrease exploration decay for longer exploration
selfLearning.config.explorationDecay = 0.998;
```

---

## Performance Considerations

- **Action Recording:** O(1) - Constant time
- **Outcome Recording:** O(1) - Constant time
- **Pattern Analysis:** O(n) - Linear with history size
- **Statistics:** O(n) - Linear with history size
- **Prediction:** O(1) - Constant time (hash lookup)
- **Data Persistence:** O(n) - Linear with data size

**Memory Usage:** Approximately 1-2MB per 1000 actions

---

## Version History

- **2.0.0** (2025-01-15)
  - Added neural network integration
  - Implemented anomaly detection
  - Added temporal pattern analysis
  - Enhanced data persistence with backups
  - Added prediction capabilities
  - Improved statistics and reporting

- **1.0.0** (2024-12-01)
  - Initial release
  - Basic reinforcement learning
  - Simple pattern recognition

---

## Support and Contributing

For issues, questions, or contributions, please refer to:
- GitHub Repository: [Your Repository]
- Documentation: `/docs/`
- Contributing Guide: `/docs/CONTRIBUTING.md`

---

## License

See LICENSE file in the root directory.