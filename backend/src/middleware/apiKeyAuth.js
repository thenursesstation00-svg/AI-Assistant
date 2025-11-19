function parseKeys(){
  // support BACKEND_API_KEYS as JSON string mapping key->role, e.g. '{"key1":"admin"}'
  const raw = process.env.BACKEND_API_KEYS;
  if(!raw) return null;
  try{ return JSON.parse(raw); }catch(e){ return null; }
}

function requireAPIKey(req, res, next){
  if (process.env.REQUIRE_API_KEY === 'false') return next();
  // first support mapping keys -> roles
  const map = parseKeys();
  const key = req.get('x-api-key');
  if(map){
    if(!key || !map[key]) return res.status(401).json({ error: 'Unauthorized' });
    // attach role to request for downstream checks
    req.apiKeyRole = map[key];
    req.apiKey = key;
    return next();
  }
  // fallback to single key behavior
  const expected = process.env.BACKEND_API_KEY || process.env.MY_API_KEY;
  if(!expected) return next();
  if(!key || key !== expected) return res.status(401).json({ error: 'Unauthorized' });
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
