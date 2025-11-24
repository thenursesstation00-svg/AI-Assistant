const fs = require('fs');
const path = require('path');

describe('AV worker', () => {
  const tmpRoot = path.resolve(__dirname, '../tmp_av_test');
  const metaRoot = path.join(tmpRoot, 'meta');
  const uploadsRoot = path.join(tmpRoot, 'uploads');
  beforeAll(()=>{
    if(!fs.existsSync(tmpRoot)) fs.mkdirSync(tmpRoot, { recursive: true });
    if(!fs.existsSync(metaRoot)) fs.mkdirSync(metaRoot, { recursive: true });
    if(!fs.existsSync(uploadsRoot)) fs.mkdirSync(uploadsRoot, { recursive: true });
  });
  afterAll(()=>{
    try{ fs.rmSync(tmpRoot, { recursive: true, force: true }); }catch(e){}
  });

  test('scans queued upload and updates meta', async () => {
    // create a sample file and meta
    const fpath = path.join(uploadsRoot, 'test.txt');
    fs.writeFileSync(fpath, 'hello','utf8');
    const meta = {
      filename: 'test.txt', originalname: 'test.txt', mimetype: 'text/plain', size: 5,
      sha256: 'dummy', path: fpath, uploaded_at: new Date().toISOString(), uploader: 'test', scan: { status: 'queued' }
    };
    const metaFile = path.join(metaRoot, 'test.txt.json');
    fs.writeFileSync(metaFile, JSON.stringify(meta, null, 2), 'utf8');

    // set AV_SCAN_CMD to a simple node echo that succeeds
    process.env.AV_SCAN_CMD = 'node -e "console.log(\'ok\')"';

    const { startAvWorker } = require('../src/workers/avWorker');
    const worker = startAvWorker({ metaRoot, intervalMs: 200 });

    // wait for worker to run a few cycles
    await new Promise(r => setTimeout(r, 1200));

    const after = JSON.parse(fs.readFileSync(metaFile,'utf8'));
    expect(after.scan).toBeDefined();
    expect(['ok','failed','scanning']).toContain(after.scan.status || after.scan.status);

    worker.stop();
  }, 20000);
});
