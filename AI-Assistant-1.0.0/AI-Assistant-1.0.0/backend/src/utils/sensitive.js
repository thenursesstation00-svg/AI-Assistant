const crypto = require('crypto');

function shannonEntropy(s){
  if(!s || s.length === 0) return 0;
  const freq = {};
  for(const ch of s){ freq[ch] = (freq[ch]||0) + 1; }
  let ent = 0;
  for(const k in freq){
    const p = freq[k] / s.length;
    ent -= p * Math.log2(p);
  }
  return ent;
}

function likelySecret(text){
  if(!text) return false;
  const SECRET_REGEX = /(?:api[_-]?key|secret|token|passwd|password|authorization|auth)["'`\s:=]*([A-Za-z0-9_\-\./]{8,})/i;
  if(SECRET_REGEX.test(text)) return true;
  // high entropy long strings
  const candidates = text.match(/[A-Za-z0-9_\-]{20,}/g) || [];
  for(const c of candidates){
    const e = shannonEntropy(c);
    if(e > 4.0) return true;
  }
  return false;
}

module.exports = { shannonEntropy, likelySecret };
