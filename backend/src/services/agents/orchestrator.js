const { v4: uuidv4 } = require('uuid');

class AgentOrchestrator {
  constructor() {
    this.agents = new Map(); // id -> agent state
  }

  /**
   * Register a new agent instance
   * @param {string} type - The type of agent (e.g., 'researcher', 'coder')
   * @param {Object} config - Configuration for the agent
   * @returns {Object} The created agent object
   */
  createAgent(type, config = {}) {
    const id = uuidv4();
    const agent = {
      id,
      type,
      status: 'idle', // idle, running, paused, completed, failed
      startTime: null,
      endTime: null,
      progress: 0,
      logs: [],
      config,
      result: null
    };
    this.agents.set(id, agent);
    return agent;
  }

  getAgent(id) {
    return this.agents.get(id);
  }

  getAllAgents() {
    return Array.from(this.agents.values()).sort((a, b) => b.startTime - a.startTime);
  }

  updateAgentStatus(id, status, progress = null) {
    const agent = this.agents.get(id);
    if (agent) {
      agent.status = status;
      if (progress !== null) agent.progress = progress;
      
      if (status === 'running' && !agent.startTime) {
        agent.startTime = Date.now();
      }
      if ((status === 'completed' || status === 'failed') && !agent.endTime) {
        agent.endTime = Date.now();
      }
    }
  }

  addAgentLog(id, message, level = 'info') {
    const agent = this.agents.get(id);
    if (agent) {
      agent.logs.push({ 
        timestamp: Date.now(), 
        message, 
        level 
      });
    }
  }

  /**
   * Start an agent's execution
   * This is a mock implementation for Phase P4. 
   * In the future, this will delegate to specific agent implementations.
   */
  async startAgent(id) {
    const agent = this.agents.get(id);
    if (!agent) return;

    this.updateAgentStatus(id, 'running', 0);
    this.addAgentLog(id, `Agent ${agent.type} initialized.`);
    
    try {
      // Simulate different behaviors based on type
      if (agent.type === 'researcher') {
        await this._simulateResearchTask(id);
      } else if (agent.type === 'coder') {
        await this._simulateCodingTask(id);
      } else {
        await this._simulateGenericTask(id);
      }
    } catch (error) {
      this.updateAgentStatus(id, 'failed');
      this.addAgentLog(id, `Critical error: ${error.message}`, 'error');
    }
  }

  async _simulateResearchTask(id) {
    const steps = ['Analyzing query...', 'Searching knowledge base...', 'Synthesizing results...', 'Finalizing report...'];
    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      this.addAgentLog(id, steps[i]);
      this.updateAgentStatus(id, 'running', ((i + 1) / steps.length) * 100);
    }
    this.updateAgentStatus(id, 'completed', 100);
    this.addAgentLog(id, 'Research complete.');
  }

  async _simulateCodingTask(id) {
    const steps = ['Reading requirements...', 'Scanning codebase...', 'Generating solution...', 'Running tests...'];
    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      this.addAgentLog(id, steps[i]);
      this.updateAgentStatus(id, 'running', ((i + 1) / steps.length) * 100);
    }
    this.updateAgentStatus(id, 'completed', 100);
    this.addAgentLog(id, 'Coding task complete.');
  }

  async _simulateGenericTask(id) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    this.addAgentLog(id, 'Processing...');
    this.updateAgentStatus(id, 'running', 50);
    await new Promise(resolve => setTimeout(resolve, 1000));
    this.updateAgentStatus(id, 'completed', 100);
    this.addAgentLog(id, 'Task complete.');
  }
}

module.exports = new AgentOrchestrator();
