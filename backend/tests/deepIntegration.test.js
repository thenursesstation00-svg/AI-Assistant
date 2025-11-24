/**
 * Deep Integration System Tests
 */

const deepIntegration = require('../src/services/ai/deepIntegration');

describe('Deep Integration System', () => {
  beforeAll(async () => {
    await deepIntegration.initialize();
  });

  describe('LSP Integration', () => {
    test('should connect to LSP server', async () => {
      const serverId = await deepIntegration.connectToLSP('javascript', '/workspace');

      expect(serverId).toBeDefined();
      expect(serverId).toContain('lsp_');
    });

    test('should return LSP capabilities', async () => {
      const serverId = await deepIntegration.connectToLSP('typescript', '/workspace');
      const server = deepIntegration.lspServers.get(serverId);

      expect(server.capabilities).toHaveProperty('completionProvider');
      expect(server.capabilities).toHaveProperty('hoverProvider');
      expect(server.capabilities).toHaveProperty('definitionProvider');
    });

    test('should request code completion', async () => {
      const serverId = await deepIntegration.connectToLSP('javascript', '/workspace');
      const position = { line: 10, character: 5 };

      const result = await deepIntegration.requestCompletion(serverId, 'test.js', position);

      expect(result).toHaveProperty('items');
      expect(Array.isArray(result.items)).toBe(true);
      expect(result.isIncomplete).toBeDefined();
    });

    test('should request hover information', async () => {
      const serverId = await deepIntegration.connectToLSP('javascript', '/workspace');
      const position = { line: 5, character: 10 };

      const result = await deepIntegration.requestHover(serverId, 'test.js', position);

      expect(result).toHaveProperty('contents');
      expect(result).toHaveProperty('range');
    });

    test('should throw error for invalid server', async () => {
      await expect(
        deepIntegration.requestCompletion('invalid_id', 'test.js', { line: 1, character: 1 })
      ).rejects.toThrow('LSP server not found');
    });
  });

  describe('Debugger Integration', () => {
    test('should start debug session', async () => {
      const config = {
        type: 'node',
        request: 'launch',
        program: '${workspaceFolder}/app.js'
      };

      const sessionId = await deepIntegration.startDebugSession(config);

      expect(sessionId).toBeDefined();
      expect(sessionId).toContain('debug_');
    });

    test('should set breakpoints', async () => {
      const sessionId = await deepIntegration.startDebugSession({ type: 'node' });
      const breakpoint = await deepIntegration.setBreakpoint(sessionId, 'app.js', 42);

      expect(breakpoint).toHaveProperty('id');
      expect(breakpoint).toHaveProperty('filePath', 'app.js');
      expect(breakpoint).toHaveProperty('line', 42);
      expect(breakpoint.verified).toBe(true);
    });

    test('should continue execution', async () => {
      const sessionId = await deepIntegration.startDebugSession({ type: 'node' });
      const result = await deepIntegration.continueExecution(sessionId);

      expect(result.success).toBe(true);
    });

    test('should step over', async () => {
      const sessionId = await deepIntegration.startDebugSession({ type: 'node' });
      const result = await deepIntegration.stepOver(sessionId);

      expect(result.success).toBe(true);
    });

    test('should get variables', async () => {
      const sessionId = await deepIntegration.startDebugSession({ type: 'node' });
      const variables = await deepIntegration.getVariables(sessionId, 1);

      expect(Array.isArray(variables)).toBe(true);
      if (variables.length > 0) {
        expect(variables[0]).toHaveProperty('name');
        expect(variables[0]).toHaveProperty('value');
        expect(variables[0]).toHaveProperty('type');
      }
    });

    test('should track debug session state', async () => {
      const sessionId = await deepIntegration.startDebugSession({ type: 'node' });
      const session = deepIntegration.debuggerSessions.get(sessionId);

      expect(session).toBeDefined();
      expect(session.state).toBe('stopped');
      expect(session.breakpoints).toEqual([]);
    });
  });

  describe('CI/CD Integration', () => {
    test('should register CI/CD hook', async () => {
      const config = {
        type: 'github-actions',
        url: 'https://api.github.com/repos/user/repo/hooks',
        events: ['push', 'pull_request'],
        secret: 'test-secret'
      };

      const hookId = await deepIntegration.registerCICDHook(config);

      expect(hookId).toBeDefined();
      expect(hookId).toContain('cicd_');
    });

    test('should handle CI/CD webhooks', async () => {
      const hookId = await deepIntegration.registerCICDHook({
        type: 'github-actions',
        url: 'https://test.com'
      });

      const payload = {
        event_type: 'push',
        status: 'success',
        build_number: 123,
        branch: 'main',
        commit: 'abc123'
      };

      const result = await deepIntegration.handleCICDWebhook(hookId, payload);

      expect(result.received).toBe(true);
      expect(result.event).toBeDefined();
      expect(result.event.status).toBe('success');
    });

    test('should analyze build failures', async () => {
      const hookId = await deepIntegration.registerCICDHook({
        type: 'jenkins',
        url: 'https://jenkins.test.com'
      });

      const payload = {
        event_type: 'build',
        status: 'failure',
        failure_reason: 'Test suite failed',
        logs: 'Error: test failed at line 42\nTypeError: undefined is not a function'
      };

      let analysisResult;
      deepIntegration.once('build_failure_analyzed', (analysis) => {
        analysisResult = analysis;
      });

      await deepIntegration.handleCICDWebhook(hookId, payload);

      expect(analysisResult).toBeDefined();
      expect(analysisResult.patterns).toBeDefined();
      expect(analysisResult.suggestions).toBeDefined();
    });

    test('should extract failure patterns', async () => {
      const logs = `
        SyntaxError: Unexpected token
        TypeError: Cannot read property 'x' of undefined
        Test suite failed
      `;

      const patterns = deepIntegration.extractFailurePatterns(logs);

      expect(patterns).toContain('syntax_error');
      expect(patterns).toContain('type_error');
      expect(patterns).toContain('test_failure');
    });

    test('should generate fix suggestions', async () => {
      const suggestions = deepIntegration.generateFixSuggestions('test failed');

      expect(Array.isArray(suggestions)).toBe(true);
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.some(s => s.includes('test'))).toBe(true);
    });
  });

  describe('WebSocket Collaboration', () => {
    test('should generate unique client IDs', () => {
      const id1 = deepIntegration.generateClientId();
      const id2 = deepIntegration.generateClientId();

      expect(id1).not.toBe(id2);
      expect(id1).toContain('client_');
    });

    test('should parse client metadata', () => {
      const req = {
        headers: {
          'user-agent': 'Mozilla/5.0',
          'origin': 'http://localhost:3000'
        },
        socket: {
          remoteAddress: '127.0.0.1'
        }
      };

      const metadata = deepIntegration.parseClientMetadata(req);

      expect(metadata).toHaveProperty('userAgent');
      expect(metadata).toHaveProperty('ip');
      expect(metadata).toHaveProperty('origin');
    });
  });

  describe('Statistics', () => {
    test('should get integration stats', () => {
      const stats = deepIntegration.getStats();

      expect(stats).toHaveProperty('connectedClients');
      expect(stats).toHaveProperty('lspServers');
      expect(stats).toHaveProperty('debugSessions');
      expect(stats).toHaveProperty('cicdHooks');
    });

    test('should get active sessions', async () => {
      await deepIntegration.connectToLSP('javascript', '/workspace');
      await deepIntegration.startDebugSession({ type: 'node' });

      const sessions = deepIntegration.getActiveSessions();

      expect(sessions).toHaveProperty('clients');
      expect(sessions).toHaveProperty('lspServers');
      expect(sessions).toHaveProperty('debugSessions');
      expect(sessions.lspServers.length).toBeGreaterThan(0);
      expect(sessions.debugSessions.length).toBeGreaterThan(0);
    });
  });

  describe('Event Emission', () => {
    test('should emit code_edit events', (done) => {
      deepIntegration.once('code_edit', (data) => {
        expect(data).toHaveProperty('filePath');
        expect(data).toHaveProperty('changes');
        done();
      });

      deepIntegration.emit('code_edit', {
        clientId: 'test',
        filePath: 'test.js',
        changes: [{ type: 'insert', text: 'test' }]
      });
    });

    test('should emit cicd_event events', (done) => {
      deepIntegration.once('cicd_event', (event) => {
        expect(event).toHaveProperty('type');
        expect(event).toHaveProperty('status');
        done();
      });

      deepIntegration.emit('cicd_event', {
        type: 'build',
        status: 'success'
      });
    });
  });
});
