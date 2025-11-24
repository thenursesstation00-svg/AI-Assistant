const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Connector scaffolds are disabled by default. They provide endpoints for OAuth setup and status.
// GET /api/admin/connectors - list available connectors and whether enabled
router.get('/', (req, res) => {
  const connectors = [
    { id: 'gmail', name: 'Gmail', enabled: !!process.env.GMAIL_CLIENT_ID },
    { id: 'google_calendar', name: 'Google Calendar', enabled: !!process.env.GCAL_CLIENT_ID }
  ];
  res.json({ connectors });
});

// OAuth start endpoints return the authorization URL you should open to get a code.
// These are helpers: they don't persist secrets and require manual .env configuration.
router.get('/:id/oauth/start', (req, res) => {
  const id = req.params.id;
  if(id === 'gmail'){
    if(!process.env.GMAIL_CLIENT_ID) return res.status(400).json({ error: 'not_enabled', message: 'Set GMAIL_CLIENT_ID & GMAIL_CLIENT_SECRET in backend/.env' });
    const redirect = process.env.GMAIL_REDIRECT_URI || 'urn:ietf:wg:oauth:2.0:oob';
    const scope = encodeURIComponent('https://www.googleapis.com/auth/gmail.readonly');
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GMAIL_CLIENT_ID}&response_type=code&scope=${scope}&redirect_uri=${encodeURIComponent(redirect)}`;
    return res.json({ url, redirect });
  }
  if(id === 'google_calendar'){
    if(!process.env.GCAL_CLIENT_ID) return res.status(400).json({ error: 'not_enabled', message: 'Set GCAL_CLIENT_ID & GCAL_CLIENT_SECRET in backend/.env' });
    const redirect = process.env.GCAL_REDIRECT_URI || 'urn:ietf:wg:oauth:2.0:oob';
    const scope = encodeURIComponent('https://www.googleapis.com/auth/calendar.readonly');
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GCAL_CLIENT_ID}&response_type=code&scope=${scope}&redirect_uri=${encodeURIComponent(redirect)}`;
    return res.json({ url, redirect });
  }
  res.status(404).json({ error: 'unknown_connector' });
});

// OAuth callback helper: exchange code for tokens (requires client secret in .env). This returns instructions
// and does NOT persist tokens automatically. You should copy tokens to a secure secrets store.
router.post('/:id/oauth/callback', async (req, res) => {
  const id = req.params.id;
  const code = req.body.code;
  if(!code) return res.status(400).json({ error: 'missing_code' });
  try{
      if(id === 'gmail'){
        if(!process.env.GMAIL_CLIENT_ID || !process.env.GMAIL_CLIENT_SECRET) return res.status(400).json({ error: 'not_enabled' });
        // exchange code
        const params = new URLSearchParams();
        params.append('code', code);
        params.append('client_id', process.env.GMAIL_CLIENT_ID);
        params.append('client_secret', process.env.GMAIL_CLIENT_SECRET);
        params.append('redirect_uri', process.env.GMAIL_REDIRECT_URI || 'urn:ietf:wg:oauth:2.0:oob');
        params.append('grant_type', 'authorization_code');
        const fetch = require('node-fetch');
        const tokenRes = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', body: params });
        const tokenBody = await tokenRes.json();
        // persist tokens securely if CONNECTORS_SECRET_KEY provided
        try{
          if(process.env.CONNECTORS_SECRET_KEY){
            const store = require('../utils/secretStore');
            store.save('gmail', tokenBody);
            return res.json({ tokenBody, note: 'Tokens encrypted and saved locally (connectors store).' });
          }
        }catch(e){ console.error('token save failed', e && e.message); }
        return res.json({ tokenBody, note: 'Store tokens securely. This endpoint does not persist them unless CONNECTORS_SECRET_KEY is set.' });
      }
    if(id === 'google_calendar'){
      if(!process.env.GCAL_CLIENT_ID || !process.env.GCAL_CLIENT_SECRET) return res.status(400).json({ error: 'not_enabled' });
      const params = new URLSearchParams();
      params.append('code', code);
      params.append('client_id', process.env.GCAL_CLIENT_ID);
      params.append('client_secret', process.env.GCAL_CLIENT_SECRET);
      params.append('redirect_uri', process.env.GCAL_REDIRECT_URI || 'urn:ietf:wg:oauth:2.0:oob');
      params.append('grant_type', 'authorization_code');
      const fetch = require('node-fetch');
      const tokenRes = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', body: params });
      const tokenBody = await tokenRes.json();
      try{
        if(process.env.CONNECTORS_SECRET_KEY){
          const store = require('../utils/secretStore');
          store.save('google_calendar', tokenBody);
          return res.json({ tokenBody, note: 'Tokens encrypted and saved locally (connectors store).' });
        }
      }catch(e){ console.error('token save failed', e && e.message); }
      return res.json({ tokenBody, note: 'Store tokens securely. This endpoint does not persist them unless CONNECTORS_SECRET_KEY is set.' });
    }
    res.status(404).json({ error: 'unknown_connector' });
  }catch(e){ console.error('oauth callback err', e && e.message); res.status(500).json({ error: 'server_error' }); }
});

module.exports = router;
