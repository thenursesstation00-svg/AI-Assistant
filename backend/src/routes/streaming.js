// backend/src/routes/streaming.js
// Server-Sent Events (SSE) streaming endpoint for real-time AI responses

const express = require('express');
const router = express.Router();
const providerRegistry = require('../services/ai/registry');

// POST /api/stream/:provider - Stream chat responses via SSE
router.post('/:provider', async (req, res) => {
  const { provider } = req.params;
  const { messages, options = {} } = req.body;

  // Validate input
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages_required' });
  }

  // Check if provider exists
  if (!providerRegistry.has(provider)) {
    return res.status(404).json({ error: 'provider_not_found' });
  }

  // Set up SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering

  // Send initial connection message
  res.write('data: {"type":"connected"}\n\n');

  try {
    const providerInstance = providerRegistry.get(provider);

    // Check if provider is configured
    if (!providerInstance.isConfigured()) {
      res.write(`data: ${JSON.stringify({ type: 'error', error: 'provider_not_configured' })}\n\n`);
      res.end();
      return;
    }

    let tokenCount = 0;
    let fullResponse = '';

    // Stream tokens
    for await (const chunk of providerInstance.streamChat(messages, options)) {
      fullResponse += chunk.content;
      tokenCount++;

      // Send token to client
      res.write(`data: ${JSON.stringify({
        type: 'token',
        content: chunk.content,
        tokenCount
      })}\n\n`);

      // Flush immediately to ensure real-time streaming
      if (res.flush) res.flush();
    }

    // Send completion message
    res.write(`data: ${JSON.stringify({
      type: 'done',
      fullResponse,
      tokenCount,
      provider
    })}\n\n`);

    res.end();

  } catch (error) {
    console.error(`Streaming error (${provider}):`, error.message);
    
    res.write(`data: ${JSON.stringify({
      type: 'error',
      error: error.message || 'streaming_failed'
    })}\n\n`);
    
    res.end();
  }
});

// GET /api/stream/test - Test SSE connection
router.get('/test', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  let counter = 0;
  const interval = setInterval(() => {
    counter++;
    res.write(`data: ${JSON.stringify({ counter, timestamp: Date.now() })}\n\n`);
    
    if (counter >= 5) {
      clearInterval(interval);
      res.write('data: {"done":true}\n\n');
      res.end();
    }
  }, 1000);

  req.on('close', () => {
    clearInterval(interval);
  });
});

module.exports = router;
