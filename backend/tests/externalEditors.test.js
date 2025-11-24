/**
 * External Editors Integration - Comprehensive Test Suite
 */

const externalEditors = require('../src/services/ai/externalEditors');
const axios = require('axios');

// Mock axios
jest.mock('axios');

describe('External Editors Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    externalEditors.sessions.clear();
    externalEditors.githubToken = 'test_token';
  });

  describe('GitHub Web Editor', () => {
    test('should generate GitHub URL correctly', async () => {
      const result = await externalEditors.openInGitHub({
        owner: 'testuser',
        repo: 'testrepo',
        filePath: 'src/app.js',
        branch: 'main'
      });

      expect(result.url).toBe('https://github.com/testuser/testrepo/blob/main/src/app.js');
      expect(result.editor).toBe('github');
      expect(result.sessionId).toBeDefined();
    });

    test('should include line number in URL', async () => {
      const result = await externalEditors.openInGitHub({
        owner: 'testuser',
        repo: 'testrepo',
        filePath: 'src/app.js',
        lineNumber: 42
      });

      expect(result.url).toContain('#L42');
    });
  });

  describe('GitHub Codespaces', () => {
    test('should create codespace if none exists', async () => {
      axios.get.mockResolvedValueOnce({ data: { codespaces: [] } });
      axios.post.mockResolvedValueOnce({
        data: {
          name: 'test-codespace',
          state: 'Available'
        }
      });

      const result = await externalEditors.openInCodespaces({
        owner: 'testuser',
        repo: 'testrepo',
        filePath: 'src/app.js'
      });

      expect(result.codespace).toBe('test-codespace');
      expect(result.url).toContain('test-codespace.github.dev');
      expect(axios.post).toHaveBeenCalled();
    });

    test('should use existing codespace', async () => {
      axios.get.mockResolvedValueOnce({
        data: {
          codespaces: [{
            name: 'existing-codespace',
            state: 'Available'
          }]
        }
      });

      const result = await externalEditors.openInCodespaces({
        owner: 'testuser',
        repo: 'testrepo',
        filePath: 'src/app.js'
      });

      expect(result.codespace).toBe('existing-codespace');
      expect(axios.post).not.toHaveBeenCalled();
    });

    test('should require GitHub token', async () => {
      externalEditors.githubToken = null;

      await expect(
        externalEditors.openInCodespaces({
          owner: 'testuser',
          repo: 'testrepo',
          filePath: 'src/app.js'
        })
      ).rejects.toThrow('GitHub token required');
    });
  });

  describe('VS Code Integration', () => {
    test('should generate VS Code remote URL', async () => {
      const result = await externalEditors.openInVSCodeRemote({
        filePath: 'src/app.js',
        remoteUrl: 'github.com/testuser/testrepo',
        lineNumber: 10
      });

      expect(result.url).toContain('vscode.dev');
      expect(result.url).toContain('github.com/testuser/testrepo');
      expect(result.url).toContain('#L10');
    });
  });

  describe('CodeSandbox Integration', () => {
    test('should generate CodeSandbox URL', async () => {
      const result = await externalEditors.openInCodeSandbox({
        files: {
          'index.js': { content: 'console.log("hello");' }
        },
        template: 'node'
      });

      expect(result.url).toContain('codesandbox.io');
      expect(result.editor).toBe('codesandbox');
    });
  });

  describe('StackBlitz Integration', () => {
    test('should generate StackBlitz URL', async () => {
      const result = await externalEditors.openInStackBlitz({
        files: {},
        template: 'node',
        title: 'Test Project'
      });

      expect(result.url).toContain('stackblitz.com');
      expect(result.editor).toBe('stackblitz');
    });
  });

  describe('Session Management', () => {
    test('should create session', () => {
      const sessionId = externalEditors.createSession('github', { test: true });

      expect(sessionId).toMatch(/^session_\d+_[a-z0-9]+$/);
      expect(externalEditors.sessions.has(sessionId)).toBe(true);
    });

    test('should track session details', () => {
      const sessionId = externalEditors.createSession('github', {
        owner: 'testuser',
        repo: 'testrepo'
      });

      const session = externalEditors.getSession(sessionId);

      expect(session.editor).toBe('github');
      expect(session.options.owner).toBe('testuser');
      expect(session.active).toBe(true);
    });

    test('should close session', () => {
      const sessionId = externalEditors.createSession('github', {});
      
      const closed = externalEditors.closeSession(sessionId);

      expect(closed).toBe(true);
      const session = externalEditors.getSession(sessionId);
      expect(session.active).toBe(false);
      expect(session.closedAt).toBeDefined();
    });

    test('should list active sessions only', () => {
      const id1 = externalEditors.createSession('github', {});
      const id2 = externalEditors.createSession('codespaces', {});
      externalEditors.closeSession(id1);

      const active = externalEditors.getActiveSessions();

      expect(active).toHaveLength(1);
      expect(active[0].id).toBe(id2);
    });
  });

  describe('Sync Operations', () => {
    test('should sync from GitHub', async () => {
      axios.get.mockResolvedValueOnce({
        data: 'function test() { return 42; }',
        headers: { 'x-github-request-id': 'abc123' }
      });

      const result = await externalEditors.syncFromGitHub({
        owner: 'testuser',
        repo: 'testrepo',
        filePath: 'src/test.js'
      });

      expect(result.synced).toBe(true);
      expect(result.content).toContain('function test');
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('github.com/repos'),
        expect.any(Object)
      );
    });

    test('should commit to GitHub', async () => {
      // Mock get file
      axios.get.mockResolvedValueOnce({
        data: { sha: 'old_sha' }
      });

      // Mock commit
      axios.put.mockResolvedValueOnce({
        data: {
          commit: {
            sha: 'new_sha',
            message: 'Test commit'
          },
          content: {
            html_url: 'https://github.com/testuser/testrepo/blob/main/test.js'
          }
        }
      });

      const result = await externalEditors.commitToGitHub({
        owner: 'testuser',
        repo: 'testrepo',
        branch: 'main',
        filePath: 'test.js',
        content: 'new content',
        message: 'Test commit'
      });

      expect(result.commit.sha).toBe('new_sha');
      expect(result.url).toContain('github.com');
      expect(axios.put).toHaveBeenCalled();
    });

    test('should create new branch', async () => {
      // Mock get ref
      axios.get.mockResolvedValueOnce({
        data: {
          object: { sha: 'base_sha' }
        }
      });

      // Mock create branch
      axios.post.mockResolvedValueOnce({
        data: {
          object: { sha: 'base_sha' },
          ref: 'refs/heads/feature-branch'
        }
      });

      const result = await externalEditors.createBranch({
        owner: 'testuser',
        repo: 'testrepo',
        newBranch: 'feature-branch',
        fromBranch: 'main'
      });

      expect(result.branch).toBe('feature-branch');
      expect(result.url).toContain('feature-branch');
      expect(axios.post).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    test('should handle GitHub API errors', async () => {
      axios.get.mockRejectedValueOnce(new Error('API Error'));

      await expect(
        externalEditors.syncFromGitHub({
          owner: 'testuser',
          repo: 'testrepo',
          filePath: 'test.js'
        })
      ).rejects.toThrow('GitHub sync failed');
    });

    test('should handle commit failures', async () => {
      axios.get.mockResolvedValueOnce({ data: { sha: 'old_sha' } });
      axios.put.mockRejectedValueOnce(new Error('Conflict'));

      await expect(
        externalEditors.commitToGitHub({
          owner: 'testuser',
          repo: 'testrepo',
          branch: 'main',
          filePath: 'test.js',
          content: 'content'
        })
      ).rejects.toThrow('GitHub commit failed');
    });

    test('should handle missing session', async () => {
      await expect(
        externalEditors.syncChanges('nonexistent_session')
      ).rejects.toThrow('Session not found');
    });
  });
});
