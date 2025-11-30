const { composeSystemPrompt, getActivePersona } = require('./personalityOrchestrator');

test('getActivePersona returns persona object', () => {
  const persona = getActivePersona();
  expect(persona).toHaveProperty('meta');
  expect(persona).toHaveProperty('style');
});

test('composeSystemPrompt returns string', () => {
  const cfe = { active_window: 'win1', path: '/foo.js', terminal_errors: [{ message: 'err' }], summary: 'test summary' };
  const prompt = composeSystemPrompt(cfe);
  expect(typeof prompt).toBe('string');
  expect(prompt).toContain('Guardian');
});
