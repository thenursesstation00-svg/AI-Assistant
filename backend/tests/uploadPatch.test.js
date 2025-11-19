const express = require('express');
const request = require('supertest');
const fs = require('fs');
const path = require('path');

process.env.BACKEND_API_KEY = process.env.BACKEND_API_KEY || 'test-key-upload';
const requireAPIKey = require('../src/middleware/apiKeyAuth');
const uploadPatchRoutes = require('../src/routes/uploadPatch');

describe('upload-patch route', ()=>{
  let app;
  beforeAll(()=>{
    app = express();
    app.use(express.json());
    app.use('/api/admin', requireAPIKey, uploadPatchRoutes);
  });

  test('saves sensitive patch as pending', async ()=>{
    const payload = { patch: 'some config\npassword = supersecretapikey12345', description: 'sensitive test' };
    const res = await request(app)
      .post('/api/admin/upload-patch')
      .set('x-api-key', process.env.BACKEND_API_KEY)
      .send(payload)
      .expect(200);
    expect(res.body.status).toBe('pending');
    expect(res.body.id).toBeDefined();
    // ensure file exists on disk
    const pendingDir = path.resolve(__dirname, '../data/pending_patches');
    const files = fs.existsSync(pendingDir) ? fs.readdirSync(pendingDir) : [];
    const found = files.some(f => f.includes(res.body.id));
    expect(found).toBe(true);
  }, 10000);
});
