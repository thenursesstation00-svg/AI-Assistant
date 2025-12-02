const orchestrator = require('../src/services/agents/orchestrator');

describe('AgentOrchestrator', () => {
  beforeEach(() => {
    // Reset agents map if possible, or just ignore previous state
    orchestrator.agents = new Map();
  });

  test('should create an agent', () => {
    const agent = orchestrator.createAgent('test-agent', { foo: 'bar' });
    expect(agent).toBeDefined();
    expect(agent.id).toBeDefined();
    expect(agent.type).toBe('test-agent');
    expect(agent.status).toBe('idle');
    expect(agent.config).toEqual({ foo: 'bar' });
  });

  test('should retrieve an agent by id', () => {
    const created = orchestrator.createAgent('test-agent');
    const retrieved = orchestrator.getAgent(created.id);
    expect(retrieved).toEqual(created);
  });

  test('should list all agents', () => {
    orchestrator.createAgent('agent-1');
    orchestrator.createAgent('agent-2');
    const agents = orchestrator.getAllAgents();
    expect(agents.length).toBe(2);
  });

  test('should update agent status', () => {
    const agent = orchestrator.createAgent('test-agent');
    orchestrator.updateAgentStatus(agent.id, 'running', 10);
    
    const updated = orchestrator.getAgent(agent.id);
    expect(updated.status).toBe('running');
    expect(updated.progress).toBe(10);
    expect(updated.startTime).toBeDefined();
  });

  test('should add logs', () => {
    const agent = orchestrator.createAgent('test-agent');
    orchestrator.addAgentLog(agent.id, 'test log message');
    
    const updated = orchestrator.getAgent(agent.id);
    expect(updated.logs.length).toBe(1);
    expect(updated.logs[0].message).toBe('test log message');
  });
});
