const express = require('express');
const fs = require('fs');
const path = require('path');
let multer;

const router = express.Router();

const uploadsRoot = path.resolve(__dirname, '../../uploads');
const metaRoot = path.resolve(__dirname, '../../uploads/meta');
if(!fs.existsSync(uploadsRoot)) fs.mkdirSync(uploadsRoot, { recursive: true });
if(!fs.existsSync(metaRoot)) fs.mkdirSync(metaRoot, { recursive: true });

const crypto = require('crypto');
const MAX_UPLOAD = parseInt(process.env.MAX_UPLOAD_SIZE || String(50 * 1024 * 1024), 10); // default 50MB
let upload;
try{
  multer = require('multer');
  const storage = multer.diskStorage({
    destination: function (req, file, cb) { cb(null, uploadsRoot); },
    filename: function (req, file, cb) {
      const ts = Date.now();
      // sanitize originalname
      const name = file.originalname.replace(/[^A-Za-z0-9._-]/g,'_');
      cb(null, `${ts}_${name}`);
    }
  });
  upload = multer({ storage, limits: { fileSize: MAX_UPLOAD } });
}catch(e){
  console.warn('multer not installed - upload endpoints will be disabled');
  upload = { single: () => (req, res, next) => res.status(503).json({ error: 'upload_disabled', reason: 'multer_missing' }) };
}

// POST /api/admin/upload-file (multipart/form-data) field 'file'
router.post('/upload-file', upload.single('file'), (req, res) => {
  try{
    if(!req.file) return res.status(400).json({ error: 'missing_file' });
    const ufile = req.file;
    // compute sha256
    const buf = fs.readFileSync(ufile.path);
    const sha = crypto.createHash('sha256').update(buf).digest('hex');
    const meta = {
      filename: ufile.filename,
      originalname: ufile.originalname,
      mimetype: ufile.mimetype,
      size: ufile.size,
      sha256: sha,
      path: ufile.path,
      uploaded_at: new Date().toISOString(),
      uploader: req.get('x-api-key') ? 'api' : 'anonymous'
    };
    // mark scan as queued so background worker will process it (if configured)
    meta.scan = { status: 'queued' };
    fs.writeFileSync(path.join(metaRoot, `${ufile.filename}.json`), JSON.stringify(meta, null, 2), 'utf8');
    return res.json({ status: 'ok', meta });
  }catch(e){ console.error('upload-file err', e && e.message); res.status(500).json({ error: 'server_error' }); }
});
// optional antivirus scan hook: scans are queued and handled by the AV worker when `AV_SCAN_CMD` is set

// GET /api/admin/uploads - list
router.get('/uploads', (req, res) => {
  try{
    const files = fs.readdirSync(metaRoot).filter(f=>f.endsWith('.json'));
    const items = files.map(f => JSON.parse(fs.readFileSync(path.join(metaRoot,f),'utf8'))).sort((a,b)=> b.uploaded_at.localeCompare(a.uploaded_at));
    res.json({ items });
  }catch(e){ console.error('list uploads err', e && e.message); res.status(500).json({ error:'server_error' }); }
});

// GET /api/admin/uploads/:file - download
router.get('/uploads/:file', (req, res) => {
  try{
    const file = req.params.file;
    const safe = file.replace(/[^A-Za-z0-9._-]/g,'_');
    const fpath = path.join(uploadsRoot, safe);
    if(!fs.existsSync(fpath)) return res.status(404).json({ error: 'not_found' });
    res.download(fpath);
  }catch(e){ console.error('download err', e && e.message); res.status(500).json({ error:'server_error' }); }
});

module.exports = router;
