// backend/src.js (FINAL "Smart Response" Version)

// Load environment variables from .env file
require('dotenv').config();

function parseKeys(){
  // support BACKEND_API_KEYS as JSON string mapping key->role, e.g. '{"key1":"admin"}'
  const raw = process.env.BACKEND_API_KEYS;
  if(!raw) return null;
  try{ return JSON.parse(raw); }catch(e){ return null; }
}

function requireAPIKey(req, res, next){
  // allow explicit disabling for quick dev (string 'false' disables requirement)
  if (process.env.REQUIRE_API_KEY === 'false') return next();

  const key = req.get('x-api-key');

  // SECURITY CHECK: Prevent accidental/malicious use of provider keys (e.g., Anthropic key)
  if (key && process.env.ANTHROPIC_API_KEY && key === process.env.ANTHROPIC_API_KEY) {
    console.warn('Client attempted to use Anthropic API key as x-api-key — rejecting request.');
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Provider API keys (ANTHROPIC_API_KEY) must not be used as backend authentication. Configure a dedicated BACKEND_API_KEY and update the client to use that.'
    });
  }

  // first support mapping keys -> roles
  const map = parseKeys();
  if(map){
    if(!key || !map[key]) return res.status(401).json({ error: 'Unauthorized' });
    // attach role to request for downstream checks
    req.apiKeyRole = map[key];
    req.apiKey = key;
    return next();
  }
  // fallback to single key behavior
  const expected = process.env.BACKEND_API_KEY || process.env.MY_API_KEY;
  // If no expected key is configured, allow requests (backwards-compatible)
  if(!expected) return next();
  if(!key || key !== expected) return res.status(401).json({ error: 'Unauthorized' });
  // legacy single-key: mark as admin by default
  req.apiKeyRole = 'admin';
  req.apiKey = key;
  return next();
}

function requireRole(role){
  return function(req, res, next){
    if(!req.apiKeyRole) return res.status(403).json({ error: 'forbidden' });
    if(req.apiKeyRole !== role) return res.status(403).json({ error: 'forbidden' });
    return next();
  };
}

module.exports = requireAPIKey;
module.exports.requireRole = requireRole;

const path = require('path');
const fs = require('fs');

// --- START: AI Integration (use environment variable) ---
const Anthropic = require('@anthropic-ai/sdk');
const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
if(!anthropicApiKey){
  console.warn('Warning: ANTHROPIC_API_KEY is not set. The /api/chat/test endpoint will fail without a valid key.');
}
const anthropic = new Anthropic({ apiKey: anthropicApiKey });
// --- END: AI Integration ---

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const chatRoutes = require('./routes/chat');
// requireAPIKey is defined above in this file
const adminRoutes = require('./routes/admin');
const patchRoutes = require('./routes/patch');
const reportsRoutes = require('./routes/reports');
const uploadPatchRoutes = require('./routes/uploadPatch');
const uploadFileRoutes = require('./routes/uploadFile');
const connectorsRoutes = require('./routes/connectors');
const agentsRoutes = require('./routes/agents');
const apiKeysRoutes = require('./routes/apiKeys');
const searchRoutes = require('./routes/search');
const providersRoutes = require('./routes/providers');
const { startAvWorker } = require('./workers/avWorker');

const app = express();
app.use(helmet());
app.use(express.json());

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173'
} ));

const limiter = rateLimit({
  windowMs: (parseInt(process.env.RATE_LIMIT_WINDOW || '15')) * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100')
});
app.use(limiter);


// --- TEST ENDPOINT WITH CONVERSATION MEMORY & SMART RESPONSE HANDLING ---
app.post('/api/chat/test', async (req, res) => {
  const conversationHistory = req.body.messages;

  if (!conversationHistory || conversationHistory.length === 0) {
    return res.status(400).json({ error: 'Message history is required' });
  }

  console.log('Received conversation history, calling Anthropic API...');

  try {
    const completion = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 1024,
      messages: conversationHistory,
    });

    // --- THIS IS THE NEW, SMARTER LOGIC ---
    let aiReply = '';
    if (completion.content && completion.content[0] && typeof completion.content[0].text === 'string') {
      // This handles the standard case where the response is simple text.
      aiReply = completion.content[0].text;
    } else {
      // This is a fallback. If the AI sends a weird object, we'll stringify it
      // so we can see what it is, instead of just getting '[object Object]'.
      aiReply = "The AI sent a complex response. Here is the raw data:\n\n```json\n" + JSON.stringify(completion.content, null, 2) + "\n```";
    }
    // --- END OF NEW LOGIC ---

    console.log('Extracted AI reply:', aiReply);
    res.json({ reply: aiReply });

  } catch (error) {
    console.error("Error calling Anthropic API:", error);
    res.status(500).json({ error: "Failed to get a response from the AI." });
  }
});
// --- END: TEST ENDPOINT ---


// Your existing routes remain untouched
app.use('/api/chat', requireAPIKey, chatRoutes);
app.use('/api/providers', requireAPIKey, providersRoutes);
app.use('/api/admin', requireAPIKey, adminRoutes);
app.use('/api/patch', requireAPIKey, patchRoutes);
app.use('/api/admin', requireAPIKey, reportsRoutes);
app.use('/api/admin', requireAPIKey, uploadPatchRoutes);
app.use('/api/admin', requireAPIKey, uploadFileRoutes);
app.use('/api/admin/connectors', requireAPIKey, connectorsRoutes);
app.use('/api/admin/agents', requireAPIKey, agentsRoutes);
app.use('/api/admin', requireAPIKey, apiKeysRoutes);
app.use('/api/search', requireAPIKey, searchRoutes);

app.get('/health', (req, res) => res.json({status:'ok', uptime: process.uptime()}));

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Backend listening on ${port}`));

try{
  startAvWorker({ metaRoot: require('path').resolve(__dirname, '../../uploads/meta'), intervalMs: parseInt(process.env.AV_SCAN_INTERVAL_MS || '15000', 10) });
}catch(e){ console.error('failed to start AV worker', e && e.message); }
