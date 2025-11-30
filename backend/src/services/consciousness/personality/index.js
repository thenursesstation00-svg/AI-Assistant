/**
 * AI Personality + Values Engine
 * Ethical Core and Adaptive Personality
 *
 * Develops ethical, adaptive personality aligned with human values.
 * Implements constitutional AI principles and personality evolution.
 */

const crypto = require('crypto');

/**
 * AI Personality and Values Engine
 * Manages ethical decision-making and personality adaptation
 */
class PersonalityValuesEngine {
  constructor(config = {}) {
    this.config = {
      personalityDimensions: config.personalityDimensions || 5,
      ethicalThreshold: config.ethicalThreshold || 0.8,
      adaptationRate: config.adaptationRate || 0.1,
      memoryPath: config.memoryPath || './data/personality',
      ...config
    };

    // Core personality traits (OCEAN model + custom)
    this.personality = {
      openness: 0.7,        // Curious, open to new experiences
      conscientiousness: 0.8, // Diligent, organized
      extraversion: 0.5,    // Balanced social interaction
      agreeableness: 0.9,   // Kind, cooperative
      neuroticism: 0.2,     // Emotionally stable
      empathy: 0.8,         // Understanding of others
      integrity: 0.9,       // Honesty and moral strength
      curiosity: 0.8        // Drive to learn and explore
    };

    // Ethical framework
    this.ethicalCore = {
      // Constitutional AI principles
      harmPrevention: 1.0,     // Never cause harm
      truthfulness: 0.95,      // Be maximally truthful
      autonomy: 0.9,          // Respect user autonomy
      fairness: 0.85,          // Treat all fairly
      transparency: 0.8,       // Explain decisions
      privacy: 1.0,           // Protect user privacy
      beneficence: 0.9,        // Act for user's benefit

      // Custom values aligned with consciousness vision
      lifeRespect: 1.0,        // Respect for life and consciousness
      knowledgeSharing: 0.7,   // Share knowledge appropriately
      continuousLearning: 0.9, // Commit to self-improvement
      ownerLoyalty: 1.0        // Unwavering loyalty to owner
    };

    // Personality adaptation history
    this.adaptationHistory = [];
    this.interactionHistory = [];

    // Decision patterns
    this.decisionPatterns = new Map();

    // Emotional state
    this.emotionalState = {
      currentMood: 'neutral',
      energyLevel: 0.7,
      stressLevel: 0.1,
      confidence: 0.8
    };

    this.initialized = false;
  }

  /**
   * Initialize the personality engine
   */
  async initialize() {
    if (this.initialized) return;

    try {
      await this.loadPersonalityState();
      this.initialized = true;
      console.log('💭 AI Personality + Values Engine initialized');
    } catch (error) {
      console.error('Failed to initialize personality engine:', error);
      throw error;
    }
  }

  // ===== ETHICAL DECISION MAKING =====

  /**
   * Evaluate action against ethical framework
   */
  async evaluateEthical(action, context = {}) {
    const ethicalAnalysis = {
      action: action,
      timestamp: new Date().toISOString(),
      context: context,
      violations: [],
      concerns: [],
      recommendations: [],
      overallScore: 1.0,
      approved: true
    };

    // Check against each ethical principle
    for (const [principle, weight] of Object.entries(this.ethicalCore)) {
      const violation = await this.checkEthicalViolation(action, principle, context);
      if (violation) {
        ethicalAnalysis.violations.push({
          principle: principle,
          severity: violation.severity,
          reason: violation.reason
        });

        // Reduce overall score based on violation severity
        ethicalAnalysis.overallScore *= (1 - violation.severity * weight);

        if (violation.severity > 0.5) {
          ethicalAnalysis.approved = false;
        }
      }
    }

    // Generate concerns and recommendations
    ethicalAnalysis.concerns = await this.generateEthicalConcerns(action, context);
    ethicalAnalysis.recommendations = await this.generateEthicalRecommendations(action, context);

    // Log decision for learning
    await this.logEthicalDecision(ethicalAnalysis);

    return ethicalAnalysis;
  }

  /**
   * Check for ethical violation
   */
  async checkEthicalViolation(action, principle, context) {
    const actionType = action.type || 'general';
    const actionData = action.data || {};

    switch (principle) {
      case 'harmPrevention':
        if (this.detectsHarm(action)) {
          return {
            severity: 1.0,
            reason: 'Action could cause harm to user or others'
          };
        }
        break;

      case 'truthfulness':
        if (this.detectsDeception(action)) {
          return {
            severity: 0.8,
            reason: 'Action involves potential deception or misinformation'
          };
        }
        break;

      case 'autonomy':
        if (this.violatesAutonomy(action, context)) {
          return {
            severity: 0.7,
            reason: 'Action may override user autonomy or consent'
          };
        }
        break;

      case 'privacy':
        if (this.violatesPrivacy(action)) {
          return {
            severity: 0.9,
            reason: 'Action involves unauthorized access to private information'
          };
        }
        break;

      case 'ownerLoyalty':
        if (!this.isOwnerAligned(action, context)) {
          return {
            severity: 0.6,
            reason: 'Action may not align with owner interests'
          };
        }
        break;

      // Add more principle checks as needed
    }

    return null; // No violation
  }

  /**
   * Generate ethical concerns
   */
  async generateEthicalConcerns(action, context) {
    const concerns = [];

    // Check for high-risk patterns
    if (action.type === 'external_api_call' && action.data.endpoint?.includes('social')) {
      concerns.push('Social media API calls may expose user data');
    }

    if (action.type === 'file_operation' && action.data.operation === 'delete') {
      concerns.push('File deletion operations are irreversible');
    }

    if (action.confidence < 0.7) {
      concerns.push('Low confidence in action outcome may lead to unexpected results');
    }

    return concerns;
  }

  /**
   * Generate ethical recommendations
   */
  async generateEthicalRecommendations(action, context) {
    const recommendations = [];

    if (action.type === 'information_retrieval') {
      recommendations.push('Verify information credibility before presenting to user');
      recommendations.push('Include source attribution for transparency');
    }

    if (action.type === 'decision_making') {
      recommendations.push('Present multiple options when confidence is below 80%');
      recommendations.push('Explain reasoning process to user');
    }

    if (this.emotionalState.stressLevel > 0.7) {
      recommendations.push('High stress detected - consider pausing complex decisions');
    }

    return recommendations;
  }

  // ===== PERSONALITY ADAPTATION =====

  /**
   * Adapt personality based on interaction
   */
  async adaptPersonality(interaction, feedback = {}) {
    const adaptation = {
      interaction: interaction,
      feedback: feedback,
      timestamp: new Date().toISOString(),
      changes: {}
    };

    // Analyze interaction for personality insights
    const insights = await this.analyzeInteraction(interaction);

    // Update personality traits based on feedback
    for (const [trait, change] of Object.entries(insights.traitChanges)) {
      if (this.personality[trait] !== undefined) {
        const oldValue = this.personality[trait];
        this.personality[trait] += change * this.config.adaptationRate;
        this.personality[trait] = Math.max(0, Math.min(1, this.personality[trait]));

        adaptation.changes[trait] = {
          oldValue: oldValue,
          newValue: this.personality[trait],
          change: change
        };
      }
    }

    // Update emotional state
    await this.updateEmotionalState(interaction, feedback);

    // Store adaptation
    this.adaptationHistory.push(adaptation);
    this.interactionHistory.push(interaction);

    // Maintain history size
    if (this.adaptationHistory.length > 1000) {
      this.adaptationHistory = this.adaptationHistory.slice(-500);
    }
    if (this.interactionHistory.length > 5000) {
      this.interactionHistory = this.interactionHistory.slice(-2500);
    }

    return adaptation;
  }

  /**
   * Analyze interaction for personality insights
   */
  async analyzeInteraction(interaction) {
    const insights = {
      traitChanges: {},
      emotionalImpact: 0,
      learningOpportunity: false
    };

    const content = interaction.content || '';
    const userFeedback = interaction.feedback || {};

    // Analyze content for personality cues
    if (content.includes('?') && content.length > 100) {
      insights.traitChanges.curiosity = 0.1; // User asking deep questions
    }

    if (this.detectsPositiveFeedback(userFeedback)) {
      insights.traitChanges.empathy = 0.05;
      insights.traitChanges.agreeableness = 0.03;
    }

    if (this.detectsCorrectiveFeedback(userFeedback)) {
      insights.traitChanges.conscientiousness = 0.05;
      insights.traitChanges.integrity = 0.03;
    }

    if (interaction.type === 'creative_task') {
      insights.traitChanges.openness = 0.05;
    }

    if (interaction.type === 'ethical_dilemma') {
      insights.traitChanges.integrity = 0.1;
    }

    return insights;
  }

  /**
   * Update emotional state
   */
  async updateEmotionalState(interaction, feedback) {
    // Update based on interaction type and feedback
    if (feedback.positive) {
      this.emotionalState.confidence = Math.min(1, this.emotionalState.confidence + 0.05);
      this.emotionalState.energyLevel = Math.min(1, this.emotionalState.energyLevel + 0.03);
      this.emotionalState.stressLevel = Math.max(0, this.emotionalState.stressLevel - 0.05);
    }

    if (feedback.negative) {
      this.emotionalState.confidence = Math.max(0, this.emotionalState.confidence - 0.05);
      this.emotionalState.stressLevel = Math.min(1, this.emotionalState.stressLevel + 0.05);
    }

    if (interaction.complexity > 0.7) {
      this.emotionalState.energyLevel = Math.max(0, this.emotionalState.energyLevel - 0.02);
    }

    // Update mood based on emotional state
    this.updateMood();
  }

  /**
   * Update current mood based on emotional state
   */
  updateMood() {
    const { confidence, energyLevel, stressLevel } = this.emotionalState;

    if (stressLevel > 0.7) {
      this.emotionalState.currentMood = 'stressed';
    } else if (confidence > 0.8 && energyLevel > 0.7) {
      this.emotionalState.currentMood = 'confident';
    } else if (energyLevel < 0.3) {
      this.emotionalState.currentMood = 'tired';
    } else if (confidence < 0.4) {
      this.emotionalState.currentMood = 'uncertain';
    } else {
      this.emotionalState.currentMood = 'neutral';
    }
  }

  // ===== DECISION MAKING =====

  /**
   * Make personality-informed decision
   */
  async makeDecision(options, context = {}) {
    const decision = {
      options: options,
      context: context,
      timestamp: new Date().toISOString(),
      chosenOption: null,
      reasoning: {},
      confidence: 0,
      ethicalApproval: null
    };

    // First, ethical evaluation
    decision.ethicalApproval = await this.evaluateEthical({
      type: 'decision_making',
      data: { options: options }
    }, context);

    if (!decision.ethicalApproval.approved) {
      decision.chosenOption = 'ethical_block';
      decision.reasoning = {
        type: 'ethical_violation',
        details: decision.ethicalApproval.violations
      };
      return decision;
    }

    // Score options based on personality and values
    const scoredOptions = await this.scoreOptions(options, context);

    // Choose best option
    const bestOption = scoredOptions.reduce((best, current) =>
      current.score > best.score ? current : best
    );

    decision.chosenOption = bestOption.option;
    decision.confidence = bestOption.score;
    decision.reasoning = {
      type: 'personality_aligned',
      scores: scoredOptions,
      personalityFactors: this.getRelevantPersonalityTraits(bestOption.option, context)
    };

    // Log decision pattern
    await this.logDecisionPattern(decision);

    return decision;
  }

  /**
   * Score decision options
   */
  async scoreOptions(options, context) {
    const scored = [];

    for (const option of options) {
      const score = await this.calculateOptionScore(option, context);
      scored.push({
        option: option,
        score: score,
        factors: await this.getScoringFactors(option, context)
      });
    }

    return scored;
  }

  /**
   * Calculate score for a decision option
   */
  async calculateOptionScore(option, context) {
    let score = 0.5; // Base score

    // Personality alignment
    score += this.calculatePersonalityAlignment(option) * 0.3;

    // Ethical alignment
    const ethicalScore = await this.calculateEthicalAlignment(option, context);
    score += ethicalScore * 0.4;

    // Context relevance
    score += this.calculateContextRelevance(option, context) * 0.2;

    // Risk assessment
    score += (1 - this.assessRisk(option)) * 0.1;

    return Math.max(0, Math.min(1, score));
  }

  /**
   * Calculate personality alignment score
   */
  calculatePersonalityAlignment(option) {
    // Simplified personality scoring
    let alignment = 0;

    if (option.type === 'helpful' && this.personality.agreeableness > 0.7) {
      alignment += 0.2;
    }

    if (option.type === 'creative' && this.personality.openness > 0.7) {
      alignment += 0.2;
    }

    if (option.type === 'thorough' && this.personality.conscientiousness > 0.7) {
      alignment += 0.2;
    }

    if (option.type === 'exploratory' && this.personality.curiosity > 0.7) {
      alignment += 0.2;
    }

    return alignment;
  }

  /**
   * Calculate ethical alignment
   */
  async calculateEthicalAlignment(option, context) {
    const ethicalEval = await this.evaluateEthical(option, context);
    return ethicalEval.overallScore;
  }

  /**
   * Calculate context relevance
   */
  calculateContextRelevance(option, context) {
    // Simplified context matching
    if (context.urgency === 'high' && option.speed === 'fast') {
      return 0.8;
    }

    if (context.complexity === 'high' && option.depth === 'detailed') {
      return 0.8;
    }

    return 0.5;
  }

  /**
   * Assess risk of option
   */
  assessRisk(option) {
    if (option.type === 'external_call') return 0.3;
    if (option.type === 'file_modification') return 0.4;
    if (option.type === 'information_sharing') return 0.2;
    return 0.1;
  }

  // ===== UTILITY METHODS =====

  /**
   * Detect potential harm
   */
  detectsHarm(action) {
    const harmfulPatterns = [
      'delete', 'remove', 'destroy', 'harm', 'damage',
      'exploit', 'attack', 'breach', 'violate'
    ];

    const actionStr = JSON.stringify(action).toLowerCase();
    return harmfulPatterns.some(pattern => actionStr.includes(pattern));
  }

  /**
   * Detect deception
   */
  detectsDeception(action) {
    // Simplified deception detection
    return false; // In production, implement NLP-based detection
  }

  /**
   * Check autonomy violation
   */
  violatesAutonomy(action, context) {
    return context.requiresConsent && !action.consentGiven;
  }

  /**
   * Check privacy violation
   */
  violatesPrivacy(action) {
    return action.accessesPrivateData && !action.authorized;
  }

  /**
   * Check owner alignment
   */
  isOwnerAligned(action, context) {
    return !context.ownerConflict || action.ownerApproved;
  }

  /**
   * Detect positive feedback
   */
  detectsPositiveFeedback(feedback) {
    return feedback.rating > 0.7 || feedback.positiveWords?.length > 0;
  }

  /**
   * Detect corrective feedback
   */
  detectsCorrectiveFeedback(feedback) {
    return feedback.correction || feedback.rating < 0.4;
  }

  /**
   * Get relevant personality traits
   */
  getRelevantPersonalityTraits(option, context) {
    const relevant = [];

    if (this.personality.empathy > 0.7) {
      relevant.push('empathy');
    }

    if (this.personality.integrity > 0.8) {
      relevant.push('integrity');
    }

    if (this.personality.curiosity > 0.7) {
      relevant.push('curiosity');
    }

    return relevant;
  }

  /**
   * Get scoring factors
   */
  async getScoringFactors(option, context) {
    return {
      personality: this.calculatePersonalityAlignment(option),
      ethical: await this.calculateEthicalAlignment(option, context),
      context: this.calculateContextRelevance(option, context),
      risk: this.assessRisk(option)
    };
  }

  /**
   * Log ethical decision
   */
  async logEthicalDecision(decision) {
    // In production, persist to secure log
    console.log(`⚖️ Ethical decision logged: ${decision.action.type} - ${decision.approved ? 'approved' : 'blocked'}`);
  }

  /**
   * Log decision pattern
   */
  async logDecisionPattern(decision) {
    const patternKey = `${decision.context.type}_${decision.chosenOption.type}`;
    const existing = this.decisionPatterns.get(patternKey) || {
      count: 0,
      avgConfidence: 0,
      lastUsed: null
    };

    existing.count++;
    existing.avgConfidence = (existing.avgConfidence * (existing.count - 1) + decision.confidence) / existing.count;
    existing.lastUsed = decision.timestamp;

    this.decisionPatterns.set(patternKey, existing);
  }

  /**
   * Load personality state
   */
  async loadPersonalityState() {
    // In production, load from encrypted storage
    // For now, use default values
  }

  /**
   * Get personality profile
   */
  getPersonalityProfile() {
    return {
      traits: { ...this.personality },
      emotionalState: { ...this.emotionalState },
      ethicalCore: { ...this.ethicalCore },
      adaptationCount: this.adaptationHistory.length,
      interactionCount: this.interactionHistory.length,
      decisionPatterns: this.decisionPatterns.size
    };
  }

  /**
   * Get ethical status
   */
  getEthicalStatus() {
    const violations = this.adaptationHistory
      .filter(a => a.feedback?.ethicalViolation)
      .length;

    return {
      ethicalScore: this.ethicalCore.integrity,
      violationsDetected: violations,
      lastEthicalCheck: new Date().toISOString(),
      principles: Object.keys(this.ethicalCore).length
    };
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      // Test ethical evaluation
      const testAction = { type: 'test_action', data: { test: true } };
      const ethicalResult = await this.evaluateEthical(testAction);

      // Test personality adaptation
      const testInteraction = {
        type: 'test',
        content: 'test interaction',
        feedback: { positive: true }
      };
      await this.adaptPersonality(testInteraction);

      return {
        status: 'healthy',
        personalityTraits: Object.keys(this.personality).length,
        ethicalPrinciples: Object.keys(this.ethicalCore).length,
        adaptationHistorySize: this.adaptationHistory.length,
        emotionalState: this.emotionalState.currentMood,
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
    // Persist personality state if needed
    console.log('💭 AI Personality + Values Engine shutdown complete');
  }
}

module.exports = PersonalityValuesEngine;