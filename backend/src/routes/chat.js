const express = require('express');
const { sendToAnthropic } = require('../services/anthropicWrapper');
const { validateMessages } = require('../utils/validateMessages');
const { checkTextForViolations } = require('../services/moderation');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { messages = [], mode = 'assistant', profile = {} } = req.body;
    validateMessages(messages);
    // Simple moderation: block if last user message has flagged content
    const last = messages.length ? messages[messages.length-1] : null;
    if(last && last.role === 'user' && checkTextForViolations(last.content)){
      return res.status(400).json({ error: 'content_violates_policy' });
    }

    const system = mode === 'mirror' && profile.name
      ? buildMirrorSystem(profile)
      : buildAssistantSystem(profile);

    const response = await sendToAnthropic({ system, messages });
    res.json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({error: 'server_error', details: err.message});
  }
});

function buildMirrorSystem(profile){
  return `You are a digital mirror of ${profile.name}. Use style: ${profile.communicationStyle || 'neutral'}.`;
}
function buildAssistantSystem(profile){
  return `You are a helpful assistant. User profile: ${JSON.stringify(profile)}.`;
}

module.exports = router;
