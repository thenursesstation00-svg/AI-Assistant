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
    this.githubToken = process.env.GITHUB_TOKEN;
    this.vscodeServerUrl = process.env.VSCODE_SERVER_URL;
    this.activeEditors = new Map();
  }

  /**
   * Open file in GitHub
   */
  async openInGitHub(options) {
    const { owner, repo, branch = 'main', filePath } = options;

    if (!owner || !repo || !filePath) {
      throw new Error('Missing required parameters: owner, repo, filePath');
    }

    const url = `https://github.com/${owner}/${repo}/blob/${branch}/${filePath}`;
    
    // Record the external editor session
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
      throw new Error('GitHub token not configured');
    }

    try {
      // Get or create codespace
      const codespace = await this.getOrCreateCodespace(owner, repo);
      
      // Construct codespaces URL
      let url = `https://${codespace.name}.github.dev/${filePath}`;
      if (lineNumber) {
        url += `#L${lineNumber}`;
      }

      const sessionId = this.createSession('codespaces', { url, codespace, ...options });

      return {
        sessionId,
        url,
        editor: 'codespaces',
        codespace: codespace.name,
        instructions: 'Opening in GitHub Codespaces'
      };
    } catch (error) {
      throw new Error(`Codespaces error: ${error.message}`);
    }
  }

  /**
   * Get or create a GitHub Codespace
   */
  async getOrCreateCodespace(owner, repo) {
    const headers = {
      'Authorization': `Bearer ${this.githubToken}`,
      'Accept': 'application/vnd.github+json'
    };

    try {
      // List existing codespaces
      const { data: codespaces } = await axios.get(
        'https://api.github.com/user/codespaces',
        { headers }
      );

      // Find active codespace for this repo
      const existing = codespaces.codespaces.find(cs => 
        cs.repository.full_name === `${owner}/${repo}` && 
        cs.state === 'Available'
      );

      if (existing) {
        return existing;
      }

      // Create new codespace
      const { data: newCodespace } = await axios.post(
        `https://api.github.com/repos/${owner}/${repo}/codespaces`,
        {},
        { headers }
      );

      return newCodespace;
    } catch (error) {
      throw new Error(`GitHub API error: ${error.message}`);
    }
  }

  /**
   * Open file in VS Code (local or remote)
   */
  async openInVSCode(options) {
    const { filePath, lineNumber, remote } = options;

    try {
      let command;
      
      if (remote && this.vscodeServerUrl) {
        // VS Code Remote
        const url = `${this.vscodeServerUrl}?folder=${encodeURIComponent(path.dirname(filePath))}&file=${encodeURIComponent(filePath)}`;
        if (lineNumber) {
          url += `&line=${lineNumber}`;
        }
        
        const sessionId = this.createSession('vscode-remote', { url, ...options });
        
        return {
          sessionId,
          url,
          editor: 'vscode-remote',
          instructions: 'Opening in VS Code Remote'
        };
      } else {
        // Local VS Code
        command = `code`;
        if (lineNumber) {
          command += ` --goto "${filePath}:${lineNumber}"`;
        } else {
          command += ` "${filePath}"`;
        }

        await execAsync(command);
        
        const sessionId = this.createSession('vscode-local', { filePath, lineNumber });

        return {
          sessionId,
          editor: 'vscode-local',
          filePath,
          instructions: 'Opened in local VS Code'
        };
      }
    } catch (error) {
      throw new Error(`VS Code error: ${error.message}`);
    }
  }

  /**
   * Open file in system default editor
   */
  async openInSystemEditor(filePath) {
    try {
      const platform = process.platform;
      let command;

      switch (platform) {
        case 'win32':
          command = `start "" "${filePath}"`;
          break;
        case 'darwin':
          command = `open "${filePath}"`;
          break;
        case 'linux':
          command = `xdg-open "${filePath}"`;
          break;
        default:
          throw new Error(`Unsupported platform: ${platform}`);
      }

      await execAsync(command);
      const sessionId = this.createSession('system', { filePath });

      return {
        sessionId,
        editor: 'system',
        filePath,
        instructions: 'Opened in system default editor'
      };
    } catch (error) {
      throw new Error(`System editor error: ${error.message}`);
    }
  }

  /**
   * Open in web-based editor (CodeSandbox, StackBlitz, etc.)
   */
  async openInWebEditor(options) {
    const { platform = 'codesandbox', files, template } = options;

    if (platform === 'codesandbox') {
      return this.openInCodeSandbox({ files, template });
    } else if (platform === 'stackblitz') {
      return this.openInStackBlitz({ files, template });
    }

    throw new Error(`Unsupported web editor: ${platform}`);
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
    const { files, title = 'AI Assistant Project' } = options;

    const url = 'https://stackblitz.com/run';
    
    const sessionId = this.createSession('stackblitz', { url, ...options });

    return {
      sessionId,
      url,
      editor: 'stackblitz',
      instructions: 'Opening in StackBlitz',
      note: 'Use StackBlitz SDK for full integration'
    };
  }

  /**
   * Synchronize changes from external editor
   */
  async syncChanges(sessionId) {
    const session = this.activeEditors.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    switch (session.editor) {
      case 'github':
      case 'codespaces':
        return this.syncFromGitHub(session);
      case 'vscode-remote':
        return this.syncFromVSCodeRemote(session);
      default:
        return { synced: false, reason: 'Sync not supported for this editor' };
    }
  }

  /**
   * Sync changes from GitHub
   */
  async syncFromGitHub(session) {
    const { owner, repo, filePath, branch = 'main' } = session.options;

    try {
      const url = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`;
      const { data } = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${this.githubToken}`,
          'Accept': 'application/vnd.github+json'
        }
      });

      const content = Buffer.from(data.content, 'base64').toString('utf-8');
      
      // Write to local file
      const localPath = path.join(process.cwd(), filePath);
      await fs.writeFile(localPath, content, 'utf-8');

      return {
        synced: true,
        filePath: localPath,
        content,
        sha: data.sha
      };
    } catch (error) {
      return {
        synced: false,
        error: error.message
      };
    }
  }

  /**
   * Execute command in external terminal
   */
  async executeInExternalTerminal(command, options = {}) {
    const { editor = 'vscode', cwd } = options;

    if (editor === 'vscode') {
      // Use VS Code terminal API if available
      const terminalCommand = `code --command 'workbench.action.terminal.sendSequence' --args '${command}\\n'`;
      
      try {
        await execAsync(terminalCommand, { cwd });
        return {
          success: true,
          command,
          editor: 'vscode'
        };
      } catch (error) {
        return {
          success: false,
          error: error.message
        };
      }
    }

    return {
      success: false,
      error: 'Unsupported terminal editor'
    };
  }

  /**
   * Create git branch and push for PR workflow
   */
  async createBranchForEditing(options) {
    const { owner, repo, branchName, baseBranch = 'main' } = options;

    try {
      const headers = {
        'Authorization': `Bearer ${this.githubToken}`,
        'Accept': 'application/vnd.github+json'
      };

      // Get base branch ref
      const { data: baseRef } = await axios.get(
        `https://api.github.com/repos/${owner}/${repo}/git/ref/heads/${baseBranch}`,
        { headers }
      );

      // Create new branch
      await axios.post(
        `https://api.github.com/repos/${owner}/${repo}/git/refs`,
        {
          ref: `refs/heads/${branchName}`,
          sha: baseRef.object.sha
        },
        { headers }
      );

      return {
        success: true,
        branch: branchName,
        baseSha: baseRef.object.sha,
        url: `https://github.com/${owner}/${repo}/tree/${branchName}`
      };
    } catch (error) {
      throw new Error(`Branch creation failed: ${error.message}`);
    }
  }

  /**
   * Commit changes to GitHub
   */
  async commitToGitHub(options) {
    const { owner, repo, branch, filePath, content, message } = options;

    try {
      const headers = {
        'Authorization': `Bearer ${this.githubToken}`,
        'Accept': 'application/vnd.github+json'
      };

      // Get current file SHA (if exists)
      let sha;
      try {
        const { data } = await axios.get(
          `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`,
          { headers }
        );
        sha = data.sha;
      } catch (error) {
        // File doesn't exist, that's okay
      }

      // Create or update file
      const { data } = await axios.put(
        `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`,
        {
          message,
          content: Buffer.from(content).toString('base64'),
          branch,
          sha
        },
        { headers }
      );

      return {
        success: true,
        commit: data.commit,
        url: data.content.html_url
      };
    } catch (error) {
      throw new Error(`Commit failed: ${error.message}`);
    }
  }

  /**
   * Create session for tracking external editor usage
   */
  createSession(editor, options) {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.activeEditors.set(sessionId, {
      id: sessionId,
      editor,
      options,
      createdAt: new Date().toISOString(),
      lastSynced: null
    });

    return sessionId;
  }

  /**
   * Close session
   */
  closeSession(sessionId) {
    return this.activeEditors.delete(sessionId);
  }

  /**
   * Get active sessions
   */
  getActiveSessions() {
    return Array.from(this.activeEditors.values());
  }

  /**
   * Get session details
   */
  getSession(sessionId) {
    return this.activeEditors.get(sessionId);
  }
}

module.exports = new ExternalEditorBridge();
