const express = require('express');
const path = require('path');
const fs = require('fs');
// allow using a mock implementation when running local integration checks
const { searchRepos, getReadme, getLicense } = process.env.USE_MOCK_GITHUB === '1' ? require('../services/githubCrawler.mock') : require('../services/githubCrawler');
const { cloneOrUpdateRepo } = require('../services/githubClone');
const router = express.Router();

// POST /api/admin/archive
// body: { query, per_page, page, fetch_readme, save (bool), auto_clone (bool) }
router.post('/archive', async (req, res) => {
  try {
    const { query, per_page = 5, page = 1, fetch_readme = false, save = false, auto_clone = false } = req.body;
    if(!query) return res.status(400).json({ error: 'missing_query' });
    const results = await searchRepos(query, { per_page, page });
    const items = [];
    const runTime = new Date().toISOString().replace(/[:.]/g,'-');
    const report = { query, runTime, total_count: results.total_count, items: [] };

    // persist per-repo artifacts under backend/backend_archives (use project root for consistent paths)
    const archivesRoot = path.resolve(process.cwd(), 'backend', 'backend_archives');
    // persist run reports under backend/archives_report (use project root)
    const reportsRoot = path.resolve(process.cwd(), 'backend', 'archives_report');
    if(save){
      if(!fs.existsSync(archivesRoot)) fs.mkdirSync(archivesRoot, { recursive: true });
      if(!fs.existsSync(reportsRoot)) fs.mkdirSync(reportsRoot, { recursive: true });
    }

    for(const r of results.items || []){
      const owner = r.owner.login;
      const repo = r.name;
      const license = await getLicense(owner, repo).catch(()=>null);
      const spdx = license?.license?.spdx_id || license?.license?.name || '';
      const permissive = /mit|bsd|apache/i.test(spdx) || /mit|bsd|apache/i.test(license?.license?.name || '');
      let readme = null;
      if(fetch_readme && permissive){
        readme = await getReadme(owner, repo).catch(()=>null);
      }

      const item = { full_name: r.full_name, url: r.html_url, description: r.description, stars: r.stargazers_count, license: license?.license || null, permissive, readme: fetch_readme ? (readme ? 'fetched' : null) : null };
      report.items.push(item);

      // save artifacts and optionally clone
      if(save){
        try{
          const dirName = `${owner}__${repo}`;
          const dest = path.join(archivesRoot, dirName);
          if(!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
          // always write meta (metadata independent of readme)
          const metaObj = { owner, repo, fetched_at: new Date().toISOString(), license: item.license, description: item.description, stars: item.stars };
          try{ fs.writeFileSync(path.join(dest, 'meta.json'), JSON.stringify(metaObj, null, 2), 'utf8'); }catch(e){ console.error('write meta failed', e && e.message); }
          if(fetch_readme && readme){
            try{ fs.writeFileSync(path.join(dest, 'README.md'), readme, 'utf8'); }catch(e){ console.error('write readme failed', e && e.message); }
          }
          if(auto_clone && permissive){
            // attempt clone or update
            await cloneOrUpdateRepo(r.clone_url, dest).catch(e=>{
              console.error('clone error', r.full_name, e && e.message);
            });
          }
        }catch(e){
          console.error('save artifact error', e && e.message);
        }
      }
    }

    if(save){
      try{
        const reportPath = path.join(reportsRoot, `${runTime}_${query.replace(/\s+/g,'_')}.json`);
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
      }catch(e){ console.error('write report error', e && e.message); }
    }

    res.json(report);
  } catch (err) {
    console.error('archive error', err?.message || err);
    res.status(500).json({ error: 'server_error' });
  }
});

module.exports = router;
