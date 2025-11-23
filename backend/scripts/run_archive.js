const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const fs = require('fs');
const { searchRepos } = require('../src/services/githubCrawler');

async function run(){
  const queries = ['ai assistant','ai-assistant','anthropic','claude','chatbot'];
  const resultsRoot = path.resolve(__dirname,'../../archives_report');
  if(!fs.existsSync(resultsRoot)) fs.mkdirSync(resultsRoot, { recursive: true });

  for(const q of queries){
    console.log('Searching for:', q);
    try{
      const res = await searchRepos(q, { per_page: 3, page: 1 });
      const out = { query: q, total_count: res.total_count, items: [] };
      for(const r of res.items || []){
        out.items.push({ full_name: r.full_name, html_url: r.html_url, clone_url: r.clone_url, stargazers_count: r.stargazers_count });
      }
      fs.writeFileSync(path.join(resultsRoot, `${q.replace(/\s+/g,'_')}.json`), JSON.stringify(out, null, 2), 'utf8');
      console.log('Saved results for', q);
    }catch(e){
      console.error('Search error for', q, e.message || e);
    }
  }
  console.log('Done. Reports in', resultsRoot);
}

run().catch(e=>{ console.error(e); process.exit(1); });
