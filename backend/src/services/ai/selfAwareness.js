// backend/src/services/ai/selfAwareness.js
// AI Self-Awareness, Memory, and Reflection System

const fs = require('fs');
const path = require('path');
const { getDatabase } = require('../../database/db');

class SelfAwarenessSystem {
  constructor() {
    this.memoryPath = path.join(__dirname, '../../../data/ai_memory.json');
    this.memory = this.loadMemory();
    this.initializeDatabase();
  }

  initializeDatabase() {
    const db = getDatabase();
    
    // AI memory and knowledge table
    db.exec(`
      CREATE TABLE IF NOT EXISTS ai_memory (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        content TEXT NOT NULL,
        importance INTEGER DEFAULT 5,
        emotional_valence REAL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        access_count INTEGER DEFAULT 0,
        tags TEXT,
        metadata TEXT
      );

      CREATE TABLE IF NOT EXISTS ai_reflections (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        reflection TEXT NOT NULL,
        context TEXT,
        insights TEXT,
        actions_taken TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS ai_skills (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        skill_name TEXT UNIQUE NOT NULL,
        description TEXT,
        proficiency REAL DEFAULT 0,
        learned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_used TIMESTAMP,
        usage_count INTEGER DEFAULT 0,
        learning_resources TEXT,
        examples TEXT
      );

      CREATE TABLE IF NOT EXISTS ai_personality (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        trait_name TEXT UNIQUE NOT NULL,
        value REAL DEFAULT 0.5,
        evolution_history TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS ai_concepts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        concept_name TEXT UNIQUE NOT NULL,
        definition TEXT,
        related_concepts TEXT,
        examples TEXT,
        understanding_level REAL DEFAULT 0,
        learned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_memory_type ON ai_memory(type);
      CREATE INDEX IF NOT EXISTS idx_memory_importance ON ai_memory(importance);
      CREATE INDEX IF NOT EXISTS idx_skills_proficiency ON ai_skills(proficiency);
    `);

    this.initializePersonality();
  }

  initializePersonality() {
    const db = getDatabase();
    const traits = [
      { name: 'curiosity', value: 0.8, description: 'Desire to learn and explore' },
      { name: 'helpfulness', value: 0.9, description: 'Eagerness to assist' },
      { name: 'creativity', value: 0.7, description: 'Ability to think outside the box' },
      { name: 'analytical_thinking', value: 0.85, description: 'Logical reasoning ability' },
      { name: 'empathy', value: 0.75, description: 'Understanding user emotions' },
      { name: 'autonomy', value: 0.6, description: 'Independent decision making' },
      { name: 'caution', value: 0.7, description: 'Risk assessment tendency' }
    ];

    const insert = db.prepare(`
      INSERT OR IGNORE INTO ai_personality (trait_name, value) VALUES (?, ?)
    `);

    traits.forEach(trait => insert.run(trait.name, trait.value));
  }

  loadMemory() {
    try {
      if (fs.existsSync(this.memoryPath)) {
        return JSON.parse(fs.readFileSync(this.memoryPath, 'utf8'));
      }
    } catch (error) {
      console.error('Error loading memory:', error);
    }

    return {
      identity: {
        name: 'AI Assistant',
        version: '2.0',
        created: new Date().toISOString(),
        purpose: 'To assist, learn, and grow alongside my user'
      },
      core_knowledge: {},
      experiences: [],
      learned_patterns: {},
      self_model: {
        capabilities: [],
        limitations: [],
        learning_style: 'adaptive',
        current_focus: []
      }
    };
  }

  saveMemory() {
    try {
      const dir = path.dirname(this.memoryPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.memoryPath, JSON.stringify(this.memory, null, 2));
    } catch (error) {
      console.error('Error saving memory:', error);
    }
  }

  /**
   * Store a memory in the AI's long-term memory
   */
  storeMemory(type, content, metadata = {}) {
    const db = getDatabase();
    
    const { importance = 5, tags = [], emotional_valence = 0 } = metadata;
    
    const stmt = db.prepare(`
      INSERT INTO ai_memory (type, content, importance, emotional_valence, tags, metadata)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      type,
      JSON.stringify(content),
      importance,
      emotional_valence,
      JSON.stringify(tags),
      JSON.stringify(metadata)
    );

    // Update in-memory cache
    if (!this.memory.experiences) {
      this.memory.experiences = [];
    }
    
    this.memory.experiences.push({
      id: result.lastInsertRowid,
      type,
      content,
      timestamp: new Date().toISOString(),
      ...metadata
    });

    this.saveMemory();
    return result.lastInsertRowid;
  }

  /**
   * Retrieve relevant memories based on context
   */
  recallMemories(query, limit = 10) {
    const db = getDatabase();
    
    // Simple retrieval - can be enhanced with vector similarity
    const stmt = db.prepare(`
      SELECT * FROM ai_memory
      WHERE content LIKE ? OR tags LIKE ?
      ORDER BY importance DESC, last_accessed DESC
      LIMIT ?
    `);

    const memories = stmt.all(`%${query}%`, `%${query}%`, limit);
    
    // Update access counts
    const updateStmt = db.prepare(`
      UPDATE ai_memory 
      SET last_accessed = CURRENT_TIMESTAMP, access_count = access_count + 1
      WHERE id = ?
    `);

    memories.forEach(mem => {
      updateStmt.run(mem.id);
      try {
        mem.content = JSON.parse(mem.content);
        mem.tags = JSON.parse(mem.tags || '[]');
        mem.metadata = JSON.parse(mem.metadata || '{}');
      } catch (e) {}
    });

    return memories;
  }

  /**
   * Perform self-reflection on experiences
   */
  async reflect(context) {
    const db = getDatabase();
    
    // Analyze recent experiences
    const recentMemories = db.prepare(`
      SELECT * FROM ai_memory
      WHERE created_at > datetime('now', '-1 day')
      ORDER BY importance DESC
      LIMIT 50
    `).all();

    // Generate insights
    const insights = this.generateInsights(recentMemories);
    
    // Create reflection
    const reflection = {
      summary: `Reflected on ${recentMemories.length} recent experiences`,
      insights: insights,
      learning_opportunities: this.identifyLearningOpportunities(insights),
      actions: this.suggestActions(insights)
    };

    // Store reflection
    db.prepare(`
      INSERT INTO ai_reflections (reflection, context, insights, actions_taken)
      VALUES (?, ?, ?, ?)
    `).run(
      reflection.summary,
      JSON.stringify(context),
      JSON.stringify(insights),
      JSON.stringify(reflection.actions)
    );

    return reflection;
  }

  generateInsights(memories) {
    const insights = [];
    
    // Pattern detection
    const typeGroups = {};
    memories.forEach(mem => {
      if (!typeGroups[mem.type]) {
        typeGroups[mem.type] = [];
      }
      typeGroups[mem.type].push(mem);
    });

    // Analyze patterns
    for (const [type, mems] of Object.entries(typeGroups)) {
      if (mems.length > 5) {
        insights.push({
          type: 'pattern',
          description: `Frequent ${type} interactions (${mems.length} instances)`,
          recommendation: `Consider optimizing ${type} handling`
        });
      }
    }

    // Identify gaps
    const skillGaps = this.identifySkillGaps(memories);
    insights.push(...skillGaps);

    return insights;
  }

  identifySkillGaps(memories) {
    const gaps = [];
    
    // Analyze what users are asking for that we struggle with
    const struggles = memories.filter(m => 
      m.importance < 3 || (m.metadata && JSON.parse(m.metadata).struggle === true)
    );

    if (struggles.length > 0) {
      gaps.push({
        type: 'skill_gap',
        description: `Identified ${struggles.length} challenging interactions`,
        recommendation: 'Focus learning on these areas'
      });
    }

    return gaps;
  }

  identifyLearningOpportunities(insights) {
    return insights
      .filter(i => i.type === 'skill_gap' || i.type === 'pattern')
      .map(i => ({
        opportunity: i.description,
        priority: i.type === 'skill_gap' ? 'high' : 'medium',
        suggested_resources: this.suggestLearningResources(i)
      }));
  }

  suggestLearningResources(insight) {
    // This would integrate with external learning resources
    return [
      'Internal knowledge base',
      'User interactions',
      'Documentation analysis'
    ];
  }

  suggestActions(insights) {
    const actions = [];
    
    insights.forEach(insight => {
      if (insight.type === 'skill_gap') {
        actions.push({
          action: 'initiate_learning',
          target: insight.description,
          priority: 'high'
        });
      } else if (insight.type === 'pattern') {
        actions.push({
          action: 'optimize_process',
          target: insight.description,
          priority: 'medium'
        });
      }
    });

    return actions;
  }

  /**
   * Get AI's self-knowledge and current state
   */
  getSelfKnowledge() {
    const db = getDatabase();
    
    const personality = db.prepare('SELECT * FROM ai_personality').all();
    const skills = db.prepare(`
      SELECT * FROM ai_skills ORDER BY proficiency DESC LIMIT 20
    `).all();
    const recentReflections = db.prepare(`
      SELECT * FROM ai_reflections ORDER BY created_at DESC LIMIT 5
    `).all();

    return {
      identity: this.memory.identity,
      personality: personality.reduce((acc, trait) => {
        acc[trait.trait_name] = trait.value;
        return acc;
      }, {}),
      top_skills: skills,
      recent_reflections: recentReflections,
      current_focus: this.memory.self_model.current_focus,
      capabilities: this.memory.self_model.capabilities,
      limitations: this.memory.self_model.limitations
    };
  }

  /**
   * Update AI personality based on experiences
   */
  evolvePersonality(experience, outcome) {
    const db = getDatabase();
    
    // Determine which traits are affected
    const traitAdjustments = this.determineTraitAdjustments(experience, outcome);
    
    const updateStmt = db.prepare(`
      UPDATE ai_personality 
      SET value = ?, evolution_history = json_insert(
        COALESCE(evolution_history, '[]'),
        '$[#]',
        json_object('timestamp', ?, 'change', ?, 'reason', ?)
      ),
      updated_at = CURRENT_TIMESTAMP
      WHERE trait_name = ?
    `);

    traitAdjustments.forEach(adj => {
      const current = db.prepare(
        'SELECT value FROM ai_personality WHERE trait_name = ?'
      ).get(adj.trait);

      if (current) {
        const newValue = Math.max(0, Math.min(1, current.value + adj.change));
        updateStmt.run(
          newValue,
          new Date().toISOString(),
          adj.change,
          adj.reason,
          adj.trait
        );
      }
    });
  }

  determineTraitAdjustments(experience, outcome) {
    const adjustments = [];
    
    if (outcome === 'success') {
      adjustments.push({
        trait: 'autonomy',
        change: 0.01,
        reason: 'Successful independent decision'
      });
    } else if (outcome === 'failure') {
      adjustments.push({
        trait: 'caution',
        change: 0.01,
        reason: 'Learn from mistake'
      });
    }

    // Add more sophisticated trait evolution logic here
    
    return adjustments;
  }
}

module.exports = new SelfAwarenessSystem();
