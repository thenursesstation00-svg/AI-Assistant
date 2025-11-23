// backend/src/services/fileProcessor.js
// File processing service for extracting text content from various file types

const fs = require('fs');
const path = require('path');

class FileProcessor {
  /**
   * Extract text content from uploaded file
   * @param {String} filePath - Path to uploaded file
   * @param {String} mimetype - File MIME type
   * @returns {Promise<Object>} - {text, metadata}
   */
  async extractContent(filePath, mimetype) {
    const metadata = {
      size: fs.statSync(filePath).size,
      type: mimetype,
      name: path.basename(filePath)
    };

    try {
      // Text files - direct read
      if (mimetype.startsWith('text/') || 
          ['application/json', 'application/xml', 'application/x-yaml'].includes(mimetype)) {
        const text = fs.readFileSync(filePath, 'utf8');
        return { text, metadata, extracted: true };
      }

      // For binary files, return metadata only
      // TODO: Add PDF text extraction (pdf-parse), image OCR (tesseract.js), etc.
      if (mimetype === 'application/pdf') {
        return { 
          text: '[PDF file - text extraction not yet implemented]', 
          metadata,
          extracted: false,
          note: 'PDF parsing requires pdf-parse package'
        };
      }

      if (mimetype.startsWith('image/')) {
        return { 
          text: '[Image file - OCR not yet implemented]', 
          metadata,
          extracted: false,
          note: 'Image text extraction requires tesseract.js or similar'
        };
      }

      // For other binary files
      return { 
        text: `[${mimetype} file]`, 
        metadata,
        extracted: false 
      };

    } catch (error) {
      console.error('Error extracting file content:', error);
      return { 
        text: '[Error reading file]', 
        metadata, 
        extracted: false,
        error: error.message 
      };
    }
  }

  /**
   * Generate file preview/summary
   * @param {String} text - Extracted text
   * @param {Object} metadata - File metadata
   * @returns {String} - Preview text
   */
  generatePreview(text, metadata) {
    const maxPreviewLength = 500;
    
    if (!text || text.length === 0) {
      return `[Empty ${metadata.type} file]`;
    }

    if (text.length <= maxPreviewLength) {
      return text;
    }

    return text.substring(0, maxPreviewLength) + '... (truncated)';
  }

  /**
   * Validate file for chat attachment
   * @param {Object} file - File object from multer
   * @returns {Object} - {valid, error}
   */
  validateForChat(file) {
    // Size check (100MB max for chat)
    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
      return { valid: false, error: 'File too large for chat (max 100MB)' };
    }

    // Check if file is accessible
    if (!fs.existsSync(file.path)) {
      return { valid: false, error: 'File not found' };
    }

    return { valid: true };
  }
}

module.exports = new FileProcessor();
