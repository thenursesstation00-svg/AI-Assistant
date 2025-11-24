/**
 * External Editor Integration
 * 
 * Bridges to external editors: GitHub Codespaces, VS Code Remote, local editors
 * Enables seamless editing workflows across platforms
 */

const axios = require('axios');
const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);
const fs = require('fs').promises;
const path = require('path');

class ExternalEditorBridge {
  constructor() {
    this.sessions = new Map();
    this.githubToken = process.env.GITHUB_TOKEN;
    this.vscodeServerUrl = process.env.VSCODE_SERVER_URL || 'https://vscode.dev';
  }

  /**
   * Open file in GitHub Web Editor
   */
  async openInGitHub(options) {
    const { owner, repo, filePath, branch = 'main', lineNumber } = options;

    const url = lineNumber
      ? `https://github.com/${owner}/${repo}/blob/${branch}/${filePath}#L${lineNumber}`
      : `https://github.com/${owner}/${repo}/blob/${branch}/${filePath}`;

    const sessionId = this.createSession('github', { url, ...options });

    return {
      sessionId,
      url,
      editor: 'github',
      instructions: 'Opening in GitHub web editor'
    };
  }

  /**
   * Open file in GitHub Codespaces
   */
  async openInCodespaces(options) {
    const { owner, repo, filePath, lineNumber } = options;

    if (!this.githubToken) {
      throw new Error('GitHub token required for Codespaces integration');
    }

    try {
      // Check if codespace exists
      const codespaces = await this.listCodespaces(owner, repo);
      let codespace;

      if (codespaces.length > 0) {
        codespace = codespaces[0];
      } else {
        // Create new codespace
        codespace = await this.createCodespace(owner, repo);
      }

      const url = lineNumber
        ? `https://${codespace.name}.github.dev/${filePath}#L${lineNumber}`
        : `https://${codespace.name}.github.dev/${filePath}`;

      const sessionId = this.createSession('codespaces', { 
        url, 
        codespace: codespace.name,
        ...options 
      });

      return {
        sessionId,
        url,
        editor: 'codespaces',
        codespace: codespace.name,
        status: codespace.state
      };

    } catch (error) {
      throw new Error(`Codespaces integration failed: ${error.message}`);
    }
  }

  /**
   * List existing codespaces
   */
  async listCodespaces(owner, repo) {
    try {
      const response = await axios.get(
        `https://api.github.com/repos/${owner}/${repo}/codespaces`,
        {
          headers: {
            'Authorization': `token ${this.githubToken}`,
            'Accept': 'application/vnd.github+json'
          }
        }
      );

      return response.data.codespaces || [];
    } catch (error) {
      console.error('Error listing codespaces:', error.message);
      return [];
    }
  }

  /**
   * Create new codespace
   */
  async createCodespace(owner, repo, branch = 'main') {
    try {
      const response = await axios.post(
        `https://api.github.com/repos/${owner}/${repo}/codespaces`,
        {
          ref: branch,
          machine: 'basicLinux32gb'
        },
        {
          headers: {
            'Authorization': `token ${this.githubToken}`,
            'Accept': 'application/vnd.github+json'
          }
        }
      );

      return response.data;
    } catch (error) {
      throw new Error(`Failed to create codespace: ${error.message}`);
    }
  }

  /**
   * Open file in local VS Code
   */
  async openInVSCodeLocal(options) {
    const { filePath, lineNumber } = options;

    try {
      const command = lineNumber
        ? `code --goto "${filePath}:${lineNumber}"`
        : `code "${filePath}"`;

      await execAsync(command);

      const sessionId = this.createSession('vscode-local', { filePath, ...options });

      return {
        sessionId,
        editor: 'vscode-local',
        filePath,
        instructions: 'Opened in local VS Code'
      };
    } catch (error) {
      throw new Error(`VS Code local integration failed: ${error.message}`);
    }
  }

  /**
   * Open file in VS Code Remote
   */
  async openInVSCodeRemote(options) {
    const { filePath, lineNumber, remoteUrl } = options;

    const url = lineNumber
      ? `${this.vscodeServerUrl}/${remoteUrl}/${filePath}#L${lineNumber}`
      : `${this.vscodeServerUrl}/${remoteUrl}/${filePath}`;

    const sessionId = this.createSession('vscode-remote', { url, ...options });

    return {
      sessionId,
      url,
      editor: 'vscode-remote',
      instructions: 'Opening in VS Code web'
    };
  }

  /**
   * Open in CodeSandbox
   */
  async openInCodeSandbox(options) {
    const { files, template = 'node' } = options;

    // CodeSandbox API parameters
    const sandboxData = {
      files,
      template
    };

    const url = `https://codesandbox.io/api/v1/sandboxes/define?parameters=${
      Buffer.from(JSON.stringify(sandboxData)).toString('base64')
    }`;

    const sessionId = this.createSession('codesandbox', { url, ...options });

    return {
      sessionId,
      url,
      editor: 'codesandbox',
      instructions: 'Opening in CodeSandbox'
    };
  }

  /**
   * Open in StackBlitz
   */
  async openInStackBlitz(options) {
    const { files, template = 'node', title = 'AI Assistant Project' } = options;

    const url = `https://stackblitz.com/edit/${template}?title=${encodeURIComponent(title)}`;

    const sessionId = this.createSession('stackblitz', { url, ...options });

    return {
      sessionId,
      url,
      editor: 'stackblitz',
      instructions: 'Opening in StackBlitz',
      note: 'Upload files manually after opening'
    };
  }

  /**
   * Sync changes from external editor
   */
  async syncChanges(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const { editor, options } = session;

    switch (editor) {
      case 'codespaces':
      case 'github':
        return await this.syncFromGitHub(options);

      case 'vscode-local':
        return await this.syncFromLocal(options);

      default:
        throw new Error(`Sync not supported for ${editor}`);
    }
  }

  /**
   * Sync from GitHub
   */
  async syncFromGitHub(options) {
    const { owner, repo, filePath, branch = 'main' } = options;

    try {
      const response = await axios.get(
        `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`,
        {
          headers: {
            'Authorization': `token ${this.githubToken}`,
            'Accept': 'application/vnd.github.v3.raw'
          }
        }
      );

      // Write to local file
      const localPath = path.join(process.cwd(), filePath);
      await fs.mkdir(path.dirname(localPath), { recursive: true });
      await fs.writeFile(localPath, response.data, 'utf-8');

      return {
        synced: true,
        filePath: localPath,
        content: response.data,
        sha: response.headers['x-github-request-id']
      };
    } catch (error) {
      throw new Error(`GitHub sync failed: ${error.message}`);
    }
  }

  /**
   * Sync from local file
   */
  async syncFromLocal(options) {
    const { filePath } = options;

    try {
      const content = await fs.readFile(filePath, 'utf-8');

      return {
        synced: true,
        filePath,
        content
      };
    } catch (error) {
      throw new Error(`Local sync failed: ${error.message}`);
    }
  }

  /**
   * Commit changes to GitHub
   */
  async commitToGitHub(options) {
    const { owner, repo, branch, filePath, content, message } = options;

    if (!this.githubToken) {
      throw new Error('GitHub token required');
    }

    try {
      // Get current file SHA
      let sha;
      try {
        const fileResponse = await axios.get(
          `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`,
          {
            headers: {
              'Authorization': `token ${this.githubToken}`,
              'Accept': 'application/vnd.github+json'
            }
          }
        );
        sha = fileResponse.data.sha;
      } catch (error) {
        // File doesn't exist, that's okay
      }

      // Commit changes
      const response = await axios.put(
        `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`,
        {
          message: message || 'AI-suggested improvements',
          content: Buffer.from(content).toString('base64'),
          branch,
          sha
        },
        {
          headers: {
            'Authorization': `token ${this.githubToken}`,
            'Accept': 'application/vnd.github+json'
          }
        }
      );

      return {
        commit: {
          sha: response.data.commit.sha,
          message: response.data.commit.message
        },
        url: response.data.content.html_url
      };
    } catch (error) {
      throw new Error(`GitHub commit failed: ${error.message}`);
    }
  }

  /**
   * Create a new branch on GitHub
   */
  async createBranch(options) {
    const { owner, repo, newBranch, fromBranch = 'main' } = options;

    if (!this.githubToken) {
      throw new Error('GitHub token required');
    }

    try {
      // Get reference SHA
      const refResponse = await axios.get(
        `https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${fromBranch}`,
        {
          headers: {
            'Authorization': `token ${this.githubToken}`,
            'Accept': 'application/vnd.github+json'
          }
        }
      );

      const sha = refResponse.data.object.sha;

      // Create new branch
      const branchResponse = await axios.post(
        `https://api.github.com/repos/${owner}/${repo}/git/refs`,
        {
          ref: `refs/heads/${newBranch}`,
          sha
        },
        {
          headers: {
            'Authorization': `token ${this.githubToken}`,
            'Accept': 'application/vnd.github+json'
          }
        }
      );

      return {
        branch: newBranch,
        sha: branchResponse.data.object.sha,
        url: `https://github.com/${owner}/${repo}/tree/${newBranch}`
      };
    } catch (error) {
      throw new Error(`Branch creation failed: ${error.message}`);
    }
  }

  /**
   * Execute terminal command in external editor
   */
  async executeTerminal(options) {
    const { command, cwd } = options;

    try {
      const result = await execAsync(command, { cwd });

      return {
        success: true,
        stdout: result.stdout,
        stderr: result.stderr
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        stdout: error.stdout,
        stderr: error.stderr
      };
    }
  }

  /**
   * Create session
   */
  createSession(editor, options) {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.sessions.set(sessionId, {
      id: sessionId,
      editor,
      options,
      createdAt: new Date().toISOString(),
      active: true
    });

    return sessionId;
  }

  /**
   * Close session
   */
  closeSession(sessionId) {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.active = false;
      session.closedAt = new Date().toISOString();
    }
    return session !== undefined;
  }

  /**
   * Get active sessions
   */
  getActiveSessions() {
    return Array.from(this.sessions.values()).filter(s => s.active);
  }

  /**
   * Get session details
   */
  getSession(sessionId) {
    return this.sessions.get(sessionId);
  }
}

module.exports = new ExternalEditorBridge();
