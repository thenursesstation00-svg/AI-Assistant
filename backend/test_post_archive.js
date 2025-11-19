const http = require('http');
const data = JSON.stringify({ query: 'ai assistant', per_page: 2, fetch_readme: true, save: true, auto_clone: false });
const opts = { hostname: 'localhost', port: 3001, path: '/api/admin/archive', method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data), 'x-api-key': 'auto_generated_key_9f3b2c1a' } };
const req = http.request(opts, res => { console.log('status', res.statusCode); let body=''; res.on('data', d=> body+=d); res.on('end', ()=> console.log('body', body)); });
req.on('error', e => console.error('err', e && e.message)); req.write(data); req.end();
