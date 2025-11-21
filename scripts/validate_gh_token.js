// Simple GitHub token validator used by CI to fail fast when GH_TOKEN lacks permissions
const https = require('https');

async function validate() {
  const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPOSITORY;
  if (!token) {
    console.error('No GH_TOKEN or GITHUB_TOKEN provided in environment.');
    process.exitCode = 2;
    return;
  }
  if (!repo) {
    console.error('GITHUB_REPOSITORY environment variable is not set.');
    process.exitCode = 3;
    return;
  }

  const options = {
    method: 'GET',
    hostname: 'api.github.com',
    path: `/repos/${repo}`,
    headers: {
      'User-Agent': 'ai-assistant-ci-validator',
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github+json'
    }
  };

  const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        console.log('GH_TOKEN validation succeeded (access to repo confirmed).');
        process.exitCode = 0;
      } else {
        console.error(`GH_TOKEN validation failed: HTTP ${res.statusCode}`);
        try { console.error(JSON.parse(data)); } catch (e) { console.error(data); }
        process.exitCode = 4;
      }
    });
  });

  req.on('error', (err) => {
    console.error('Request error during GH_TOKEN validation:', err.message);
    process.exitCode = 5;
  });

  req.end();
}

validate();
