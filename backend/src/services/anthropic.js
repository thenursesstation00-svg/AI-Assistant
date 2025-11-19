const axios = require('axios');

const ANTHROPIC_BASE = 'https://api.anthropic.com/v1';

async function sendToAnthropic({ system, messages }) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY missing');

  const payload = {
    model: 'claude-sonnet-4-20250514',
    system,
    messages,
    max_tokens: 1200
  };

  const resp = await axios.post(`${ANTHROPIC_BASE}/messages`, payload, {
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' }
  });
  return resp.data;
}

module.exports = { sendToAnthropic };
