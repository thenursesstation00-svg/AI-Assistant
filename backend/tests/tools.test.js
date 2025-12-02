const registry = require('../src/services/tools/registry');
const policyService = require('../src/services/tools/policy');

// Mock database for policy service
jest.mock('../src/database/db', () => {
  const dbMock = {
    prepare: jest.fn(),
    pragma: jest.fn(),
    exec: jest.fn(),
  };
  return {
    getDatabase: () => dbMock
  };
});

const { getDatabase } = require('../src/database/db');

describe('Tool Registry', () => {
  beforeEach(() => {
    // Clear registry (if we exposed a clear method, but we didn't. 
    // We'll just register unique tools for each test or assume fresh state if jest resets modules)
    // Since registry is a singleton instance, it persists. I should add a clear method or just use unique names.
    registry.tools = new Map(); 
  });

  test('should register and retrieve a tool', () => {
    const handler = async () => 'success';
    registry.register('test.tool', {}, handler, 'A test tool');
    
    const tool = registry.get('test.tool');
    expect(tool).toBeDefined();
    expect(tool.description).toBe('A test tool');
  });

  test('should execute a tool', async () => {
    const handler = async (args) => `Hello ${args.name}`;
    registry.register('greet', {}, handler, 'Greets user');
    
    const result = await registry.execute('greet', { name: 'World' });
    expect(result).toBe('Hello World');
  });

  test('should throw if tool not found', async () => {
    await expect(registry.execute('missing.tool', {}))
      .rejects.toThrow('Tool missing.tool not found');
  });
});

describe('Policy Service', () => {
  let db;

  beforeEach(() => {
    db = getDatabase();
    jest.clearAllMocks();
  });

  test('should allow if policy says allow', async () => {
    // Mock DB response
    db.prepare.mockReturnValue({
      all: jest.fn().mockReturnValue([
        { tool_pattern: 'git.*', policy: 'allow' }
      ])
    });

    const result = await policyService.checkPolicy('dev', 'git.status', {});
    expect(result.allowed).toBe(true);
    expect(result.requiresApproval).toBe(false);
  });

  test('should deny if policy says deny', async () => {
    db.prepare.mockReturnValue({
      all: jest.fn().mockReturnValue([
        { tool_pattern: 'shell.*', policy: 'deny' }
      ])
    });

    const result = await policyService.checkPolicy('guest', 'shell.exec', {});
    expect(result.allowed).toBe(false);
  });

  test('should require approval if policy says ask', async () => {
    db.prepare.mockReturnValue({
      all: jest.fn().mockReturnValue([
        { tool_pattern: 'git.push', policy: 'ask' }
      ])
    });

    const result = await policyService.checkPolicy('dev', 'git.push', {});
    expect(result.allowed).toBe(true);
    expect(result.requiresApproval).toBe(true);
  });

  test('should fallback to default persona if no user policy', async () => {
    // First call returns empty (no user policy)
    // Second call (fallback) returns default policy
    const prepareMock = jest.fn();
    db.prepare = prepareMock;
    
    const allMockUser = jest.fn().mockReturnValue([]);
    const allMockDefault = jest.fn().mockReturnValue([
      { tool_pattern: '*', policy: 'deny' }
    ]);

    prepareMock.mockReturnValueOnce({ all: allMockUser });
    prepareMock.mockReturnValueOnce({ all: allMockDefault });

    const result = await policyService.checkPolicy('unknown_user', 'any.tool', {});
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('Denied by policy');
  });
});
