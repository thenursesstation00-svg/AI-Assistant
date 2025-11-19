const axios = require('axios');
const fs = require('fs');
async function run(){
  try{
    const url = 'http://localhost:3001/api/admin/archive';
    const data = { query: 'ai assistant', per_page: 3, fetch_readme: true, save: true, auto_clone: false };
    const headers = { 'Content-Type': 'application/json', 'x-api-key': process.env.BACKEND_API_KEY || 'auto_generated_key_9f3b2c1a' };
    const r = await axios.post(url, data, { headers, timeout: 20000 });
    fs.writeFileSync('backend/tmp_archive_response.json', JSON.stringify(r.data, null, 2), 'utf8');
    console.log('wrote backend/tmp_archive_response.json');
  }catch(e){
    console.error('request failed', e && e.message);
    if(e && e.response && e.response.data) console.error('resp', e.response.data);
    process.exit(1);
  }
}
run();
