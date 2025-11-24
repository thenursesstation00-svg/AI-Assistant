function validateMessages(messages){
  if(!Array.isArray(messages)) throw new Error('messages must be an array');
  if(messages.length > 50) throw new Error('Too many messages');
  for(const m of messages){
    if(!m || typeof m !== 'object') throw new Error('Each message must be an object');
    if(!m.role || !['user','assistant','system'].includes(m.role)) throw new Error('Invalid message role');
    if(typeof m.content !== 'string' || m.content.trim().length === 0) throw new Error('Invalid message content');
    if(m.content.length > 5000) throw new Error('Message too long');
  }
}

module.exports = { validateMessages };
