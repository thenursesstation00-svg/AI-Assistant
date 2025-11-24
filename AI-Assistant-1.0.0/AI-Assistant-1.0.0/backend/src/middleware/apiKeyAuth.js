const crypto = require('crypto');

function parseKeys(){
  // support BACKEND_API_KEYS as JSON string mapping key->role, e.g. '{"key1":"admin"}'
  const raw = process.env.BACKEND_API_KEYS;
  if(!raw) return null;
  try{ return JSON.parse(raw); }catch(e){ return null; }
}

function constantTimeCompare(a, b) {
  // Prevent timing attacks by using constant-time comparison
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;
  
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  
  if (bufA.length !== bufB.length) return false;
  
  return crypto.timingSafeEqual(bufA, bufB);
}

function requireAPIKey(req, res, next){
  if (process.env.REQUIRE_API_KEY === 'false') return next();
  // first support mapping keys -> roles
  const map = parseKeys();
  const key = req.get('x-api-key');
  if(map){
    if(!key) return res.status(401).json({ error: 'Unauthorized' });
    // Use constant-time comparison for each key in map
    let matchedRole = null;
    for (const [mapKey, role] of Object.entries(map)) {
      if (constantTimeCompare(key, mapKey)) {
        matchedRole = role;
        break;
      }
    }
    if (!matchedRole) return res.status(401).json({ error: 'Unauthorized' });
    // attach role to request for downstream checks
    req.apiKeyRole = matchedRole;
    req.apiKey = key;
    return next();
  }
  // fallback to single key behavior
  const expected = process.env.BACKEND_API_KEY || process.env.MY_API_KEY;
  if(!expected) return next();
  if(!key || !constantTimeCompare(key, expected)) return res.status(401).json({ error: 'Unauthorized' });
  // legacy single-key: mark as admin by default
  req.apiKeyRole = 'admin';
  req.apiKey = key;
  return next();
}

function requireRole(role){
  return function(req, res, next){
    if(!req.apiKeyRole) return res.status(403).json({ error: 'forbidden' });
    if(req.apiKeyRole !== role) return res.status(403).json({ error: 'forbidden' });
    return next();
  };
}

module.exports = requireAPIKey;
module.exports.requireRole = requireRole;
