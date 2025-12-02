const { getDatabase } = require('../../database/db');

class PolicyService {
  constructor() {
    this.cache = new Map(); // Simple cache for policies
  }

  /**
   * Check if a persona is allowed to use a tool
   * @param {string} personaId 
   * @param {string} toolName 
   * @param {object} args 
   * @returns {Promise<{allowed: boolean, reason: string, requiresApproval: boolean}>}
   */
  async checkPolicy(personaId, toolName, args) {
    const db = getDatabase();
    
    // Default policy: Deny if no rule matches
    let result = { allowed: false, reason: 'No matching policy found', requiresApproval: false };

    // Fetch policies for this persona
    // We order by specificity (length of pattern) descending, so specific rules override general ones
    const policies = db.prepare(`
      SELECT tool_pattern, policy 
      FROM persona_policies 
      WHERE persona_id = ? 
      ORDER BY length(tool_pattern) DESC
    `).all(personaId);

    // If no policies found for persona, check 'default' persona
    if (policies.length === 0) {
      const defaultPolicies = db.prepare(`
        SELECT tool_pattern, policy 
        FROM persona_policies 
        WHERE persona_id = 'default' 
        ORDER BY length(tool_pattern) DESC
      `).all();
      policies.push(...defaultPolicies);
    }

    for (const rule of policies) {
      if (this.matches(toolName, rule.tool_pattern)) {
        if (rule.policy === 'allow') {
          return { allowed: true, reason: `Allowed by policy: ${rule.tool_pattern}`, requiresApproval: false };
        } else if (rule.policy === 'deny') {
          return { allowed: false, reason: `Denied by policy: ${rule.tool_pattern}`, requiresApproval: false };
        } else if (rule.policy === 'ask') {
          return { allowed: true, reason: `Approval required by policy: ${rule.tool_pattern}`, requiresApproval: true };
        }
      }
    }

    // Fallback for system tools if no policy exists
    if (toolName.startsWith('system.')) {
      return { allowed: true, reason: 'System tools allowed by default', requiresApproval: false };
    }

    return result;
  }

  /**
   * Check if tool name matches pattern
   * @param {string} toolName 
   * @param {string} pattern 
   */
  matches(toolName, pattern) {
    if (pattern === '*') return true;
    if (pattern.endsWith('*')) {
      const prefix = pattern.slice(0, -1);
      return toolName.startsWith(prefix);
    }
    return toolName === pattern;
  }

  /**
   * Add a policy rule
   * @param {string} personaId 
   * @param {string} toolPattern 
   * @param {string} policy 'allow' | 'deny' | 'ask'
   */
  addPolicy(personaId, toolPattern, policy) {
    const db = getDatabase();
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO persona_policies (persona_id, tool_pattern, policy, updated_at)
      VALUES (?, ?, ?, datetime('now'))
    `);
    stmt.run(personaId, toolPattern, policy);
  }
}

module.exports = new PolicyService();
