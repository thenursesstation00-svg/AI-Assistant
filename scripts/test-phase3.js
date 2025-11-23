/**
 * Phase 3 Integration Test Script
 * Tests Brave Search, Puppeteer Scraper, and Plugin functionality
 */

const http = require('http');
const https = require('https');

const BASE_URL = 'http://localhost:3001';
const API_KEY = process.env.BACKEND_API_KEY || 'test-key';

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY
      }
    };

    const req = http.request(url, options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const response = {
            status: res.statusCode,
            headers: res.headers,
            body: body ? JSON.parse(body) : null
          };
          resolve(response);
        } catch (err) {
          resolve({ status: res.statusCode, body, error: err.message });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function testHealthCheck() {
  log('\n=== Testing Health Check ===', 'cyan');
  try {
    const response = await makeRequest('/health');
    if (response.status === 200) {
      log('✅ Health check passed', 'green');
      log(`   Status: ${response.body.status}`, 'blue');
      return true;
    } else {
      log(`❌ Health check failed (${response.status})`, 'red');
      return false;
    }
  } catch (err) {
    log(`❌ Health check error: ${err.message}`, 'red');
    return false;
  }
}

async function testProviders() {
  log('\n=== Testing Providers Endpoint ===', 'cyan');
  try {
    const response = await makeRequest('/api/providers');
    if (response.status === 200) {
      log('✅ Providers endpoint working', 'green');
      log(`   Available providers: ${response.body.providers.join(', ')}`, 'blue');
      return true;
    } else {
      log(`❌ Providers endpoint failed (${response.status})`, 'red');
      return false;
    }
  } catch (err) {
    log(`❌ Providers error: ${err.message}`, 'red');
    return false;
  }
}

async function testSearchAPI() {
  log('\n=== Testing Search API ===', 'cyan');
  
  // Test SerpAPI (default)
  log('\n  Testing SerpAPI...', 'yellow');
  try {
    const response = await makeRequest('/api/search?q=artificial+intelligence&provider=serpapi');
    if (response.status === 200) {
      log('  ✅ SerpAPI search working', 'green');
      log(`     Results: ${response.body.results?.length || 0} items`, 'blue');
    } else if (response.status === 503) {
      log('  ⚠️  SerpAPI not configured (API key missing)', 'yellow');
    } else {
      log(`  ❌ SerpAPI failed (${response.status})`, 'red');
      log(`     ${response.body?.error || 'Unknown error'}`, 'red');
    }
  } catch (err) {
    log(`  ❌ SerpAPI error: ${err.message}`, 'red');
  }

  // Test Brave Search
  log('\n  Testing Brave Search...', 'yellow');
  try {
    const response = await makeRequest('/api/search?q=artificial+intelligence&provider=brave');
    if (response.status === 200) {
      log('  ✅ Brave Search working', 'green');
      log(`     Results: ${response.body.results?.length || 0} items`, 'blue');
    } else if (response.status === 503) {
      log('  ⚠️  Brave Search not configured (API key missing)', 'yellow');
    } else {
      log(`  ❌ Brave Search failed (${response.status})`, 'red');
      log(`     ${response.body?.error || 'Unknown error'}`, 'red');
    }
  } catch (err) {
    log(`  ❌ Brave Search error: ${err.message}`, 'red');
  }

  // Test Google CSE
  log('\n  Testing Google Custom Search...', 'yellow');
  try {
    const response = await makeRequest('/api/search?q=artificial+intelligence&provider=google');
    if (response.status === 200) {
      log('  ✅ Google CSE working', 'green');
      log(`     Results: ${response.body.results?.length || 0} items`, 'blue');
    } else if (response.status === 503) {
      log('  ⚠️  Google CSE not configured (API key missing)', 'yellow');
    } else {
      log(`  ❌ Google CSE failed (${response.status})`, 'red');
      log(`     ${response.body?.error || 'Unknown error'}`, 'red');
    }
  } catch (err) {
    log(`  ❌ Google CSE error: ${err.message}`, 'red');
  }
}

async function testPuppeteerScraper() {
  log('\n=== Testing Puppeteer Scraper ===', 'cyan');
  
  // Test basic scraping
  log('\n  Testing basic page scrape...', 'yellow');
  try {
    const response = await makeRequest('/api/scrape', 'POST', {
      url: 'https://example.com',
      options: {
        waitForSelector: 'body'
      }
    });
    
    if (response.status === 200) {
      log('  ✅ Basic scraping working', 'green');
      log(`     Content length: ${response.body.content?.length || 0} chars`, 'blue');
      log(`     Title: ${response.body.title || 'N/A'}`, 'blue');
    } else {
      log(`  ❌ Basic scraping failed (${response.status})`, 'red');
      log(`     ${response.body?.error || 'Unknown error'}`, 'red');
    }
  } catch (err) {
    log(`  ❌ Scraping error: ${err.message}`, 'red');
  }

  // Test link extraction
  log('\n  Testing link extraction...', 'yellow');
  try {
    const response = await makeRequest('/api/scrape', 'POST', {
      url: 'https://example.com',
      options: {
        extractLinks: true
      }
    });
    
    if (response.status === 200) {
      log('  ✅ Link extraction working', 'green');
      log(`     Links found: ${response.body.links?.length || 0}`, 'blue');
    } else {
      log(`  ❌ Link extraction failed (${response.status})`, 'red');
      log(`     ${response.body?.error || 'Unknown error'}`, 'red');
    }
  } catch (err) {
    log(`  ❌ Link extraction error: ${err.message}`, 'red');
  }

  // Test screenshot
  log('\n  Testing screenshot capture...', 'yellow');
  try {
    const response = await makeRequest('/api/scrape', 'POST', {
      url: 'https://example.com',
      options: {
        screenshot: true
      }
    });
    
    if (response.status === 200 && response.body.screenshot) {
      log('  ✅ Screenshot capture working', 'green');
      log(`     Screenshot: Base64 data (${response.body.screenshot.length} chars)`, 'blue');
    } else {
      log(`  ❌ Screenshot capture failed`, 'red');
    }
  } catch (err) {
    log(`  ❌ Screenshot error: ${err.message}`, 'red');
  }
}

async function testStreamingAPI() {
  log('\n=== Testing Streaming API ===', 'cyan');
  try {
    log('  Testing Anthropic streaming...', 'yellow');
    const response = await makeRequest('/api/stream/anthropic', 'POST', {
      messages: [
        { role: 'user', content: 'Say hello in one word' }
      ],
      options: {}
    });
    
    if (response.status === 200 || response.body) {
      log('  ✅ Streaming endpoint accessible', 'green');
    } else {
      log(`  ⚠️  Streaming may require API key configuration`, 'yellow');
    }
  } catch (err) {
    log(`  ❌ Streaming error: ${err.message}`, 'red');
  }
}

async function testCredentialsAPI() {
  log('\n=== Testing Credentials API ===', 'cyan');
  try {
    const response = await makeRequest('/api/credentials');
    if (response.status === 200) {
      log('✅ Credentials endpoint working', 'green');
      const creds = response.body.credentials || [];
      log(`   Stored credentials: ${creds.length}`, 'blue');
      creds.forEach(c => {
        log(`   - ${c.provider}: ${c.keyName}`, 'blue');
      });
    } else {
      log(`⚠️  Credentials endpoint returned ${response.status}`, 'yellow');
    }
  } catch (err) {
    log(`❌ Credentials error: ${err.message}`, 'red');
  }
}

async function runAllTests() {
  log('\n' + '='.repeat(60), 'cyan');
  log('  Phase 3 Integration Test Suite', 'cyan');
  log('='.repeat(60), 'cyan');
  
  const results = [];
  
  results.push(await testHealthCheck());
  results.push(await testProviders());
  await testSearchAPI();
  await testPuppeteerScraper();
  await testStreamingAPI();
  await testCredentialsAPI();
  
  log('\n' + '='.repeat(60), 'cyan');
  log('  Test Summary', 'cyan');
  log('='.repeat(60), 'cyan');
  
  const passed = results.filter(r => r === true).length;
  const total = results.length;
  
  log(`\n  Core Tests: ${passed}/${total} passed`, passed === total ? 'green' : 'yellow');
  
  if (passed === total) {
    log('\n✅ All core tests passed!', 'green');
    log('⚠️  Some features may require API keys (see warnings above)', 'yellow');
  } else {
    log('\n⚠️  Some core tests failed', 'yellow');
    log('   Check that the backend is running on port 3001', 'yellow');
    log('   Verify API key is set correctly', 'yellow');
  }
  
  log('\n' + '='.repeat(60), 'cyan');
}

// Run tests
runAllTests().catch(err => {
  log(`\n❌ Fatal error: ${err.message}`, 'red');
  process.exit(1);
});
