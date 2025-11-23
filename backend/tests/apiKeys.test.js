const fs = require('fs');
const path = require('path');
const express = require('express');
const request = require('supertest');

describe('API Keys routes', () => {
  const keysFile = path.resolve(__dirname, '../data/api_keys.json');
  let backup = null;
  beforeAll(()=>{
    try{ backup = fs.readFileSync(keysFile,'utf8'); }catch(e){ backup = null; }
  });
  afterAll(()=>{
    try{ if(backup!==null) fs.writeFileSync(keysFile, backup, 'utf8'); else fs.unlinkSync(keysFile); }catch(e){}
  });

  test('create and list api keys via routes', async ()=>{
    process.env.BACKEND_API_KEYS = JSON.stringify({ 'testkey': 'admin' });
    // mount middleware and routes
    const requireAPIKey = require('../src/middleware/apiKeyAuth');
    const apiKeysRoutes = require('../src/routes/apiKeys');
    const app = express();
    app.use(express.json());
    app.use('/api/admin', requireAPIKey, apiKeysRoutes);

    // create key
    const res = await request(app).post('/api/admin/api-keys').set('x-api-key','testkey').send({ role: 'viewer' });
    expect(res.status).toBe(200);
    expect(res.body.item).toBeDefined();
    expect(res.body.item.role).toBe('viewer');

    // list keys
    const res2 = await request(app).get('/api/admin/api-keys').set('x-api-key','testkey');
    expect(res2.status).toBe(200);
    expect(Array.isArray(res2.body.items)).toBe(true);
    const found = (res2.body.items||[]).find(i=>i.key===res.body.item.key);
    expect(found).toBeDefined();
  });
});
