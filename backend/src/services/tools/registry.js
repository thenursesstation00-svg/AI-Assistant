const { z } = require('zod'); // We'll need zod or similar for schema validation, or just use raw JSON schema validation if preferred. 
// Since I don't know if zod is installed, I'll check package.json first. 
// If not, I'll use a simple validator or just store the schema.
// Actually, the roadmap says "Validate tool arguments via JSON schema".
// I'll assume standard JSON schema and maybe use 'ajv' if available, or just simple validation for now.

const policyService = require('./policy');

class ToolRegistry {
  constructor() {
    this.tools = new Map();
  }

  /**
   * Register a new tool
   * @param {string} name - Tool name (e.g., 'git.commit')
   * @param {object} schema - JSON Schema for arguments
   * @param {function} handler - Async function to execute
   * @param {string} description - Tool description
   */
  register(name, schema, handler, description) {
    if (this.tools.has(name)) {
      throw new Error(`Tool ${name} is already registered`);
    }
    this.tools.set(name, { schema, handler, description });
    console.log(`[ToolRegistry] Registered tool: ${name}`);
  }

  /**
   * Get tool definition
   * @param {string} name 
   */
  get(name) {
    return this.tools.get(name);
  }

  /**
   * List all registered tools
   */
  list() {
    return Array.from(this.tools.entries()).map(([name, tool]) => ({
      name,
      description: tool.description,
      schema: tool.schema
    }));
  }

  /**
   * Execute a tool
   * @param {string} name 
   * @param {object} args 
   * @param {object} context - Execution context (user, persona, etc.)
   */
  async execute(name, args, context = {}) {
    const tool = this.tools.get(name);
    if (!tool) {
      throw new Error(`Tool ${name} not found`);
    }

    // Policy Check
    const personaId = context.personaId || 'default';
    const policyResult = await policyService.checkPolicy(personaId, name, args);

    if (!policyResult.allowed) {
      throw new Error(`Tool execution denied: ${policyResult.reason}`);
    }

    if (policyResult.requiresApproval) {
      // In a real system, this would trigger an approval workflow.
      // For now, we'll throw a specific error that the UI can catch to show a prompt.
      // Or we check if approval was provided in context.
      if (!context.approvalGranted) {
        throw new Error(`Tool execution requires approval: ${policyResult.reason}`);
      }
    }

    // TODO: Validate args against tool.schema here
    // For now, we pass through. 
    
    try {
      return await tool.handler(args, context);
    } catch (error) {
      console.error(`[ToolRegistry] Error executing ${name}:`, error);
      throw error;
    }
  }
}

module.exports = new ToolRegistry();
