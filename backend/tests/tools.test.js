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

// Mock policy service for registry tests
jest.mock('../src/services/tools/policy', () => ({
  checkPolicy: jest.fn(),
  addPolicy: jest.fn(),
  matches: jest.fn() // Keep original if needed, but mocking is safer
}));

const { getDatabase } = require('../src/database/db');

describe('Tool Registry', () => {
  beforeEach(() => {
    // Clear registry
    registry.tools = new Map();
    jest.clearAllMocks();
    
    // Default allow policy
    policyService.checkPolicy.mockResolvedValue({ 
      allowed: true, 
      reason: 'Mock allow', 
      requiresApproval: false 
    });
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
    expect(policyService.checkPolicy).toHaveBeenCalled();
  });

  test('should throw if tool not found', async () => {
    await expect(registry.execute('missing.tool', {}))
      .rejects.toThrow('Tool missing.tool not found');
  });

  test('should throw if policy denies', async () => {
    policyService.checkPolicy.mockResolvedValue({ 
      allowed: false, 
      reason: 'Policy denied', 
      requiresApproval: false 
    });

    const handler = async () => 'success';
    registry.register('restricted.tool', {}, handler, 'Restricted');

    await expect(registry.execute('restricted.tool', {}))
      .rejects.toThrow('Tool execution denied: Policy denied');
  });
});

describe('Policy Service', () => {
  let db;
  // We need to unmock policyService to test it, but Jest hoisting makes this tricky.
  // Instead, we can test the *logic* of policyService by importing the class directly if possible,
  // or we rely on the fact that we mocked the *module* above.
  // Ah, if I mock the module, I can't test the real implementation in the same file easily without jest.requireActual.
  
  // Better approach: Don't mock policyService globally. Mock it only for Registry tests using spyOn or similar.
  // But registry imports it directly.
  
  // Let's use jest.requireActual for the Policy Service tests.
  const RealPolicyService = jest.requireActual('../src/services/tools/policy');

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

    const result = await RealPolicyService.checkPolicy('dev', 'git.status', {});
    expect(result.allowed).toBe(true);
    expect(result.requiresApproval).toBe(false);
  });

  test('should deny if policy says deny', async () => {
    db.prepare.mockReturnValue({
      all: jest.fn().mockReturnValue([
        { tool_pattern: 'shell.*', policy: 'deny' }
      ])
    });

    const result = await RealPolicyService.checkPolicy('guest', 'shell.exec', {});
    expect(result.allowed).toBe(false);
  });

  test('should require approval if policy says ask', async () => {
    db.prepare.mockReturnValue({
      all: jest.fn().mockReturnValue([
        { tool_pattern: 'git.push', policy: 'ask' }
      ])
    });

    const result = await RealPolicyService.checkPolicy('dev', 'git.push', {});
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
      { tool_pattern: '*', policy: 'allow' }
    ]);

    // When called with args, return specific mocks
    prepareMock.mockImplementation((sql) => {
      if (sql.includes("persona_id = 'default'")) {
        return { all: () => allMockDefault() };
      }
      if (sql.includes('persona_id = ?')) {
        return { all: (id) => id === 'default' ? allMockDefault() : allMockUser() };
      }
      return { all: () => [] };
    });

    const result = await RealPolicyService.checkPolicy('newuser', 'any.tool', {});
    expect(result.allowed).toBe(true);
  });
});
