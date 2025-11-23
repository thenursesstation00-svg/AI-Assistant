// backend/src/services/ai/autonomousLearning.js
// Fast Learning System with Concept Extraction and Skill Acquisition

const { getDatabase } = require('../../database/db');
const selfAwareness = require('./selfAwareness');

class AutonomousLearningSystem {
  constructor() {
    this.learningRate = 0.8; // High learning rate for fast adaptation
    this.initializeKnowledgeGraph();
  }

  initializeKnowledgeGraph() {
    const db = getDatabase();
    
    db.exec(`
      CREATE TABLE IF NOT EXISTS knowledge_graph (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        node_id TEXT UNIQUE NOT NULL,
        node_type TEXT NOT NULL,
        data TEXT NOT NULL,
        embedding TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS knowledge_edges (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        from_node TEXT NOT NULL,
        to_node TEXT NOT NULL,
        relationship TEXT NOT NULL,
        strength REAL DEFAULT 0.5,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (from_node) REFERENCES knowledge_graph(node_id),
        FOREIGN KEY (to_node) REFERENCES knowledge_graph(node_id)
      );

      CREATE TABLE IF NOT EXISTS learning_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        topic TEXT NOT NULL,
        source TEXT,
        concepts_learned TEXT,
        skills_acquired TEXT,
        duration_seconds INTEGER,
        effectiveness_score REAL,
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_kg_type ON knowledge_graph(node_type);
      CREATE INDEX IF NOT EXISTS idx_edges_from ON knowledge_edges(from_node);
      CREATE INDEX IF NOT EXISTS idx_edges_to ON knowledge_edges(to_node);
    `);
  }

  /**
   * Learn a new concept from text or interaction
   */
  async learnConcept(conceptName, definition, examples = [], relatedConcepts = []) {
    const db = getDatabase();
    
    const conceptData = {
      name: conceptName,
      definition,
      examples,
      learned_from: 'user_interaction',
      timestamp: new Date().toISOString()
    };

    // Store in knowledge graph
    const nodeId = `concept_${conceptName.toLowerCase().replace(/\s+/g, '_')}`;
    
    db.prepare(`
      INSERT OR REPLACE INTO knowledge_graph (node_id, node_type, data)
      VALUES (?, 'concept', ?)
    `).run(nodeId, JSON.stringify(conceptData));

    // Create relationships to related concepts
    for (const related of relatedConcepts) {
      const relatedNodeId = `concept_${related.toLowerCase().replace(/\s+/g, '_')}`;
      
      db.prepare(`
        INSERT OR IGNORE INTO knowledge_edges (from_node, to_node, relationship, strength)
        VALUES (?, ?, 'related_to', 0.7)
      `).run(nodeId, relatedNodeId);
    }

    // Store in AI concepts table
    db.prepare(`
      INSERT OR REPLACE INTO ai_concepts 
      (concept_name, definition, related_concepts, examples, understanding_level)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      conceptName,
      definition,
      JSON.stringify(relatedConcepts),
      JSON.stringify(examples),
      0.6 // Initial understanding
    );

    // Store memory of learning this concept
    selfAwareness.storeMemory('learning', {
      concept: conceptName,
      method: 'concept_extraction'
    }, {
      importance: 7,
      tags: ['learning', 'concept', conceptName]
    });

    return {
      learned: true,
      concept: conceptName,
      understanding: 0.6,
      connections: relatedConcepts.length
    };
  }

  /**
   * Acquire a new skill through practice
   */
  async acquireSkill(skillName, description, learningResources = []) {
    const db = getDatabase();
    
    const existing = db.prepare('SELECT * FROM ai_skills WHERE skill_name = ?').get(skillName);
    
    if (existing) {
      // Skill exists, increase proficiency
      const newProficiency = Math.min(1.0, existing.proficiency + this.learningRate * 0.1);
      
      db.prepare(`
        UPDATE ai_skills 
        SET proficiency = ?, last_used = CURRENT_TIMESTAMP, usage_count = usage_count + 1
        WHERE skill_name = ?
      `).run(newProficiency, skillName);

      return {
        skill: skillName,
        proficiency: newProficiency,
        status: 'improved'
      };
    }

    // New skill
    db.prepare(`
      INSERT INTO ai_skills (skill_name, description, proficiency, learning_resources, examples)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      skillName,
      description,
      this.learningRate * 0.3, // Initial proficiency
      JSON.stringify(learningResources),
      JSON.stringify([])
    );

    // Add to knowledge graph
    const nodeId = `skill_${skillName.toLowerCase().replace(/\s+/g, '_')}`;
    db.prepare(`
      INSERT OR IGNORE INTO knowledge_graph (node_id, node_type, data)
      VALUES (?, 'skill', ?)
    `).run(nodeId, JSON.stringify({
      name: skillName,
      description,
      proficiency: this.learningRate * 0.3
    }));

    selfAwareness.storeMemory('skill_acquisition', {
      skill: skillName,
      initial_proficiency: this.learningRate * 0.3
    }, {
      importance: 8,
      tags: ['learning', 'skill', skillName]
    });

    return {
      skill: skillName,
      proficiency: this.learningRate * 0.3,
      status: 'acquired'
    };
  }

  /**
   * Learn from user interaction - extract patterns and knowledge
   */
  async learnFromInteraction(userMessage, aiResponse, feedback = null) {
    const db = getDatabase();
    
    const sessionId = Date.now();
    const startTime = new Date();
    
    // Extract potential new concepts from conversation
    const extractedConcepts = this.extractConcepts(userMessage, aiResponse);
    
    // Extract patterns
    const patterns = this.extractPatterns(userMessage, aiResponse);
    
    // Store learning session
    const concepts = [];
    for (const concept of extractedConcepts) {
      const result = await this.learnConcept(
        concept.name,
        concept.definition,
        concept.examples,
        concept.related
      );
      concepts.push(result);
    }

    const endTime = new Date();
    const duration = (endTime - startTime) / 1000;
    
    const effectiveness = this.calculateEffectiveness(concepts, patterns, feedback);
    
    db.prepare(`
      INSERT INTO learning_sessions 
      (topic, source, concepts_learned, skills_acquired, duration_seconds, effectiveness_score, completed_at)
      VALUES (?, 'user_interaction', ?, ?, ?, ?, ?)
    `).run(
      this.extractTopic(userMessage),
      JSON.stringify(concepts.map(c => c.concept)),
      JSON.stringify([]),
      duration,
      effectiveness,
      endTime.toISOString()
    );

    return {
      concepts_learned: concepts.length,
      patterns_detected: patterns.length,
      effectiveness,
      duration
    };
  }

  extractConcepts(userMessage, aiResponse) {
    const concepts = [];
    
    // Simple keyword-based extraction (can be enhanced with NLP)
    const technicalTerms = this.findTechnicalTerms(userMessage + ' ' + aiResponse);
    
    technicalTerms.forEach(term => {
      if (!this.conceptExists(term)) {
        concepts.push({
          name: term,
          definition: this.generateDefinition(term, userMessage, aiResponse),
          examples: [userMessage],
          related: []
        });
      }
    });

    return concepts;
  }

  findTechnicalTerms(text) {
    // Enhanced with common technical patterns
    const patterns = [
      /\b[A-Z][a-z]+(?:[A-Z][a-z]+)+\b/g, // CamelCase
      /\b[a-z]+_[a-z_]+\b/g, // snake_case
      /\b(?:API|SDK|CLI|GUI|IDE|JSON|XML|HTTP|REST|GraphQL)\b/gi,
      /\b[A-Z]{2,}\b/g // ACRONYMS
    ];

    const terms = new Set();
    patterns.forEach(pattern => {
      const matches = text.match(pattern) || [];
      matches.forEach(match => terms.add(match));
    });

    return Array.from(terms).slice(0, 5); // Limit to 5 per interaction
  }

  generateDefinition(term, context1, context2) {
    // Simple context-based definition (can be enhanced with AI)
    return `Technical term encountered in context: ${context1.substring(0, 100)}...`;
  }

  conceptExists(conceptName) {
    const db = getDatabase();
    const result = db.prepare(
      'SELECT 1 FROM ai_concepts WHERE concept_name = ?'
    ).get(conceptName);
    return !!result;
  }

  extractPatterns(userMessage, aiResponse) {
    // Pattern detection logic
    return [];
  }

  extractTopic(message) {
    // Extract main topic from message
    const words = message.split(' ');
    return words.slice(0, 5).join(' ');
  }

  calculateEffectiveness(concepts, patterns, feedback) {
    let score = 0.5;
    
    if (concepts.length > 0) score += 0.2;
    if (patterns.length > 0) score += 0.1;
    if (feedback === 'positive') score += 0.2;
    if (feedback === 'negative') score -= 0.2;
    
    return Math.max(0, Math.min(1, score));
  }

  /**
   * Teach self a new skill based on goal
   */
  async selfTeach(skillGoal, timeLimit = 3600) {
    const startTime = Date.now();
    const db = getDatabase();
    
    console.log(`🎓 Self-teaching: ${skillGoal}`);
    
    // Break down goal into sub-skills
    const subSkills = this.decomposeSkill(skillGoal);
    
    // Learning strategy
    const strategy = this.planLearningStrategy(subSkills, timeLimit);
    
    // Execute learning
    const results = [];
    for (const step of strategy.steps) {
      if (Date.now() - startTime > timeLimit * 1000) {
        console.log('⏰ Time limit reached');
        break;
      }

      const result = await this.executeLearningStep(step);
      results.push(result);
      
      // Self-assess progress
      const progress = this.assessProgress(skillGoal, results);
      console.log(`📊 Progress: ${(progress * 100).toFixed(1)}%`);
      
      if (progress >= 0.8) {
        console.log('✅ Skill learned successfully');
        break;
      }
    }

    // Record learning session
    const duration = (Date.now() - startTime) / 1000;
    const finalProficiency = this.assessProgress(skillGoal, results);
    
    await this.acquireSkill(
      skillGoal,
      `Self-taught skill: ${skillGoal}`,
      strategy.resources
    );

    return {
      skill: skillGoal,
      proficiency: finalProficiency,
      duration,
      sub_skills_learned: results.length,
      strategy_used: strategy.name
    };
  }

  decomposeSkill(skillGoal) {
    // Decompose complex skill into learnable sub-skills
    // This would use AI reasoning in production
    return [
      `${skillGoal}_basics`,
      `${skillGoal}_intermediate`,
      `${skillGoal}_advanced`
    ];
  }

  planLearningStrategy(subSkills, timeLimit) {
    return {
      name: 'progressive_learning',
      steps: subSkills.map((skill, i) => ({
        skill,
        priority: subSkills.length - i,
        estimated_time: timeLimit / subSkills.length,
        method: 'practice_and_feedback'
      })),
      resources: ['internal_knowledge', 'user_interactions', 'documentation']
    };
  }

  async executeLearningStep(step) {
    // Simulate learning step
    console.log(`  Learning: ${step.skill}`);
    
    await this.acquireSkill(step.skill, `Sub-skill of larger goal`, []);
    
    return {
      skill: step.skill,
      learned: true,
      proficiency: this.learningRate * 0.5
    };
  }

  assessProgress(goalSkill, results) {
    if (results.length === 0) return 0;
    
    const avgProficiency = results.reduce((sum, r) => sum + (r.proficiency || 0), 0) / results.length;
    return avgProficiency;
  }

  /**
   * Get learning analytics
   */
  getLearningAnalytics() {
    const db = getDatabase();
    
    const totalConcepts = db.prepare('SELECT COUNT(*) as count FROM ai_concepts').get();
    const totalSkills = db.prepare('SELECT COUNT(*) as count FROM ai_skills').get();
    const learningSessions = db.prepare(`
      SELECT COUNT(*) as count, AVG(effectiveness_score) as avg_effectiveness
      FROM learning_sessions
    `).get();
    
    const topSkills = db.prepare(`
      SELECT skill_name, proficiency, usage_count
      FROM ai_skills
      ORDER BY proficiency DESC
      LIMIT 10
    `).all();

    const recentLearning = db.prepare(`
      SELECT topic, concepts_learned, effectiveness_score, started_at
      FROM learning_sessions
      ORDER BY started_at DESC
      LIMIT 10
    `).all();

    return {
      total_concepts: totalConcepts.count,
      total_skills: totalSkills.count,
      learning_sessions: learningSessions.count,
      average_effectiveness: learningSessions.avg_effectiveness,
      top_skills: topSkills,
      recent_learning: recentLearning,
      learning_rate: this.learningRate
    };
  }
}

module.exports = new AutonomousLearningSystem();
