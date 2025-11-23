const express = require('express');
const { sendToAnthropic } = require('../services/anthropicWrapper');
const { validateMessages } = require('../utils/validateMessages');
const { checkTextForViolations } = require('../services/moderation');
const providerRegistry = require('../services/providers/registry');
const ConversationRepository = require('../db/repositories/conversationRepo');

const router = express.Router();
const conversationRepo = new ConversationRepository();

/**
 * POST /api/chat
 * Send a message to AI provider and get response
 * Body: {
 *   messages: Array<{role: string, content: string}>,
 *   provider?: string (default: first active provider),
 *   model?: string (optional, uses provider default),
 *   conversationId?: string (for persistence),
 *   temperature?: number,
 *   max_tokens?: number,
 *   mode?: 'assistant' | 'mirror',
 *   profile?: { name: string, communicationStyle: string },
 *   stream?: boolean (future: for streaming responses)
 * }
 */
router.post('/', async (req, res) => {
  try {
    const { 
      messages = [], 
      provider: requestedProvider,
      model,
      conversationId,
      temperature,
      max_tokens,
      mode = 'assistant', 
      profile = {},
      stream = false,
    } = req.body;
    
    validateMessages(messages);
    
    // Simple moderation: block if last user message has flagged content
    const last = messages.length ? messages[messages.length - 1] : null;
    if (last && last.role === 'user' && checkTextForViolations(last.content)) {
      return res.status(400).json({ error: 'content_violates_policy' });
    }

    // Build system prompt
    const system = mode === 'mirror' && profile.name
      ? buildMirrorSystem(profile)
      : buildAssistantSystem(profile);

    // Get provider instance
    let providerName;
    let providerInstance;
    
    if (requestedProvider) {
      // Use specified provider
      providerName = requestedProvider;
      providerInstance = await providerRegistry.getProvider(requestedProvider);
    } else {
      // Use default active provider
      const defaultProvider = await providerRegistry.getDefaultProvider();
      providerName = defaultProvider.name;
      providerInstance = defaultProvider.provider;
    }

    // Send message to provider
    const options = {
      system,
      ...(model && { model }),
      ...(temperature !== undefined && { temperature }),
      ...(max_tokens && { max_tokens }),
    };
    
    const response = await providerInstance.sendMessage(messages, options);
    
    // Save conversation to database if conversationId provided
    if (conversationId) {
      try {
        // Check if conversation exists
        const existing = conversationRepo.getConversation(conversationId);
        
        if (!existing) {
          // Create new conversation
          conversationRepo.createConversation({
            id: conversationId,
            title: messages[0]?.content?.substring(0, 100) || 'New conversation',
            provider: providerName,
            model: response.model,
          });
        }
        
        // Save user message
        conversationRepo.addMessage({
          conversation_id: conversationId,
          role: 'user',
          content: last.content,
          tokens: response.usage.prompt_tokens,
        });
        
        // Save assistant response
        conversationRepo.addMessage({
          conversation_id: conversationId,
          role: 'assistant',
          content: response.content,
          tokens: response.usage.completion_tokens,
          cost: response.cost,
        });
      } catch (dbError) {
        console.error('Failed to save conversation to database:', dbError);
        // Don't fail the request if DB save fails
      }
    }
    
    // Return response with provider metadata
    res.json({
      ...response,
      provider: providerName,
      conversationId: conversationId || null,
    });
    
  } catch (err) {
    console.error('Chat route error:', err);
    res.status(500).json({ 
      error: 'server_error', 
      details: err.message,
    });
  }
});

/**
 * POST /api/chat/legacy
 * Legacy endpoint for backward compatibility (uses Anthropic only)
 * @deprecated Use POST /api/chat with provider parameter instead
 */
router.post('/legacy', async (req, res) => {
  try {
    const { messages = [], mode = 'assistant', profile = {} } = req.body;
    validateMessages(messages);
    
    const last = messages.length ? messages[messages.length - 1] : null;
    if (last && last.role === 'user' && checkTextForViolations(last.content)) {
      return res.status(400).json({ error: 'content_violates_policy' });
    }

    const system = mode === 'mirror' && profile.name
      ? buildMirrorSystem(profile)
      : buildAssistantSystem(profile);

    const response = await sendToAnthropic({ system, messages });
    res.json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server_error', details: err.message });
  }
});

function buildMirrorSystem(profile) {
  return `You are a digital mirror of ${profile.name}. Use style: ${profile.communicationStyle || 'neutral'}.`;
}

function buildAssistantSystem(profile) {
  return `You are a helpful assistant. User profile: ${JSON.stringify(profile)}.`;
}

module.exports = router;
