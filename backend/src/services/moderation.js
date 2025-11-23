// Very simple moderation placeholder — replace with real provider for production
const banned = [/\bmalware\b/i, /\bkill\b/i, /\bterrorist\b/i];

function checkTextForViolations(text){
  if(typeof text !== 'string') return false;
  for(const r of banned){
    if(r.test(text)) return true;
  }
  return false;
}

module.exports = { checkTextForViolations };
