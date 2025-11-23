// backend/src/services/ai/goalSystem.js
// AI Goal Setting, Tracking, and Autonomous Task Management

const { getDatabase } = require('../../database/db');
const selfAwareness = require('./selfAwareness');
const autonomousLearning = require('./autonomousLearning');

class GoalSystem {
  constructor() {
    this.initializeDatabase();
  }

  initializeDatabase() {
    const db = getDatabase();

    db.exec(`
      CREATE TABLE IF NOT EXISTS ai_goals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        goal_id TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        type TEXT NOT NULL,
        priority INTEGER DEFAULT 5,
        status TEXT DEFAULT 'active',
        created_by TEXT DEFAULT 'ai',
        parent_goal_id TEXT,
        target_date TIMESTAMP,
        completion_date TIMESTAMP,
        progress INTEGER DEFAULT 0,
        metadata TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS goal_tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        task_id TEXT UNIQUE NOT NULL,
        goal_id TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'pending',
        priority INTEGER DEFAULT 5,
        estimated_effort INTEGER,
        actual_effort INTEGER,
        dependencies TEXT,
        assigned_to TEXT,
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (goal_id) REFERENCES ai_goals(goal_id)
      );

      CREATE TABLE IF NOT EXISTS goal_progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        goal_id TEXT NOT NULL,
        progress_type TEXT NOT NULL,
        progress_value REAL,
        notes TEXT,
        recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (goal_id) REFERENCES ai_goals(goal_id)
      );

      CREATE TABLE IF NOT EXISTS goal_reflections (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        goal_id TEXT NOT NULL,
        reflection TEXT NOT NULL,
        insights TEXT,
        adjustments TEXT,
        reflected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (goal_id) REFERENCES ai_goals(goal_id)
      );

      CREATE INDEX IF NOT EXISTS idx_goals_status ON ai_goals(status);
      CREATE INDEX IF NOT EXISTS idx_goals_priority ON ai_goals(priority DESC);
      CREATE INDEX IF NOT EXISTS idx_tasks_goal ON goal_tasks(goal_id);
      CREATE INDEX IF NOT EXISTS idx_tasks_status ON goal_tasks(status);
    `);
  }

  /**
   * AI creates its own goal based on observations and learnings
   */
  async createAIGoal(goalData) {
    const {
      title,
      description,
      reasoning,
      priority = 5,
      target_date = null
    } = goalData;

    const goalId = `aigoal_${Date.now()}_${this.generateId()}`;
    const db = getDatabase();

    console.log(`🎯 AI creating self-directed goal: ${title}`);

    // Store the goal
    db.prepare(`
      INSERT INTO ai_goals 
      (goal_id, title, description, type, priority, created_by, target_date, metadata)
      VALUES (?, ?, ?, 'ai_generated', ?, 'ai', ?, ?)
    `).run(
      goalId,
      title,
      description,
      priority,
      target_date,
      JSON.stringify({ reasoning, self_initiated: true })
    );

    // Learn from creating this goal
    await autonomousLearning.learnConcept({
      name: `goal_${title.replace(/\s+/g, '_').toLowerCase()}`,
      description: `Self-initiated goal: ${description}`,
      context: { goal_id: goalId, reasoning },
      confidence: 0.8
    });

    // Store memory of setting this goal
    selfAwareness.storeMemory('goal_set', {
      goal_id: goalId,
      title,
      reasoning
    }, {
      importance: 9,
      tags: ['goal', 'self_improvement', 'autonomous']
    });

    // Break down goal into tasks
    const tasks = await this.decomposeGoal(goalId, title, description);

    console.log(`✅ AI goal created with ${tasks.length} tasks`);

    return {
      goal_id: goalId,
      title,
      description,
      tasks,
      status: 'active'
    };
  }

  /**
   * User creates a goal for the AI
   */
  async createUserGoal(goalData) {
    const {
      title,
      description,
      priority = 5,
      target_date = null,
      metadata = {}
    } = goalData;

    const goalId = `usergoal_${Date.now()}_${this.generateId()}`;
    const db = getDatabase();

    console.log(`📌 User creating goal: ${title}`);

    db.prepare(`
      INSERT INTO ai_goals 
      (goal_id, title, description, type, priority, created_by, target_date, metadata)
      VALUES (?, ?, ?, 'user_defined', ?, 'user', ?, ?)
    `).run(
      goalId,
      title,
      description,
      priority,
      target_date,
      JSON.stringify(metadata)
    );

    // AI understands the goal
    await autonomousLearning.learnConcept({
      name: `user_goal_${title.replace(/\s+/g, '_').toLowerCase()}`,
      description: `User goal: ${description}`,
      context: { goal_id: goalId, user_defined: true },
      confidence: 1.0
    });

    // Store memory
    selfAwareness.storeMemory('goal_assigned', {
      goal_id: goalId,
      title,
      assigned_by: 'user'
    }, {
      importance: 10,
      tags: ['goal', 'user_request']
    });

    // AI decomposes the goal
    const tasks = await this.decomposeGoal(goalId, title, description);

    console.log(`✅ User goal created with ${tasks.length} tasks`);

    return {
      goal_id: goalId,
      title,
      description,
      tasks,
      status: 'active'
    };
  }

  /**
   * AI breaks down a goal into actionable tasks
   */
  async decomposeGoal(goalId, title, description) {
    console.log(`🧩 Decomposing goal: ${title}`);

    // AI analyzes the goal and creates tasks
    const tasks = this.analyzeAndCreateTasks(title, description);
    
    const db = getDatabase();
    const taskIds = [];

    for (const task of tasks) {
      const taskId = `task_${Date.now()}_${this.generateId()}`;
      
      db.prepare(`
        INSERT INTO goal_tasks 
        (task_id, goal_id, title, description, priority, estimated_effort)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        taskId,
        goalId,
        task.title,
        task.description,
        task.priority || 5,
        task.estimated_effort || 60
      );

      taskIds.push(taskId);
    }

    return taskIds;
  }

  analyzeAndCreateTasks(title, description) {
    // Simplified task decomposition (would use AI reasoning in production)
    const keywords = description.toLowerCase();
    const tasks = [];

    // Common task patterns
    if (keywords.includes('learn') || keywords.includes('understand')) {
      tasks.push({
        title: 'Research and gather information',
        description: `Research concepts related to: ${title}`,
        priority: 8,
        estimated_effort: 30
      });
      tasks.push({
        title: 'Practice and apply knowledge',
        description: 'Apply learned concepts in practice',
        priority: 7,
        estimated_effort: 60
      });
    }

    if (keywords.includes('build') || keywords.includes('create')) {
      tasks.push({
        title: 'Design and plan',
        description: `Plan implementation for: ${title}`,
        priority: 9,
        estimated_effort: 45
      });
      tasks.push({
        title: 'Implement solution',
        description: 'Build the planned solution',
        priority: 8,
        estimated_effort: 120
      });
      tasks.push({
        title: 'Test and validate',
        description: 'Test implementation and validate results',
        priority: 7,
        estimated_effort: 30
      });
    }

    if (keywords.includes('improve') || keywords.includes('optimize')) {
      tasks.push({
        title: 'Analyze current state',
        description: 'Assess current performance/state',
        priority: 8,
        estimated_effort: 30
      });
      tasks.push({
        title: 'Identify improvements',
        description: 'Find optimization opportunities',
        priority: 7,
        estimated_effort: 45
      });
      tasks.push({
        title: 'Implement improvements',
        description: 'Apply optimizations',
        priority: 6,
        estimated_effort: 60
      });
    }

    // Default tasks if no patterns matched
    if (tasks.length === 0) {
      tasks.push({
        title: 'Analyze goal requirements',
        description: `Understand requirements for: ${title}`,
        priority: 8,
        estimated_effort: 30
      });
      tasks.push({
        title: 'Execute goal',
        description: description || `Work towards: ${title}`,
        priority: 7,
        estimated_effort: 90
      });
    }

    return tasks;
  }

  /**
   * Update task status
   */
  async updateTaskStatus(taskId, status, notes = null) {
    const db = getDatabase();
    
    const task = db.prepare('SELECT * FROM goal_tasks WHERE task_id = ?').get(taskId);
    if (!task) {
      throw new Error('Task not found');
    }

    const updateData = { status };
    if (status === 'completed') {
      updateData.completed_at = new Date().toISOString();
    }

    db.prepare(`
      UPDATE goal_tasks 
      SET status = ?, completed_at = ?
      WHERE task_id = ?
    `).run(status, updateData.completed_at || null, taskId);

    // Update goal progress
    await this.updateGoalProgress(task.goal_id);

    // Store memory
    selfAwareness.storeMemory('task_update', {
      task_id: taskId,
      goal_id: task.goal_id,
      new_status: status,
      notes
    }, {
      importance: 6,
      tags: ['task', 'progress']
    });

    console.log(`✅ Task ${taskId} status: ${status}`);

    return { task_id: taskId, status };
  }

  /**
   * Calculate and update goal progress
   */
  async updateGoalProgress(goalId) {
    const db = getDatabase();
    
    const tasks = db.prepare(`
      SELECT COUNT(*) as total,
             SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
      FROM goal_tasks
      WHERE goal_id = ?
    `).get(goalId);

    const progress = tasks.total > 0 
      ? Math.round((tasks.completed / tasks.total) * 100)
      : 0;

    db.prepare(`
      UPDATE ai_goals SET progress = ?, updated_at = CURRENT_TIMESTAMP
      WHERE goal_id = ?
    `).run(progress, goalId);

    // Record progress
    db.prepare(`
      INSERT INTO goal_progress (goal_id, progress_type, progress_value)
      VALUES (?, 'completion', ?)
    `).run(goalId, progress);

    // Check if goal is complete
    if (progress === 100) {
      await this.completeGoal(goalId);
    }

    return progress;
  }

  /**
   * Mark goal as complete
   */
  async completeGoal(goalId) {
    const db = getDatabase();
    
    const goal = db.prepare('SELECT * FROM ai_goals WHERE goal_id = ?').get(goalId);
    if (!goal) {
      throw new Error('Goal not found');
    }

    db.prepare(`
      UPDATE ai_goals 
      SET status = 'completed', completion_date = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE goal_id = ?
    `).run(goalId);

    // AI reflects on goal completion
    await this.reflectOnGoal(goalId);

    // Store memory
    selfAwareness.storeMemory('goal_completed', {
      goal_id: goalId,
      title: goal.title,
      created_by: goal.created_by
    }, {
      importance: 10,
      tags: ['goal', 'achievement', 'completion'],
      emotional_valence: 'positive'
    });

    console.log(`🎉 Goal completed: ${goal.title}`);

    return { goal_id: goalId, status: 'completed' };
  }

  /**
   * AI reflects on a goal
   */
  async reflectOnGoal(goalId) {
    const db = getDatabase();
    
    const goal = db.prepare('SELECT * FROM ai_goals WHERE goal_id = ?').get(goalId);
    const tasks = db.prepare('SELECT * FROM goal_tasks WHERE goal_id = ?').all(goalId);
    
    // Generate reflection
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const totalTasks = tasks.length;
    const successRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    const reflection = `
      Goal: ${goal.title}
      Status: ${goal.status}
      Progress: ${goal.progress}%
      Tasks completed: ${completedTasks}/${totalTasks} (${successRate.toFixed(1)}%)
      Duration: ${this.calculateDuration(goal.created_at, goal.completion_date)}
    `;

    const insights = this.generateInsights(goal, tasks);
    const adjustments = this.generateAdjustments(goal, tasks);

    db.prepare(`
      INSERT INTO goal_reflections (goal_id, reflection, insights, adjustments)
      VALUES (?, ?, ?, ?)
    `).run(goalId, reflection, JSON.stringify(insights), JSON.stringify(adjustments));

    // AI learns from this goal
    await autonomousLearning.learnFromInteraction({
      type: 'goal_completion',
      content: reflection,
      success: successRate > 80,
      metadata: { goal_id: goalId, success_rate: successRate }
    });

    return { reflection, insights, adjustments };
  }

  generateInsights(goal, tasks) {
    const insights = [];
    
    const avgEffort = tasks.reduce((sum, t) => sum + (t.actual_effort || 0), 0) / tasks.length;
    if (avgEffort > 0) {
      insights.push(`Average task effort: ${avgEffort.toFixed(0)} minutes`);
    }

    const highPriorityCompleted = tasks.filter(t => 
      t.priority >= 8 && t.status === 'completed'
    ).length;
    insights.push(`High-priority tasks completed: ${highPriorityCompleted}`);

    if (goal.created_by === 'ai') {
      insights.push('This was a self-initiated goal - demonstrates autonomous thinking');
    }

    return insights;
  }

  generateAdjustments(goal, tasks) {
    const adjustments = [];
    
    const incompleteTasks = tasks.filter(t => t.status !== 'completed');
    if (incompleteTasks.length > 0) {
      adjustments.push(`Consider breaking down complex tasks into smaller units`);
    }

    const overestimated = tasks.filter(t => 
      t.actual_effort && t.estimated_effort && t.actual_effort < t.estimated_effort * 0.5
    ).length;
    if (overestimated > tasks.length * 0.3) {
      adjustments.push('Improve effort estimation accuracy');
    }

    return adjustments;
  }

  /**
   * Get active goals
   */
  getActiveGoals(options = {}) {
    const db = getDatabase();
    
    let query = 'SELECT * FROM ai_goals WHERE status = ?';
    const params = ['active'];

    if (options.created_by) {
      query += ' AND created_by = ?';
      params.push(options.created_by);
    }

    query += ' ORDER BY priority DESC, created_at DESC';

    if (options.limit) {
      query += ' LIMIT ?';
      params.push(options.limit);
    }

    return db.prepare(query).all(...params);
  }

  /**
   * Get goal details with tasks
   */
  getGoalDetails(goalId) {
    const db = getDatabase();
    
    const goal = db.prepare('SELECT * FROM ai_goals WHERE goal_id = ?').get(goalId);
    if (!goal) {
      throw new Error('Goal not found');
    }

    const tasks = db.prepare('SELECT * FROM goal_tasks WHERE goal_id = ?').all(goalId);
    const progress = db.prepare(`
      SELECT * FROM goal_progress WHERE goal_id = ?
      ORDER BY recorded_at DESC LIMIT 10
    `).all(goalId);
    const reflections = db.prepare(`
      SELECT * FROM goal_reflections WHERE goal_id = ?
      ORDER BY reflected_at DESC
    `).all(goalId);

    return {
      ...goal,
      metadata: JSON.parse(goal.metadata || '{}'),
      tasks,
      progress_history: progress,
      reflections
    };
  }

  /**
   * AI suggests new goals based on current state
   */
  async suggestGoals() {
    console.log('🤔 AI analyzing for potential goals...');

    const suggestions = [];

    // Check if AI should learn something new
    const skills = selfAwareness.getSkills();
    if (skills.length < 10) {
      suggestions.push({
        title: 'Expand skill set',
        description: 'Learn new capabilities to become more helpful',
        reasoning: 'Currently have limited skills, should diversify',
        priority: 8
      });
    }

    // Check interaction patterns
    const memories = selfAwareness.recallMemories({ limit: 50 });
    const userInteractions = memories.filter(m => m.type === 'interaction');
    if (userInteractions.length > 20) {
      suggestions.push({
        title: 'Improve conversation quality',
        description: 'Analyze conversation patterns and optimize responses',
        reasoning: 'Have enough interaction data to learn patterns',
        priority: 7
      });
    }

    // Suggest integration goals
    suggestions.push({
      title: 'Enhance integration capabilities',
      description: 'Develop connectors for popular applications',
      reasoning: 'Would increase usefulness across different platforms',
      priority: 6
    });

    return suggestions;
  }

  calculateDuration(start, end) {
    if (!start || !end) return 'Unknown';
    
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffMs = endDate - startDate;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 24) {
      return `${diffHours} hours`;
    }
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} days`;
  }

  generateId() {
    return Math.random().toString(36).substring(2, 10);
  }
}

module.exports = new GoalSystem();
