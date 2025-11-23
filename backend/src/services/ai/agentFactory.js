// backend/src/services/ai/agentFactory.js
// AI-Powered Agent and Bot Builder with Autonomous Deployment

const fs = require('fs');
const path = require('path');
const { getDatabase } = require('../../database/db');
const selfAwareness = require('./selfAwareness');
const autonomousLearning = require('./autonomousLearning');

class AgentFactory {
  constructor() {
    this.agentsPath = path.join(__dirname, '../../../data/agents');
    this.templatesPath = path.join(__dirname, '../../../data/agent_templates');
    this.initializeFactory();
  }

  initializeFactory() {
    // Create directories
    [this.agentsPath, this.templatesPath].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });

    const db = getDatabase();
    
    db.exec(`
      CREATE TABLE IF NOT EXISTS ai_agents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        agent_id TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        purpose TEXT,
        capabilities TEXT,
        configuration TEXT,
        status TEXT DEFAULT 'inactive',
        deployment_target TEXT,
        performance_metrics TEXT,
        created_by TEXT DEFAULT 'ai',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_active TIMESTAMP,
        execution_count INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS agent_templates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        template_id TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        category TEXT,
        base_capabilities TEXT,
        customizable_params TEXT,
        code_template TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS agent_executions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        agent_id TEXT NOT NULL,
        task TEXT,
        input_data TEXT,
        output_data TEXT,
        success BOOLEAN,
        error_message TEXT,
        execution_time_ms INTEGER,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (agent_id) REFERENCES ai_agents(agent_id)
      );

      CREATE TABLE IF NOT EXISTS agent_deployments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        agent_id TEXT NOT NULL,
        deployment_id TEXT UNIQUE NOT NULL,
        target_platform TEXT NOT NULL,
        deployment_config TEXT,
        status TEXT DEFAULT 'pending',
        endpoint_url TEXT,
        deployed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (agent_id) REFERENCES ai_agents(agent_id)
      );

      CREATE INDEX IF NOT EXISTS idx_agents_status ON ai_agents(status);
      CREATE INDEX IF NOT EXISTS idx_executions_agent ON agent_executions(agent_id);
    `);

    this.loadDefaultTemplates();
  }

  loadDefaultTemplates() {
    const db = getDatabase();
    
    const templates = [
      {
        id: 'task_automation',
        name: 'Task Automation Agent',
        description: 'Automates repetitive tasks',
        category: 'automation',
        capabilities: ['task_scheduling', 'file_operations', 'api_calls'],
        params: ['task_type', 'schedule', 'triggers']
      },
      {
        id: 'code_assistant',
        name: 'Code Assistant Bot',
        description: 'Helps with coding tasks',
        category: 'development',
        capabilities: ['code_generation', 'bug_fixing', 'code_review'],
        params: ['language', 'framework', 'style_guide']
      },
      {
        id: 'data_processor',
        name: 'Data Processing Agent',
        description: 'Processes and analyzes data',
        category: 'data',
        capabilities: ['data_cleaning', 'analysis', 'visualization'],
        params: ['data_source', 'processing_rules', 'output_format']
      },
      {
        id: 'integration_bot',
        name: 'Integration Bot',
        description: 'Connects and syncs different apps',
        category: 'integration',
        capabilities: ['api_integration', 'data_sync', 'webhook_handling'],
        params: ['source_app', 'target_app', 'sync_rules']
      },
      {
        id: 'monitoring_agent',
        name: 'System Monitor',
        description: 'Monitors systems and sends alerts',
        category: 'monitoring',
        capabilities: ['system_monitoring', 'alert_generation', 'log_analysis'],
        params: ['monitors', 'thresholds', 'alert_channels']
      },
      {
        id: 'personal_assistant',
        name: 'Personal AI Assistant',
        description: 'Deployable personal assistant for other apps',
        category: 'assistant',
        capabilities: ['conversation', 'task_management', 'information_retrieval'],
        params: ['personality', 'knowledge_base', 'interaction_style']
      }
    ];

    const stmt = db.prepare(`
      INSERT OR IGNORE INTO agent_templates 
      (template_id, name, description, category, base_capabilities, customizable_params)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    templates.forEach(t => {
      stmt.run(
        t.id,
        t.name,
        t.description,
        t.category,
        JSON.stringify(t.capabilities),
        JSON.stringify(t.params)
      );
    });
  }

  /**
   * AI builds a new agent based on requirements
   */
  async buildAgent(requirements) {
    const {
      purpose,
      capabilities = [],
      deployment_target = 'local',
      custom_logic = null
    } = requirements;

    console.log(`🔨 Building agent for: ${purpose}`);

    // AI decides which template to use
    const template = await this.selectBestTemplate(purpose, capabilities);
    
    // Generate unique agent ID
    const agentId = `agent_${Date.now()}_${this.generateId()}`;
    const name = this.generateAgentName(purpose);

    // Build agent configuration
    const config = await this.generateConfiguration(template, requirements);
    
    // Generate agent code
    const agentCode = await this.generateAgentCode(template, config, custom_logic);
    
    // Save agent to filesystem
    const agentPath = path.join(this.agentsPath, `${agentId}.js`);
    fs.writeFileSync(agentPath, agentCode);

    // Register in database
    const db = getDatabase();
    db.prepare(`
      INSERT INTO ai_agents 
      (agent_id, name, type, purpose, capabilities, configuration, status, deployment_target)
      VALUES (?, ?, ?, ?, ?, ?, 'ready', ?)
    `).run(
      agentId,
      name,
      template.template_id,
      purpose,
      JSON.stringify(capabilities),
      JSON.stringify(config),
      deployment_target
    );

    // Store memory of creating this agent
    selfAwareness.storeMemory('agent_creation', {
      agent_id: agentId,
      purpose,
      template: template.name
    }, {
      importance: 8,
      tags: ['agent', 'creation', purpose]
    });

    console.log(`✅ Agent built: ${name} (${agentId})`);

    return {
      agent_id: agentId,
      name,
      type: template.name,
      purpose,
      capabilities,
      status: 'ready',
      code_path: agentPath
    };
  }

  async selectBestTemplate(purpose, capabilities) {
    const db = getDatabase();
    
    // Simple keyword matching (can be enhanced with AI reasoning)
    const templates = db.prepare('SELECT * FROM agent_templates').all();
    
    let bestTemplate = templates[0];
    let bestScore = 0;

    templates.forEach(template => {
      let score = 0;
      
      // Match purpose keywords
      const purposeLower = purpose.toLowerCase();
      if (purposeLower.includes(template.category)) score += 3;
      if (purposeLower.includes(template.name.toLowerCase())) score += 2;
      
      // Match capabilities
      const templateCaps = JSON.parse(template.base_capabilities || '[]');
      capabilities.forEach(cap => {
        if (templateCaps.includes(cap)) score += 1;
      });

      if (score > bestScore) {
        bestScore = score;
        bestTemplate = template;
      }
    });

    return bestTemplate;
  }

  async generateConfiguration(template, requirements) {
    const baseConfig = {
      template: template.template_id,
      version: '1.0',
      created: new Date().toISOString(),
      ...requirements
    };

    // Add template-specific defaults
    const customParams = JSON.parse(template.customizable_params || '[]');
    customParams.forEach(param => {
      if (!(param in baseConfig)) {
        baseConfig[param] = this.getDefaultParamValue(param);
      }
    });

    return baseConfig;
  }

  getDefaultParamValue(param) {
    const defaults = {
      schedule: '0 * * * *', // Hourly
      language: 'javascript',
      data_source: 'api',
      output_format: 'json',
      personality: 'helpful',
      monitors: ['cpu', 'memory', 'disk']
    };

    return defaults[param] || null;
  }

  async generateAgentCode(template, config, customLogic) {
    // Generate executable agent code
    const code = `
// Auto-generated agent: ${config.purpose || 'Unnamed Agent'}
// Created by: AI Assistant
// Template: ${template.name}
// Generated: ${new Date().toISOString()}

const { EventEmitter } = require('events');

class Agent extends EventEmitter {
  constructor(config) {
    super();
    this.config = config;
    this.status = 'initialized';
    this.executionCount = 0;
  }

  async initialize() {
    console.log('Agent initializing...', this.config.purpose);
    // Add template-specific initialization
    ${this.generateTemplateInit(template)}
    this.status = 'ready';
    this.emit('ready');
  }

  async execute(task, input) {
    this.executionCount++;
    console.log(\`Executing task: \${task}\`);
    
    const startTime = Date.now();
    
    try {
      // Template-specific execution logic
      ${this.generateTemplateLogic(template)}
      
      // Custom logic if provided
      ${customLogic || '// No custom logic'}
      
      const result = await this.performTask(task, input);
      const executionTime = Date.now() - startTime;
      
      this.emit('execution_complete', { task, result, executionTime });
      
      return {
        success: true,
        result,
        executionTime
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.emit('execution_error', { task, error, executionTime });
      
      return {
        success: false,
        error: error.message,
        executionTime
      };
    }
  }

  async performTask(task, input) {
    // Override this in specific implementations
    return { message: 'Task completed', input };
  }

  async learn(feedback) {
    // Agent self-improvement logic
    console.log('Learning from feedback:', feedback);
    // Store learnings for future optimization
  }

  getStatus() {
    return {
      status: this.status,
      executionCount: this.executionCount,
      config: this.config
    };
  }

  async shutdown() {
    this.status = 'shutdown';
    this.emit('shutdown');
  }
}

module.exports = Agent;
`;

    return code;
  }

  generateTemplateInit(template) {
    const inits = {
      'task_automation': `
    this.scheduler = null; // Initialize task scheduler
    this.taskQueue = [];`,
      'code_assistant': `
    this.codeContext = {};
    this.knownPatterns = [];`,
      'data_processor': `
    this.dataCache = new Map();
    this.processors = [];`,
      'integration_bot': `
    this.connections = {};
    this.syncState = {};`,
      'monitoring_agent': `
    this.monitors = [];
    this.alerts = [];`,
      'personal_assistant': `
    this.conversationHistory = [];
    this.userPreferences = {};`
    };

    return inits[template.template_id] || '// Default initialization';
  }

  generateTemplateLogic(template) {
    const logic = {
      'task_automation': `
      // Automation logic
      if (task === 'schedule') {
        return await this.scheduleTask(input);
      }`,
      'code_assistant': `
      // Code assistance logic
      if (task === 'generate_code') {
        return await this.generateCode(input);
      }`,
      'data_processor': `
      // Data processing logic
      if (task === 'process_data') {
        return await this.processData(input);
      }`,
      'integration_bot': `
      // Integration logic
      if (task === 'sync') {
        return await this.syncData(input);
      }`,
      'monitoring_agent': `
      // Monitoring logic
      if (task === 'check_status') {
        return await this.checkSystemStatus(input);
      }`,
      'personal_assistant': `
      // Assistant logic
      if (task === 'respond') {
        return await this.generateResponse(input);
      }`
    };

    return logic[template.template_id] || '// Default logic';
  }

  /**
   * Deploy an agent to target platform
   */
  async deployAgent(agentId, target = 'local', config = {}) {
    const db = getDatabase();
    
    const agent = db.prepare('SELECT * FROM ai_agents WHERE agent_id = ?').get(agentId);
    if (!agent) {
      throw new Error('Agent not found');
    }

    console.log(`🚀 Deploying agent ${agent.name} to ${target}`);

    const deploymentId = `deploy_${Date.now()}_${this.generateId()}`;
    
    let deployment;
    switch (target) {
      case 'local':
        deployment = await this.deployLocal(agent, config);
        break;
      case 'api':
        deployment = await this.deployAsAPI(agent, config);
        break;
      case 'webhook':
        deployment = await this.deployAsWebhook(agent, config);
        break;
      case 'standalone':
        deployment = await this.deployStandalone(agent, config);
        break;
      default:
        throw new Error(`Unknown deployment target: ${target}`);
    }

    // Record deployment
    db.prepare(`
      INSERT INTO agent_deployments 
      (agent_id, deployment_id, target_platform, deployment_config, status, endpoint_url)
      VALUES (?, ?, ?, ?, 'active', ?)
    `).run(
      agentId,
      deploymentId,
      target,
      JSON.stringify(config),
      deployment.endpoint || null
    );

    // Update agent status
    db.prepare(`
      UPDATE ai_agents SET status = 'deployed', last_active = CURRENT_TIMESTAMP
      WHERE agent_id = ?
    `).run(agentId);

    console.log(`✅ Agent deployed: ${deployment.endpoint || 'local process'}`);

    return {
      deployment_id: deploymentId,
      agent_id: agentId,
      target,
      status: 'active',
      ...deployment
    };
  }

  async deployLocal(agent, config) {
    // Load and instantiate agent locally
    const agentPath = path.join(this.agentsPath, `${agent.agent_id}.js`);
    
    try {
      const AgentClass = require(agentPath);
      const instance = new AgentClass(JSON.parse(agent.configuration));
      await instance.initialize();
      
      // Store instance reference (in production, use process management)
      global.activeAgents = global.activeAgents || {};
      global.activeAgents[agent.agent_id] = instance;
      
      return {
        type: 'local_instance',
        pid: process.pid,
        instance_id: agent.agent_id
      };
    } catch (error) {
      throw new Error(`Failed to deploy locally: ${error.message}`);
    }
  }

  async deployAsAPI(agent, config) {
    // Create API endpoint for agent (would integrate with Express in production)
    const endpoint = `/api/agents/${agent.agent_id}/execute`;
    
    return {
      type: 'api_endpoint',
      endpoint,
      method: 'POST',
      authentication: config.auth || 'api_key'
    };
  }

  async deployAsWebhook(agent, config) {
    // Deploy as webhook handler
    const webhookUrl = `${config.base_url || 'http://localhost:3001'}/webhooks/${agent.agent_id}`;
    
    return {
      type: 'webhook',
      endpoint: webhookUrl,
      events: config.events || ['all']
    };
  }

  async deployStandalone(agent, config) {
    // Package agent as standalone executable
    const packagePath = path.join(this.agentsPath, 'packaged', `${agent.agent_id}.zip`);
    
    // In production, would create actual package
    return {
      type: 'standalone',
      package_path: packagePath,
      instructions: 'Download and run package independently'
    };
  }

  /**
   * Execute an agent
   */
  async executeAgent(agentId, task, input = {}) {
    const db = getDatabase();
    
    const agent = db.prepare('SELECT * FROM ai_agents WHERE agent_id = ?').get(agentId);
    if (!agent) {
      throw new Error('Agent not found');
    }

    const startTime = Date.now();
    
    try {
      // Get agent instance
      const instance = global.activeAgents?.[agentId];
      if (!instance) {
        throw new Error('Agent not deployed locally');
      }

      const result = await instance.execute(task, input);
      const executionTime = Date.now() - startTime;

      // Record execution
      db.prepare(`
        INSERT INTO agent_executions 
        (agent_id, task, input_data, output_data, success, execution_time_ms)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        agentId,
        task,
        JSON.stringify(input),
        JSON.stringify(result.result),
        result.success,
        executionTime
      );

      // Update agent metrics
      db.prepare(`
        UPDATE ai_agents 
        SET execution_count = execution_count + 1, last_active = CURRENT_TIMESTAMP
        WHERE agent_id = ?
      `).run(agentId);

      return result;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      
      db.prepare(`
        INSERT INTO agent_executions 
        (agent_id, task, input_data, success, error_message, execution_time_ms)
        VALUES (?, ?, ?, 0, ?, ?)
      `).run(
        agentId,
        task,
        JSON.stringify(input),
        error.message,
        executionTime
      );

      throw error;
    }
  }

  /**
   * List all agents
   */
  listAgents(filter = {}) {
    const db = getDatabase();
    
    let query = 'SELECT * FROM ai_agents WHERE 1=1';
    const params = [];

    if (filter.status) {
      query += ' AND status = ?';
      params.push(filter.status);
    }

    if (filter.type) {
      query += ' AND type = ?';
      params.push(filter.type);
    }

    query += ' ORDER BY created_at DESC';

    return db.prepare(query).all(...params);
  }

  /**
   * Get agent analytics
   */
  getAgentAnalytics(agentId) {
    const db = getDatabase();
    
    const agent = db.prepare('SELECT * FROM ai_agents WHERE agent_id = ?').get(agentId);
    if (!agent) {
      throw new Error('Agent not found');
    }

    const executions = db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) as successful,
        AVG(execution_time_ms) as avg_time,
        MAX(executed_at) as last_execution
      FROM agent_executions
      WHERE agent_id = ?
    `).get(agentId);

    const recentExecutions = db.prepare(`
      SELECT * FROM agent_executions
      WHERE agent_id = ?
      ORDER BY executed_at DESC
      LIMIT 10
    `).all(agentId);

    return {
      agent: {
        id: agent.agent_id,
        name: agent.name,
        type: agent.type,
        status: agent.status
      },
      metrics: {
        total_executions: executions.total,
        success_rate: executions.total > 0 
          ? (executions.successful / executions.total) * 100 
          : 0,
        avg_execution_time_ms: executions.avg_time,
        last_execution: executions.last_execution
      },
      recent_executions: recentExecutions
    };
  }

  generateId() {
    return Math.random().toString(36).substring(2, 10);
  }

  generateAgentName(purpose) {
    const prefix = ['Smart', 'Auto', 'Intelligent', 'Quick', 'Pro'];
    const suffix = ['Bot', 'Agent', 'Helper', 'Assistant', 'Worker'];
    
    const randomPrefix = prefix[Math.floor(Math.random() * prefix.length)];
    const randomSuffix = suffix[Math.floor(Math.random() * suffix.length)];
    
    const baseName = purpose.split(' ').map(w => 
      w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
    ).join('');
    
    return `${randomPrefix}${baseName}${randomSuffix}`;
  }
}

module.exports = new AgentFactory();
