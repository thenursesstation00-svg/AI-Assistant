const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const storeRoot = path.resolve(__dirname, '../../data');
if(!fs.existsSync(storeRoot)) fs.mkdirSync(storeRoot, { recursive: true });

function getKey(){
  const k = process.env.CONNECTORS_SECRET_KEY;
  if(!k) throw new Error('CONNECTORS_SECRET_KEY not set');
  // key should be 32 bytes (base64 or raw); derive 32-byte key from provided secret
  return crypto.createHash('sha256').update(String(k)).digest();
}

function fileFor(id){
  return path.join(storeRoot, `connectors_${id}.enc`);
}

function save(id, obj){
  const key = getKey();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const data = Buffer.from(JSON.stringify(obj), 'utf8');
  const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
  const tag = cipher.getAuthTag();
  const out = Buffer.concat([iv, tag, encrypted]).toString('base64');
  fs.writeFileSync(fileFor(id), out, 'utf8');
}

function load(id){
  const key = getKey();
  const f = fileFor(id);
  if(!fs.existsSync(f)) return null;
  const raw = Buffer.from(fs.readFileSync(f, 'utf8'), 'base64');
  const iv = raw.slice(0,16);
  const tag = raw.slice(16,32);
  const encrypted = raw.slice(32);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return JSON.parse(decrypted.toString('utf8'));
}

module.exports = { save, load };
