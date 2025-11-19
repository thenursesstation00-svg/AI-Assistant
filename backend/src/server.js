const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
// fallback: if dotenv didn't populate needed vars (e.g., started from different cwd), parse backend/.env directly
try{
  const envPath = path.resolve(process.cwd(), 'backend', '.env');
  if(fs.existsSync(envPath)){
    const raw = fs.readFileSync(envPath, 'utf8');
    raw.split(/\r?\n/).forEach(l=>{
      const m = l.match(/^\s*([A-Za-z0-9_]+)=(.*)$/);
      if(m){
        const k = m[1];
        let v = m[2] || '';
        v = v.trim();
        if(v.startsWith('"') && v.endsWith('"')) v = v.slice(1,-1);
        if(!process.env[k]) process.env[k] = v;
      }
    });
  }
}catch(e){/* ignore */}
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const chatRoutes = require('./routes/chat');
const requireAPIKey = require('./middleware/apiKeyAuth');
const adminRoutes = require('./routes/admin');
const patchRoutes = require('./routes/patch');
const reportsRoutes = require('./routes/reports');
const uploadPatchRoutes = require('./routes/uploadPatch');
const uploadFileRoutes = require('./routes/uploadFile');
const connectorsRoutes = require('./routes/connectors');
const agentsRoutes = require('./routes/agents');
const apiKeysRoutes = require('./routes/apiKeys');
const { startAvWorker } = require('./workers/avWorker');

const app = express();
app.use(helmet());
app.use(express.json());

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173'
}));

const limiter = rateLimit({
  windowMs: (parseInt(process.env.RATE_LIMIT_WINDOW || '15')) * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100')
});
app.use(limiter);

// routes
// routes: require API key middleware before chat routes; middleware is a noop if not configured
app.use('/api/chat', requireAPIKey, chatRoutes);
// admin/archive and patch routes protected by API key as well
app.use('/api/admin', requireAPIKey, adminRoutes);
app.use('/api/patch', requireAPIKey, patchRoutes);
// public reports listing is under admin protection too
app.use('/api/admin', requireAPIKey, reportsRoutes);
// upload patch endpoint (stores pending patches or applies safely)
app.use('/api/admin', requireAPIKey, uploadPatchRoutes);
// file upload endpoints
app.use('/api/admin', requireAPIKey, uploadFileRoutes);
// connectors scaffold
app.use('/api/admin/connectors', requireAPIKey, connectorsRoutes);
// agents framework
app.use('/api/admin/agents', requireAPIKey, agentsRoutes);
// api keys management
app.use('/api/admin', requireAPIKey, apiKeysRoutes);

app.get('/health', (req, res) => res.json({status:'ok', uptime: process.uptime()}));

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Backend listening on ${port}`));

// start AV worker if enabled
try{
  startAvWorker({ metaRoot: require('path').resolve(__dirname, '../../uploads/meta'), intervalMs: parseInt(process.env.AV_SCAN_INTERVAL_MS || '15000', 10) });
}catch(e){ console.error('failed to start AV worker', e && e.message); }
