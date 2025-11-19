const { sendToAnthropic } = require('./anthropic');

async function sendToAnthropicNormalized(opts){
  try {
    const raw = await sendToAnthropic(opts);
    if(raw && raw.output_text) return raw;
    if(typeof raw === 'string') return { raw, output_text: raw };
    const output_text = raw?.output_text || raw?.text || JSON.stringify(raw || {});
    return { raw, output_text };
  } catch(e) {
    console.error('Anthropic wrapper error', e?.message || e);
    throw e;
  }
}

module.exports = { sendToAnthropic: sendToAnthropicNormalized };
