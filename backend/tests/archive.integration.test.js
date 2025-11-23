const request = require('supertest');
const express = require('express');
const fs = require('fs');
const path = require('path');

// Mock githubCrawler so test doesn't call external GitHub
jest.mock('../src/services/githubCrawler', () => ({
  searchRepos: jest.fn(() => Promise.resolve({ total_count: 1, items: [{ full_name: 'owner/repo', owner: { login: 'owner' }, name: 'repo', html_url: 'https://github.com/owner/repo', stargazers_count: 10, clone_url: 'https://github.com/owner/repo.git', description: 'desc' }] })),
  getReadme: jest.fn(() => Promise.resolve('# README\ncontent')),
  getLicense: jest.fn(() => Promise.resolve({ license: { key: 'mit', name: 'MIT License', spdx_id: 'MIT' } }))
}));

const adminRoutes = require('../src/routes/admin');
const reportsRoutes = require('../src/routes/reports');
const requireAPIKey = require('../src/middleware/apiKeyAuth');

describe('Archive endpoints (integration)', () => {
  const app = express();
  app.use(express.json());
  // use middleware same as server
  app.use('/api/admin', requireAPIKey, adminRoutes);
  app.use('/api/admin', requireAPIKey, reportsRoutes);

  beforeAll(()=>{
    process.env.BACKEND_API_KEY = process.env.BACKEND_API_KEY || 'auto_generated_key_9f3b2c1a';
  });

  it('saves report and artifacts when save=true', async () => {
    const res = await request(app)
      .post('/api/admin/archive')
      .set('x-api-key', process.env.BACKEND_API_KEY)
      .send({ query: 'test', per_page: 1, fetch_readme: true, save: true, auto_clone: false });
    expect(res.statusCode).toBe(200);
    // read reports directory
    const reportsDir = path.resolve(__dirname, '../backend/archives_report');
    const archivesDir = path.resolve(__dirname, '../backend/backend_archives');
    const reports = fs.existsSync(reportsDir) ? fs.readdirSync(reportsDir) : [];
    expect(reports.length).toBeGreaterThan(0);
    // check artifact
    const dirs = fs.existsSync(archivesDir) ? fs.readdirSync(archivesDir) : [];
    expect(dirs.length).toBeGreaterThan(0);
    const metaPath = path.join(archivesDir, dirs[0], 'meta.json');
    expect(fs.existsSync(metaPath)).toBe(true);
  });
});
