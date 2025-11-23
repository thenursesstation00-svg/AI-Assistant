// backend/src/routes/aiIntelligence.js
// API Routes for AI Intelligence System

const express = require('express');
const router = express.Router();
const selfAwareness = require('../services/ai/selfAwareness');
const autonomousLearning = require('../services/ai/autonomousLearning');
const agentFactory = require('../services/ai/agentFactory');
const goalSystem = require('../services/ai/goalSystem');
const integrationFramework = require('../services/ai/integrationFramework');

// ===== SELF-AWARENESS ENDPOINTS =====

/**
 * Get AI's self-knowledge and identity
 */
router.get('/self-knowledge', async (req, res) => {
  try {
    const knowledge = selfAwareness.getSelfKnowledge();
    res.json({ success: true, data: knowledge });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Store a memory
 */
router.post('/memory', async (req, res) => {
  try {
    const { type, content, metadata } = req.body;
    const memory = selfAwareness.storeMemory(type, content, metadata);
    res.json({ success: true, data: memory });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Recall memories
 */
router.get('/memory', async (req, res) => {
  try {
    const { type, tags, limit } = req.query;
    const memories = selfAwareness.recallMemories({
      type,
      tags: tags ? tags.split(',') : undefined,
      limit: limit ? parseInt(limit) : undefined
    });
    res.json({ success: true, data: memories });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Trigger AI reflection
 */
router.post('/reflect', async (req, res) => {
  try {
    const { topic } = req.body;
    const reflection = await selfAwareness.reflect(topic);
    res.json({ success: true, data: reflection });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Get AI's personality
 */
router.get('/personality', async (req, res) => {
  try {
    const personality = selfAwareness.getPersonality();
    res.json({ success: true, data: personality });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ===== AUTONOMOUS LEARNING ENDPOINTS =====

/**
 * Learn a new concept
 */
router.post('/learn/concept', async (req, res) => {
  try {
    const concept = await autonomousLearning.learnConcept(req.body);
    res.json({ success: true, data: concept });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Acquire a new skill
 */
router.post('/learn/skill', async (req, res) => {
  try {
    const skill = await autonomousLearning.acquireSkill(req.body);
    res.json({ success: true, data: skill });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Learn from interaction
 */
router.post('/learn/interaction', async (req, res) => {
  try {
    const learning = await autonomousLearning.learnFromInteraction(req.body);
    res.json({ success: true, data: learning });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Self-teaching session
 */
router.post('/learn/self-teach', async (req, res) => {
  try {
    const { topic, timeLimit } = req.body;
    const result = await autonomousLearning.selfTeach(topic, timeLimit);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Get learning analytics
 */
router.get('/learn/analytics', async (req, res) => {
  try {
    const analytics = autonomousLearning.getLearningAnalytics();
    res.json({ success: true, data: analytics });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ===== AGENT FACTORY ENDPOINTS =====

/**
 * Build a new agent
 */
router.post('/agents/build', async (req, res) => {
  try {
    const agent = await agentFactory.buildAgent(req.body);
    res.json({ success: true, data: agent });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Deploy an agent
 */
router.post('/agents/:agentId/deploy', async (req, res) => {
  try {
    const { agentId } = req.params;
    const { target, config } = req.body;
    const deployment = await agentFactory.deployAgent(agentId, target, config);
    res.json({ success: true, data: deployment });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Execute an agent
 */
router.post('/agents/:agentId/execute', async (req, res) => {
  try {
    const { agentId } = req.params;
    const { task, input } = req.body;
    const result = await agentFactory.executeAgent(agentId, task, input);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * List all agents
 */
router.get('/agents', async (req, res) => {
  try {
    const agents = agentFactory.listAgents(req.query);
    res.json({ success: true, data: agents });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Get agent analytics
 */
router.get('/agents/:agentId/analytics', async (req, res) => {
  try {
    const { agentId } = req.params;
    const analytics = agentFactory.getAgentAnalytics(agentId);
    res.json({ success: true, data: analytics });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ===== GOAL SYSTEM ENDPOINTS =====

/**
 * Create AI-generated goal
 */
router.post('/goals/ai', async (req, res) => {
  try {
    const goal = await goalSystem.createAIGoal(req.body);
    res.json({ success: true, data: goal });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Create user-defined goal
 */
router.post('/goals/user', async (req, res) => {
  try {
    const goal = await goalSystem.createUserGoal(req.body);
    res.json({ success: true, data: goal });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Update task status
 */
router.patch('/goals/tasks/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status, notes } = req.body;
    const result = await goalSystem.updateTaskStatus(taskId, status, notes);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Get active goals
 */
router.get('/goals/active', async (req, res) => {
  try {
    const goals = goalSystem.getActiveGoals(req.query);
    res.json({ success: true, data: goals });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Get goal details
 */
router.get('/goals/:goalId', async (req, res) => {
  try {
    const { goalId } = req.params;
    const details = goalSystem.getGoalDetails(goalId);
    res.json({ success: true, data: details });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * AI suggests new goals
 */
router.get('/goals/suggestions', async (req, res) => {
  try {
    const suggestions = await goalSystem.suggestGoals();
    res.json({ success: true, data: suggestions });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ===== INTEGRATION FRAMEWORK ENDPOINTS =====

/**
 * Connect to an app
 */
router.post('/integrations/connect', async (req, res) => {
  try {
    const integration = await integrationFramework.connect(req.body);
    res.json({ success: true, data: integration });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Execute integration action
 */
router.post('/integrations/:integrationId/execute', async (req, res) => {
  try {
    const { integrationId } = req.params;
    const { action_type, params } = req.body;
    const result = await integrationFramework.executeAction(integrationId, action_type, params);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Create webhook
 */
router.post('/integrations/webhooks', async (req, res) => {
  try {
    const webhook = await integrationFramework.createWebhook(req.body);
    res.json({ success: true, data: webhook });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Handle webhook (public endpoint - no auth needed)
 */
router.post('/integrations/webhooks/:webhookId', async (req, res) => {
  try {
    const { webhookId } = req.params;
    const signature = req.headers['x-webhook-signature'];
    const result = await integrationFramework.handleWebhook(webhookId, req.body, signature);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * List integrations
 */
router.get('/integrations', async (req, res) => {
  try {
    const integrations = integrationFramework.listIntegrations(req.query);
    res.json({ success: true, data: integrations });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Get integration details
 */
router.get('/integrations/:integrationId', async (req, res) => {
  try {
    const { integrationId } = req.params;
    const details = integrationFramework.getIntegrationDetails(integrationId);
    res.json({ success: true, data: details });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
