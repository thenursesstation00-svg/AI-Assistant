// backend/src/services/personalityOrchestrator.js
// Minimal orchestrator for persona and prompt composition

let activePersonaId = 'guardian';
const personas = {
  guardian: {
    meta: { name: 'Guardian', description: 'Protective, concise.' },
    style: { formality: 0.8, verbosity: 0.3, positivity: 0.7, humor: 0.2, directness: 0.9, empathy: 0.8 },
    prompt_template: 'You are {name}, a {style} AI. Context: {context_summary}',
  },
  // Add more personas as needed
};

function getActivePersona() {
  return personas[activePersonaId];
}

function composeSystemPrompt(cfe_snapshot) {
  const p = personas[activePersonaId];
  if (!p) return 'You are a helpful assistant inside a developer workspace.';
  const style_rules = Object.entries(p.style).map(([k, v]) => `${k}=${v}`).join('; ');
  // Build context summary
  const ctx_bits = [];
  if (cfe_snapshot.active_window) ctx_bits.push(`active_window=${cfe_snapshot.active_window}`);
  if (cfe_snapshot.path) ctx_bits.push(`file=${cfe_snapshot.path}`);
  const errors = cfe_snapshot.terminal_errors || [];
  if (errors.length) ctx_bits.push(`errors=${errors.length} latest='${(errors[errors.length-1]?.message||'').slice(0,120)}'`);
  const summary = cfe_snapshot.summary || ctx_bits.join('; ');
  const template = p.prompt_template;
  return template.replace('{name}', p.meta.name)
    .replace('{style}', style_rules)
    .replace('{context_summary}', summary);
}

module.exports = { composeSystemPrompt, getActivePersona };
