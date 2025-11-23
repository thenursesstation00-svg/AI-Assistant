const request = require('supertest');
const express = require('express');
const fs = require('fs');
const path = require('path');

process.env.USE_MOCK_GITHUB = '1';
process.env.BACKEND_API_KEY = process.env.BACKEND_API_KEY || 'auto_generated_key_integration';

const adminRoutes = require('../src/routes/admin');
const reportsRoutes = require('../src/routes/reports');
const requireAPIKey = require('../src/middleware/apiKeyAuth');

describe('integration_check script (wrapped as test)', () => {
  test('posts archive request and saves report/artifact', async () => {
    const app = express();
    app.use(express.json());
    app.use('/api/admin', requireAPIKey, adminRoutes);
    app.use('/api/admin', requireAPIKey, reportsRoutes);

    const res = await request(app)
      .post('/api/admin/archive')
      .set('x-api-key', process.env.BACKEND_API_KEY)
      .send({ query: 'mock test', per_page: 1, fetch_readme: true, save: true, auto_clone: false });

    expect(res.status).toBe(200);
    // check reports folder
    const reportsDir = path.resolve(__dirname, '../backend/archives_report');
    const archivesDir = path.resolve(__dirname, '../backend/backend_archives');
    const reportsExist = fs.existsSync(reportsDir) && fs.readdirSync(reportsDir).length > 0;
    const archivesExist = fs.existsSync(archivesDir) && fs.readdirSync(archivesDir).length > 0;
    // at least one of reports or archives should exist when save=true
    expect(reportsExist || archivesExist).toBeTruthy();
  }, 20000);
});
