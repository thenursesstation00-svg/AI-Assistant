const axios = require('axios');

const GITHUB_API = 'https://api.github.com';

async function searchRepos(q, opts={per_page:10, page:1}){
  const token = process.env.GITHUB_TOKEN;
  if(!token) throw new Error('GITHUB_TOKEN required for authenticated search');
  const url = `${GITHUB_API}/search/repositories`;
  const params = { q, per_page: opts.per_page, page: opts.page };
  const resp = await axios.get(url, { params, headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.v3+json' } });
  return resp.data;
}

async function getReadme(owner, repo){
  const token = process.env.GITHUB_TOKEN;
  if(!token) throw new Error('GITHUB_TOKEN required');
  const url = `${GITHUB_API}/repos/${owner}/${repo}/readme`;
  const resp = await axios.get(url, { headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.v3.raw' } });
  return resp.data;
}

async function getLicense(owner, repo){
  const token = process.env.GITHUB_TOKEN;
  if(!token) throw new Error('GITHUB_TOKEN required');
  const url = `${GITHUB_API}/repos/${owner}/${repo}/license`;
  try{
    const resp = await axios.get(url, { headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.v3+json' } });
    return resp.data;
  }catch(e){
    return null;
  }
}

module.exports = { searchRepos, getReadme, getLicense };
