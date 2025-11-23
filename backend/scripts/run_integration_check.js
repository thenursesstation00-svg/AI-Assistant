// Simple integration check script that uses the mock GitHub crawler
const express = require('express');
const request = require('supertest');
const fs = require('fs');
const path = require('path');

process.env.USE_MOCK_GITHUB = '1';
process.env.BACKEND_API_KEY = process.env.BACKEND_API_KEY || 'auto_generated_key_9f3b2c1a';

const adminRoutes = require('../src/routes/admin');
const reportsRoutes = require('../src/routes/reports');
const requireAPIKey = require('../src/middleware/apiKeyAuth');

async function run(){
  const app = express();
  app.use(express.json());
  app.use('/api/admin', requireAPIKey, adminRoutes);
  app.use('/api/admin', requireAPIKey, reportsRoutes);

  console.log('Posting archive request (mock)...');
  const res = await request(app)
    .post('/api/admin/archive')
    .set('x-api-key', process.env.BACKEND_API_KEY)
    .send({ query: 'mock test', per_page: 1, fetch_readme: true, save: true, auto_clone: false });

  console.log('Status:', res.statusCode);
  console.log('Body:', res.body);

  const reportsDir = path.resolve(__dirname, '../backend/archives_report');
  const archivesDir = path.resolve(__dirname, '../backend/backend_archives');

  console.log('reportsDir exists?', fs.existsSync(reportsDir));
  if(fs.existsSync(reportsDir)) console.log('reports:', fs.readdirSync(reportsDir));
  console.log('archivesDir exists?', fs.existsSync(archivesDir));
  if(fs.existsSync(archivesDir)) console.log('archives:', fs.readdirSync(archivesDir));
}

run().catch(e=>{console.error(e); process.exit(1)});
