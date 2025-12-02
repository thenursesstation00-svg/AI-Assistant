const { exec } = require('child_process');
const util = require('util');
const providerRegistry = require('../providers/registry');
const { isCommandDangerous } = require('../../utils/commandSafety');

const execPromise = util.promisify(exec);

class TerminalAgentService {
  constructor() {
    this.shell = process.platform === 'win32' ? 'powershell.exe' : '/bin/bash';
    this.heuristics = [
      {
        pattern: /(install|setup).*(dependenc|package|node_modules)/i,
        command: 'npm ci',
        explanation: 'Install Node.js dependencies using a clean lockfile install.',
        confidence: 0.78
      },
      {
        pattern: /(run|start).*(backend|api|server)/i,
        command: 'npm --prefix backend run dev',
        explanation: 'Start the backend Express server via npm scripts.',
        confidence: 0.76
      },
      {
        pattern: /(run|start).*(frontend|vite|ui)/i,
        command: 'npm --prefix frontend run dev',
        explanation: 'Start the Vite dev server for the React frontend.',
        confidence: 0.74
      },
      {
        pattern: /(run|execute).*(test|jest|unit)/i,
        command: 'npm --prefix backend test -- --runInBand',
        explanation: 'Execute the backend Jest suite in single-threaded mode.',
        confidence: 0.82
      },
      {
        pattern: /(build).*(frontend|ui|spa)/i,
        command: 'npm --prefix frontend run build',
        explanation: 'Create a production build of the React frontend.',
        confidence: 0.75
      },
      {
        pattern: /(lint|format)/i,
        command: 'npm run lint',
        explanation: 'Lint the repository using the configured npm script.',
        confidence: 0.7
      },
      {
        pattern: /git\s+status/i,
        command: 'git status -sb',
        explanation: 'Show the concise git status for the repo.',
        confidence: 0.65
      },
      {
        pattern: /(list|show).*(files|workspace)/i,
        command: 'ls',
        explanation: 'List files in the current working directory.',
        confidence: 0.62
      }
    ];
  }

  async plan(prompt, context = {}) {
    const trimmed = (prompt || '').trim();
    if (!trimmed) {
      throw new Error('Prompt is required');
    }

    const providerPlan = await this.requestProviderPlan(trimmed, context);
    if (providerPlan) {
      return providerPlan;
    }

    return this.heuristicPlan(trimmed);
  }

  async planAndExecute(prompt, options = {}) {
    const { context = {}, autoExecute = true } = options;
    const plan = await this.plan(prompt, context);
    const execution = {
      ran: false,
      blocked: false,
      output: '',
      error: null
    };

    if (!plan.command) {
      execution.error = 'No command generated';
      return { plan, execution };
    }

    if (!autoExecute) {
      return { plan, execution };
    }

    if (isCommandDangerous(plan.command)) {
      plan.blocked = true;
      execution.blocked = true;
      execution.error = 'Command blocked by safety filter';
      return { plan, execution };
    }

    try {
      const { stdout, stderr } = await execPromise(plan.command, {
        shell: this.shell,
        timeout: 30000,
        maxBuffer: 1024 * 1024
      });
      execution.ran = true;
      execution.output = stdout || stderr || 'Command executed successfully (no output)';
    } catch (error) {
      execution.ran = true;
      execution.error = error.message;
      execution.output = error.stdout || error.stderr || 'Command failed to execute';
    }

    return { plan, execution };
  }

  async requestProviderPlan(prompt, context) {
    try {
      const { provider } = await providerRegistry.getDefaultProvider();
      if (!provider || typeof provider.sendMessage !== 'function') {
        return null;
      }

      const systemPrompt = [
        'You are an AI terminal planner. Convert user requests into a single safe shell command.',
        'Respond with compact JSON: {"command":"...","explanation":"..."}.',
        'Prefer npm scripts that already exist. Avoid destructive commands.',
        'Target Windows PowerShell or POSIX shells compatible commands.'
      ].join(' ');

      const response = await provider.sendMessage([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Context: ${JSON.stringify(context || {})}\nRequest: ${prompt}` }
      ], {
        max_tokens: 200,
        temperature: 0
      });

      const parsed = this.extractCommand(response?.content);
      if (parsed) {
        return {
          ...parsed,
          source: 'provider'
        };
      }
    } catch (error) {
      console.warn('[TerminalAgent] Provider plan unavailable:', error.message);
    }
    return null;
  }

  heuristicPlan(prompt) {
    const match = this.heuristics.find((rule) => rule.pattern.test(prompt));
    if (match) {
      return {
        command: match.command,
        explanation: match.explanation,
        confidence: match.confidence,
        source: 'heuristic'
      };
    }

    if (/^(npm|yarn|pnpm|git|node|npx|cd|ls|dir|pip|python)\b/i.test(prompt)) {
      return {
        command: prompt,
        explanation: 'Detected direct command input, passing through unchanged.',
        confidence: 0.68,
        source: 'direct'
      };
    }

    const sanitized = prompt.replace(/"/g, '\\"');
    return {
      command: `echo "${sanitized}"`,
      explanation: 'No automation pattern matched; echoing the instruction for visibility.',
      confidence: 0.35,
      source: 'fallback'
    };
  }

  extractCommand(rawContent) {
    if (!rawContent || typeof rawContent !== 'string') {
      return null;
    }

    const trimmed = rawContent.trim();
    if (!trimmed) {
      return null;
    }

    const codeBlockMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
    const candidate = codeBlockMatch ? codeBlockMatch[1].trim() : trimmed;

    const jsonCandidate = this.safeJson(candidate) || this.safeJson(trimmed);
    if (jsonCandidate && jsonCandidate.command) {
      return {
        command: jsonCandidate.command.trim(),
        explanation: (jsonCandidate.explanation || '').trim(),
        confidence: Math.min(1, Math.max(0, jsonCandidate.confidence || 0.85))
      };
    }

    const lineMatch = candidate.match(/command\s*[:=-]\s*(.+)/i);
    if (lineMatch) {
      return {
        command: lineMatch[1].trim(),
        explanation: '',
        confidence: 0.6
      };
    }

    if (candidate.split('\n').length === 1) {
      return {
        command: candidate,
        explanation: '',
        confidence: 0.55
      };
    }

    return null;
  }

  safeJson(text) {
    try {
      return JSON.parse(text);
    } catch {
      return null;
    }
  }
}

module.exports = new TerminalAgentService();
