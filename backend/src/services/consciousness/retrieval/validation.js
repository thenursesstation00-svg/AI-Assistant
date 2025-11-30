/**
 * Validation Layer
 * Ensures information quality and mitigates bias
 *
 * Part of the Information Retrieval Cognitive Loop
 */

const axios = require('axios');
const crypto = require('crypto');

/**
 * Validation Layer - Source credibility assessment and bias mitigation
 */
class ValidationLayer {
  constructor(config = {}) {
    this.config = {
      credibilityThreshold: config.credibilityThreshold || 0.7,
      biasThreshold: config.biasThreshold || 0.6,
      maxValidationRequests: config.maxValidationRequests || 10,
      cacheTtl: config.cacheTtl || 3600000, // 1 hour
      ...config
    };

    this.credibilityCache = new Map();
    this.biasPatterns = this.loadBiasPatterns();
    this.sourceRegistry = new Map();
  }

  /**
   * Main validation pipeline
   */
  async validate(sources, context = {}) {
    const validationResults = [];

    for (const source of sources.slice(0, this.config.maxValidationRequests)) {
      try {
        const result = await this.validateSource(source, context);
        validationResults.push(result);
      } catch (error) {
        console.warn(`Validation failed for source ${source.url}:`, error.message);
        validationResults.push({
          url: source.url,
          credibility: 0.1,
          bias: 0.9,
          issues: [error.message],
          validated: false
        });
      }
    }

    return {
      results: validationResults,
      summary: this.generateValidationSummary(validationResults),
      recommendations: this.generateRecommendations(validationResults)
    };
  }

  /**
   * Validate a single source
   */
  async validateSource(source, context) {
    const cached = this.getCachedValidation(source.url);
    if (cached) return cached;

    const [
      credibilityScore,
      biasAnalysis,
      freshnessCheck,
      consistencyCheck
    ] = await Promise.allSettled([
      this.assessCredibility(source),
      this.analyzeBias(source),
      this.checkFreshness(source),
      this.checkConsistency(source, context)
    ]);

    const result = {
      url: source.url,
      title: source.title,
      credibility: credibilityScore.status === 'fulfilled' ? credibilityScore.value : 0.5,
      bias: biasAnalysis.status === 'fulfilled' ? biasAnalysis.value.score : 0.5,
      freshness: freshnessCheck.status === 'fulfilled' ? freshnessCheck.value : 0.5,
      consistency: consistencyCheck.status === 'fulfilled' ? consistencyCheck.value : 0.5,
      issues: this.collectIssues([
        credibilityScore,
        biasAnalysis,
        freshnessCheck,
        consistencyCheck
      ]),
      biasDetails: biasAnalysis.status === 'fulfilled' ? biasAnalysis.value.details : {},
      validated: true,
      timestamp: new Date().toISOString()
    };

    // Overall validation score
    result.overallScore = this.calculateOverallScore(result);

    // Cache the result
    this.setCachedValidation(source.url, result);

    return result;
  }

  /**
   * Assess source credibility
   */
  async assessCredibility(source) {
    let score = 0.5; // Base score
    const factors = [];

    // Domain authority check
    const domainScore = await this.checkDomainAuthority(source.url);
    score += domainScore * 0.3;
    factors.push({ factor: 'domain_authority', score: domainScore });

    // Content quality indicators
    const contentScore = this.assessContentQuality(source);
    score += contentScore * 0.25;
    factors.push({ factor: 'content_quality', score: contentScore });

    // Citation and backlink analysis
    const citationScore = await this.checkCitations(source.url);
    score += citationScore * 0.2;
    factors.push({ factor: 'citations', score: citationScore });

    // Author expertise (if available)
    const authorScore = this.assessAuthorExpertise(source);
    score += authorScore * 0.15;
    factors.push({ factor: 'author_expertise', score: authorScore });

    // Fact-checking sites cross-reference
    const factCheckScore = await this.crossReferenceFactChecks(source);
    score += factCheckScore * 0.1;
    factors.push({ factor: 'fact_checking', score: factCheckScore });

    return {
      score: Math.max(0, Math.min(1, score)),
      factors: factors,
      level: this.scoreToLevel(score)
    };
  }

  /**
   * Analyze bias in content
   */
  async analyzeBias(source) {
    const text = this.extractTextForAnalysis(source);
    const biasIndicators = {
      political: 0,
      sensationalism: 0,
      emotional: 0,
      oneSided: 0,
      score: 0
    };

    // Political bias detection
    biasIndicators.political = this.detectPoliticalBias(text);

    // Sensationalism detection
    biasIndicators.sensationalism = this.detectSensationalism(text);

    // Emotional language detection
    biasIndicators.emotional = this.detectEmotionalLanguage(text);

    // One-sided argument detection
    biasIndicators.oneSided = this.detectOneSidedArguments(text);

    // Overall bias score
    biasIndicators.score = (
      biasIndicators.political * 0.4 +
      biasIndicators.sensationalism * 0.3 +
      biasIndicators.emotional * 0.2 +
      biasIndicators.oneSided * 0.1
    );

    return {
      score: Math.max(0, Math.min(1, biasIndicators.score)),
      details: biasIndicators,
      level: this.biasScoreToLevel(biasIndicators.score)
    };
  }

  /**
   * Check information freshness
   */
  async checkFreshness(source) {
    const publishedDate = this.extractPublishedDate(source);
    if (!publishedDate) return 0.5; // Unknown date

    const now = new Date();
    const age = now - publishedDate;
    const ageInDays = age / (1000 * 60 * 60 * 24);

    // Freshness score based on age
    if (ageInDays < 1) return 1.0; // Less than 1 day
    if (ageInDays < 7) return 0.9; // Less than 1 week
    if (ageInDays < 30) return 0.7; // Less than 1 month
    if (ageInDays < 365) return 0.5; // Less than 1 year
    return 0.2; // Older than 1 year
  }

  /**
   * Check consistency with known facts
   */
  async checkConsistency(source, context) {
    if (!context.knownFacts || context.knownFacts.length === 0) {
      return 0.5; // No context to check against
    }

    const sourceText = this.extractTextForAnalysis(source);
    let consistencyScore = 0;
    let checks = 0;

    for (const fact of context.knownFacts) {
      checks++;
      if (this.textContainsFact(sourceText, fact)) {
        consistencyScore += 1;
      } else if (this.textContradictsFact(sourceText, fact)) {
        consistencyScore -= 0.5;
      }
    }

    return Math.max(0, Math.min(1, consistencyScore / checks + 0.5));
  }

  // Helper methods for credibility assessment

  async checkDomainAuthority(url) {
    try {
      const domain = new URL(url).hostname;

      // Check against known reliable domains
      const reliableDomains = [
        'wikipedia.org', 'bbc.com', 'reuters.com', 'apnews.com',
        'nature.com', 'science.org', 'nih.gov', 'who.int',
        'edu', 'gov', 'org' // Generic reliable TLDs
      ];

      const unreliableDomains = [
        'facebook.com', 'twitter.com', 'reddit.com',
        'buzzfeed.com', 'dailymail.co.uk'
      ];

      if (reliableDomains.some(d => domain.includes(d))) return 0.9;
      if (unreliableDomains.some(d => domain.includes(d))) return 0.3;

      // Default score for unknown domains
      return 0.6;
    } catch {
      return 0.5;
    }
  }

  assessContentQuality(source) {
    const text = source.content || source.snippet || '';
    let score = 0.5;

    // Length check
    if (text.length > 1000) score += 0.1;
    if (text.length > 5000) score += 0.1;

    // Structure check
    if (text.includes('\n\n') || text.split('.').length > 10) score += 0.1;

    // References check
    if (text.match(/\[.*?\]/g) || text.match(/\(.*?\)/g)) score += 0.1;

    // Professional language
    const professionalWords = ['according', 'research', 'study', 'evidence', 'analysis'];
    const profWordCount = professionalWords.reduce((count, word) =>
      count + (text.toLowerCase().includes(word) ? 1 : 0), 0);
    score += (profWordCount / professionalWords.length) * 0.2;

    return Math.max(0, Math.min(1, score));
  }

  async checkCitations(url) {
    // Simplified citation check - in production, use academic APIs
    try {
      // Check if URL appears in academic papers (simplified)
      const academicIndicators = ['scholar.google', 'semanticscholar', 'arxiv'];
      const hasAcademicRefs = academicIndicators.some(indicator => url.includes(indicator));

      return hasAcademicRefs ? 0.8 : 0.4;
    } catch {
      return 0.4;
    }
  }

  assessAuthorExpertise(source) {
    // Check for author information
    const text = (source.content || source.snippet || '').toLowerCase();

    const expertiseIndicators = [
      'phd', 'professor', 'researcher', 'expert', 'scientist',
      'doctor', 'specialist', 'authority'
    ];

    const indicatorCount = expertiseIndicators.reduce((count, indicator) =>
      count + (text.includes(indicator) ? 1 : 0), 0);

    return Math.min(1, indicatorCount * 0.2 + 0.3);
  }

  async crossReferenceFactChecks(source) {
    // Simplified fact-check cross-reference
    // In production, integrate with fact-checking APIs
    const factCheckSites = ['snopes.com', 'factcheck.org', 'politifact.com'];

    try {
      const title = source.title || '';
      // Check if fact-check sites mention this topic
      // This is a placeholder - real implementation would search fact-check sites
      return 0.5;
    } catch {
      return 0.5;
    }
  }

  // Helper methods for bias analysis

  detectPoliticalBias(text) {
    const leftIndicators = ['liberal', 'progressive', 'left-wing', 'democrat'];
    const rightIndicators = ['conservative', 'right-wing', 'republican', 'traditional'];

    const leftCount = leftIndicators.reduce((count, word) =>
      count + (text.toLowerCase().includes(word) ? 1 : 0), 0);
    const rightCount = rightIndicators.reduce((count, word) =>
      count + (text.toLowerCase().includes(word) ? 1 : 0), 0);

    if (leftCount > rightCount * 2) return 0.8;
    if (rightCount > leftCount * 2) return 0.8;
    return Math.abs(leftCount - rightCount) * 0.1;
  }

  detectSensationalism(text) {
    const sensationalWords = [
      'shocking', 'unbelievable', 'incredible', 'amazing', 'outrageous',
      'scandal', 'crisis', 'disaster', 'catastrophe', 'breaking'
    ];

    const count = sensationalWords.reduce((total, word) =>
      total + (text.toLowerCase().split(word).length - 1), 0);

    return Math.min(1, count * 0.1);
  }

  detectEmotionalLanguage(text) {
    const emotionalWords = [
      'hate', 'love', 'fear', 'anger', 'joy', 'sadness',
      'terrible', 'wonderful', 'awful', 'amazing'
    ];

    const count = emotionalWords.reduce((total, word) =>
      total + (text.toLowerCase().split(word).length - 1), 0);

    return Math.min(1, count * 0.05);
  }

  detectOneSidedArguments(text) {
    // Check for balanced argumentation
    const balanceIndicators = ['however', 'although', 'on the other hand', 'conversely'];
    const balanceCount = balanceIndicators.reduce((count, phrase) =>
      count + (text.toLowerCase().includes(phrase) ? 1 : 0), 0);

    return Math.max(0, 1 - balanceCount * 0.2);
  }

  // Utility methods

  extractTextForAnalysis(source) {
    return (source.content || source.snippet || source.title || '').toLowerCase();
  }

  extractPublishedDate(source) {
    // Try to extract date from various fields
    const dateFields = ['publishedDate', 'date', 'pubDate', 'timestamp'];

    for (const field of dateFields) {
      if (source[field]) {
        const date = new Date(source[field]);
        if (!isNaN(date.getTime())) return date;
      }
    }

    // Try to parse from content
    const text = source.content || source.snippet || '';
    const dateMatch = text.match(/(\d{1,2}[-/]\d{1,2}[-/]\d{2,4}|\d{4}[-/]\d{1,2}[-/]\d{1,2})/);
    if (dateMatch) {
      const date = new Date(dateMatch[1]);
      if (!isNaN(date.getTime())) return date;
    }

    return null;
  }

  textContainsFact(text, fact) {
    // Simple fact checking - in production, use NLP
    return text.toLowerCase().includes(fact.toLowerCase());
  }

  textContradictsFact(text, fact) {
    // Basic contradiction detection
    const contradictions = ['not', 'false', 'incorrect', 'wrong'];
    return contradictions.some(word => text.toLowerCase().includes(word));
  }

  calculateOverallScore(result) {
    const weights = {
      credibility: 0.4,
      bias: -0.3, // Negative weight for bias
      freshness: 0.2,
      consistency: 0.1
    };

    return Math.max(0, Math.min(1,
      result.credibility * weights.credibility +
      (1 - result.bias) * Math.abs(weights.bias) + // Invert bias score
      result.freshness * weights.freshness +
      result.consistency * weights.consistency
    ));
  }

  scoreToLevel(score) {
    if (score >= 0.8) return 'high';
    if (score >= 0.6) return 'medium';
    if (score >= 0.4) return 'low';
    return 'very_low';
  }

  biasScoreToLevel(score) {
    if (score >= 0.7) return 'high';
    if (score >= 0.5) return 'medium';
    if (score >= 0.3) return 'low';
    return 'minimal';
  }

  collectIssues(results) {
    const issues = [];
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        issues.push(`${['credibility', 'bias', 'freshness', 'consistency'][index]}: ${result.reason}`);
      }
    });
    return issues;
  }

  generateValidationSummary(results) {
    const total = results.length;
    const valid = results.filter(r => r.validated).length;
    const highCredibility = results.filter(r => r.credibility >= 0.8).length;
    const lowBias = results.filter(r => r.bias <= 0.3).length;
    const fresh = results.filter(r => r.freshness >= 0.7).length;

    return {
      totalSources: total,
      validSources: valid,
      highCredibilitySources: highCredibility,
      lowBiasSources: lowBias,
      freshSources: fresh,
      averageCredibility: results.reduce((sum, r) => sum + r.credibility, 0) / total,
      averageBias: results.reduce((sum, r) => sum + r.bias, 0) / total
    };
  }

  generateRecommendations(results) {
    const recommendations = [];

    const avgCredibility = results.reduce((sum, r) => sum + r.credibility, 0) / results.length;
    if (avgCredibility < 0.6) {
      recommendations.push('Consider seeking more credible sources');
    }

    const highBiasCount = results.filter(r => r.bias > 0.7).length;
    if (highBiasCount > results.length * 0.5) {
      recommendations.push('High bias detected - seek balanced perspectives');
    }

    const oldSources = results.filter(r => r.freshness < 0.4).length;
    if (oldSources > results.length * 0.3) {
      recommendations.push('Many sources are outdated - look for recent information');
    }

    return recommendations;
  }

  getCachedValidation(url) {
    const cached = this.credibilityCache.get(url);
    if (cached && Date.now() - cached.timestamp < this.config.cacheTtl) {
      return cached.data;
    }
    return null;
  }

  setCachedValidation(url, data) {
    this.credibilityCache.set(url, {
      data,
      timestamp: Date.now()
    });
  }

  loadBiasPatterns() {
    // Load bias detection patterns
    return {
      political: {
        left: ['liberal', 'progressive', 'left-wing'],
        right: ['conservative', 'right-wing', 'traditional']
      },
      sensationalism: ['shocking', 'unbelievable', 'breaking', 'exclusive'],
      emotional: ['hate', 'love', 'fear', 'anger', 'outrage']
    };
  }

  /**
   * Health check for the validation layer
   */
  async healthCheck() {
    try {
      const testSource = {
        url: 'https://example.com/test',
        title: 'Test Article',
        content: 'This is a test article about machine learning and artificial intelligence research.',
        snippet: 'Test content for validation'
      };

      const result = await this.validate([testSource]);

      return {
        status: 'healthy',
        sourcesValidated: result.results.length,
        averageScore: result.summary.averageCredibility,
        cacheSize: this.credibilityCache.size,
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
}

module.exports = ValidationLayer;