const http = require('http');
http.get('http://localhost:3001/health', (res) => {
  console.log('status', res.statusCode);
  let body='';
  res.on('data', d=> body+=d);
  res.on('end', ()=> console.log('body', body));
}).on('error', (e) => { console.error('err', e && e.message); process.exit(1); });
