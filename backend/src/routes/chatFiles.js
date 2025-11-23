// backend/src/routes/chatFiles.js
// Enhanced file upload for chat with multi-file support and content extraction

const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const fileProcessor = require('../services/fileProcessor');

const router = express.Router();

const uploadsRoot = path.resolve(__dirname, '../../uploads');
const chatUploadsRoot = path.resolve(__dirname, '../../uploads/chat');
const metaRoot = path.resolve(__dirname, '../../uploads/meta');

// Ensure directories exist
[uploadsRoot, chatUploadsRoot, metaRoot].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

let multer, upload;

try {
  multer = require('multer');
  
  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, chatUploadsRoot),
    filename: (req, file, cb) => {
      const ts = Date.now();
      const random = crypto.randomBytes(4).toString('hex');
      const sanitized = file.originalname.replace(/[^A-Za-z0-9._-]/g, '_');
      cb(null, `${ts}_${random}_${sanitized}`);
    }
  });

  upload = multer({
    storage,
    limits: {
      fileSize: 100 * 1024 * 1024, // 100MB max
      files: 10 // Max 10 files at once
    }
  });
} catch (e) {
  console.warn('multer not available - chat file upload disabled');
  upload = {
    array: () => (req, res, next) => res.status(503).json({ error: 'upload_disabled' })
  };
}

/**
 * POST /api/chat/upload
 * Upload files for chat attachment
 * Supports multiple files
 */
router.post('/upload', upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files provided' });
    }

    const processedFiles = [];

    for (const file of req.files) {
      // Validate file
      const validation = fileProcessor.validateForChat(file);
      if (!validation.valid) {
        // Clean up uploaded file
        fs.unlinkSync(file.path);
        continue;
      }

      // Extract content
      const content = await fileProcessor.extractContent(file.path, file.mimetype);
      const preview = fileProcessor.generatePreview(content.text, content.metadata);

      // Compute hash
      const buffer = fs.readFileSync(file.path);
      const sha256 = crypto.createHash('sha256').update(buffer).digest('hex');

      // Create metadata
      const metadata = {
        id: path.basename(file.path),
        filename: file.filename,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        sha256,
        path: file.path,
        uploaded_at: new Date().toISOString(),
        uploader: req.get('x-api-key') ? 'api' : 'user',
        content: {
          extracted: content.extracted,
          preview: preview,
          note: content.note
        }
      };

      // Save metadata
      fs.writeFileSync(
        path.join(metaRoot, `${file.filename}.json`),
        JSON.stringify(metadata, null, 2),
        'utf8'
      );

      processedFiles.push({
        id: metadata.id,
        name: file.originalname,
        size: file.size,
        type: file.mimetype,
        preview: preview,
        extracted: content.extracted,
        url: `/api/chat/files/${metadata.id}`
      });
    }

    res.json({
      success: true,
      files: processedFiles,
      count: processedFiles.length
    });

  } catch (error) {
    console.error('Chat file upload error:', error);
    res.status(500).json({ error: 'Upload failed', message: error.message });
  }
});

/**
 * GET /api/chat/files/:fileId
 * Download/view uploaded file
 */
router.get('/files/:fileId', (req, res) => {
  try {
    const fileId = req.params.fileId.replace(/[^A-Za-z0-9._-]/g, '_');
    const filePath = path.join(chatUploadsRoot, fileId);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Get metadata if available
    const metaPath = path.join(metaRoot, `${fileId}.json`);
    if (fs.existsSync(metaPath)) {
      const metadata = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
      res.setHeader('Content-Disposition', `attachment; filename="${metadata.originalname}"`);
    }

    res.sendFile(filePath);
  } catch (error) {
    console.error('File download error:', error);
    res.status(500).json({ error: 'Download failed' });
  }
});

/**
 * DELETE /api/chat/files/:fileId
 * Delete uploaded file
 */
router.delete('/files/:fileId', (req, res) => {
  try {
    const fileId = req.params.fileId.replace(/[^A-Za-z0-9._-]/g, '_');
    const filePath = path.join(chatUploadsRoot, fileId);
    const metaPath = path.join(metaRoot, `${fileId}.json`);

    let deleted = 0;

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      deleted++;
    }

    if (fs.existsSync(metaPath)) {
      fs.unlinkSync(metaPath);
      deleted++;
    }

    if (deleted === 0) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.json({ success: true, deleted });
  } catch (error) {
    console.error('File deletion error:', error);
    res.status(500).json({ error: 'Deletion failed' });
  }
});

/**
 * GET /api/chat/files
 * List all uploaded chat files
 */
router.get('/files', (req, res) => {
  try {
    const files = fs.readdirSync(metaRoot)
      .filter(f => f.endsWith('.json'))
      .map(f => {
        const meta = JSON.parse(fs.readFileSync(path.join(metaRoot, f), 'utf8'));
        return {
          id: meta.id || meta.filename,
          name: meta.originalname,
          size: meta.size,
          type: meta.mimetype,
          uploaded: meta.uploaded_at,
          preview: meta.content?.preview
        };
      })
      .sort((a, b) => new Date(b.uploaded) - new Date(a.uploaded));

    res.json({ files, count: files.length });
  } catch (error) {
    console.error('File list error:', error);
    res.status(500).json({ error: 'Failed to list files' });
  }
});

module.exports = router;
