const axios = require('axios');
let Redis;
let redisClient = null;
try {
  Redis = require('ioredis');
  if (process.env.REDIS_URL) {
    redisClient = new Redis(process.env.REDIS_URL);
  }
} catch (e) {
  // optional dependency — if missing, fall back to in-memory cache
}

// Request queue for provider throttling
const MAX_CONCURRENT = parseInt(process.env.SEARCH_MAX_CONCURRENT || '2', 10);
const QUEUE_DELAY_MS = parseInt(process.env.SEARCH_QUEUE_DELAY_MS || '1000', 10);
let activeRequests = 0;
const requestQueue = [];

async function queuedRequest(fn) {
  return new Promise((resolve, reject) => {
    requestQueue.push({ fn, resolve, reject });
    processQueue();
  });
}

async function processQueue() {
  if (activeRequests >= MAX_CONCURRENT || requestQueue.length === 0) return;
  
  const { fn, resolve, reject } = requestQueue.shift();
  activeRequests++;
  
  try {
    const result = await fn();
    resolve(result);
  } catch (error) {
    reject(error);
  } finally {
    activeRequests--;
    setTimeout(processQueue, QUEUE_DELAY_MS);
  }
}

// Adapter for multiple search providers. Configure via env vars:
// SEARCH_PROVIDER: 'serpapi' (default), 'google', or 'brave'
// SERPAPI_KEY
// GOOGLE_CSE_KEY and GOOGLE_CSE_CX
// BRAVE_API_KEY

function getProvider(){ return process.env.SEARCH_PROVIDER || 'serpapi'; }
const LRU_TTL_MS = parseInt(process.env.SEARCH_CACHE_TTL_MS || '300000', 10); // default 5 minutes
const CACHE_MAX = parseInt(process.env.SEARCH_CACHE_MAX || '100', 10);

// Optional Redis-backed cache when REDIS_URL is provided; otherwise use in-memory cache
const cache = new Map();

function cacheGet(key){
  if (redisClient) {
    return null; // for redis we use async path — handled in searchNormalized
  }
  const entry = cache.get(key);
  if(!entry) return null;
  if(Date.now() - entry.ts > LRU_TTL_MS){ cache.delete(key); return null; }
  return entry.val;
}

function cacheSet(key, val){
  if (redisClient) {
    // handled in async Redis path
    return;
  }
  if(cache.size >= CACHE_MAX){
    const firstKey = cache.keys().next().value;
    cache.delete(firstKey);
  }
  cache.set(key, { ts: Date.now(), val });
}

async function searchSerpApi(q, opts = {}){
  const key = process.env.SERPAPI_KEY;
  if(!key) throw new Error('SERPAPI_KEY not configured');
  const params = { q, api_key: key, engine: 'google' , hl: opts.hl || 'en' };
  const resp = await axios.get('https://serpapi.com/search.json', { params });
  return resp.data;
}

async function searchGoogleCSE(q, opts = {}){
  const key = process.env.GOOGLE_CSE_KEY;
  const cx = process.env.GOOGLE_CSE_CX;
  if(!key || !cx) throw new Error('GOOGLE_CSE_KEY or GOOGLE_CSE_CX not configured');
  const params = { key, cx, q }; 
  const resp = await axios.get('https://www.googleapis.com/customsearch/v1', { params });
  return resp.data;
}

async function searchBrave(q, opts = {}){
  const key = process.env.BRAVE_API_KEY;
  if(!key) throw new Error('BRAVE_API_KEY not configured');
  
  const params = {
    q,
    count: opts.count || 10,
    offset: opts.offset || 0,
    country: opts.country || 'us',
    search_lang: opts.search_lang || 'en',
    ui_lang: opts.ui_lang || 'en-US'
  };
  
  const resp = await axios.get('https://api.search.brave.com/res/v1/web/search', {
    params,
    headers: {
      'Accept': 'application/json',
      'Accept-Encoding': 'gzip',
      'X-Subscription-Token': key
    }
  });
  
  return resp.data;
}

async function search(q, opts = {}){
  const PROVIDER = getProvider();
  if(PROVIDER === 'google'){
    return searchGoogleCSE(q, opts);
  }
  if(PROVIDER === 'brave'){
    return searchBrave(q, opts);
  }
  // default to serpapi
  return searchSerpApi(q, opts);
}

function normalizeSerpApi(data){
  // SerpApi returns organic_results array for Google engine
  const items = (data.organic_results || []).map(r => ({
    title: r.title || r.position && r.position.toString() || '',
    snippet: r.snippet || r.snippet_text || '',
    link: r.link || r.url || null,
    source: 'serpapi'
  }));
  return items;
}

function normalizeGoogleCSE(data){
  const items = (data.items || []).map(i => ({
    title: i.title || '',
    snippet: i.snippet || i.htmlSnippet || '',
    link: i.link || (i.pagemap && i.pagemap.cse_thumbnail && i.pagemap.cse_thumbnail[0] && i.pagemap.cse_thumbnail[0].src) || null,
    source: 'google_cse'
  }));
  return items;
}

async function searchNormalized(q, opts = {}){
  const PROVIDER = getProvider();
  const cacheKey = `${PROVIDER}::${q}`;

  // If Redis is configured, try to get cached value
  if (redisClient) {
    try {
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        const result = JSON.parse(cached);
        result.cached = true;
        return result;
      }
    } catch (e) {
      // Redis transient error: fall through to fetch
      console.warn('Redis get error', e && e.message);
    }
  } else {
    const cached = cacheGet(cacheKey);
    if(cached) {
      cached.cached = true;
      return cached;
    }
  }

  const raw = await queuedRequest(() => search(q, opts));
  try{
    if(PROVIDER === 'google'){
      const res = { provider: 'google', results: normalizeGoogleCSE(raw), cached: false };
      // persist to selected cache
      if (redisClient) {
        try { await redisClient.setex(cacheKey, Math.ceil(LRU_TTL_MS/1000), JSON.stringify(res)); } catch(e){}
      } else {
        cacheSet(cacheKey, res);
      }
      return res;
    }
    const res = { provider: 'serpapi', results: normalizeSerpApi(raw), cached: false };
    if (redisClient) {
      try { await redisClient.setex(cacheKey, Math.ceil(LRU_TTL_MS/1000), JSON.stringify(res)); } catch(e){}
    } else {
      cacheSet(cacheKey, res);
    }
    return res;
  }catch(e){
    return { provider: PROVIDER, results: [], cached: false };
  }
}

module.exports = { search, searchNormalized };
