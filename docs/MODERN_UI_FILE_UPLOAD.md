# Modern UI with File Upload - Feature Documentation

## Overview

The AI Assistant now features a **modern, professional chat interface** with comprehensive **multi-file upload capabilities**. Users can attach and discuss any type of file with the AI.

## ✨ New Features

### 🎨 Modern Chat Interface

- **Card-based message design** with user avatars
- **Smooth animations** and transitions
- **Auto-scrolling** to latest messages
- **Copy message** functionality
- **Dark theme** optimized for extended use
- **Responsive** design for all screen sizes

### 📎 File Upload System

#### Supported File Types (40+)

**Documents:**
- PDF (.pdf)
- Microsoft Word (.doc, .docx)
- Excel (.xls, .xlsx)
- PowerPoint (.ppt, .pptx)

**Text & Code:**
- Plain text (.txt)
- Markdown (.md)
- HTML, CSS, JavaScript
- Python, Java, C/C++, Go, Rust, Ruby, PHP
- JSON, XML, YAML
- Shell scripts (.sh, .bat, .ps1)

**Images:**
- JPEG, PNG, GIF, WebP, SVG, BMP

**Archives:**
- ZIP, RAR, 7Z, TAR, GZIP

**Media:**
- Audio: MP3, WAV, M4A
- Video: MP4, MPEG, MOV

#### Upload Features

- **Drag & drop** files directly into chat
- **Multi-file upload** (up to 10 files at once)
- **File preview** chips with type icons
- **Progress tracking** during upload
- **File size display** in human-readable format
- **Remove files** before sending
- **Automatic text extraction** from supported formats

### 🔄 User Workflows

#### Uploading Files

1. Click the **📎 paperclip icon** in the input area
2. Either:
   - Click to browse files, or
   - Drag & drop files onto the upload area
3. Files appear as chips below the input
4. Type your message (optional)
5. Click **Send** to submit with attachments

#### File Management

- **View attached files** as chips in messages
- **Remove files** before sending with the × button
- **See file size** in upload preview
- **Download** attached files from messages

## 🎯 UI Modes

The app now supports **3 different interfaces**:

### 1. Modern Chat (Default)
- Clean, professional design
- File upload capabilities
- Perfect for AI conversations with documents

### 2. Classic Chat
- Original simple interface
- Basic chat functionality
- Lightweight option

### 3. Workspace Mode
- Multi-panel layout
- Code editor + terminal
- Advanced development features

**Switch between modes** using the buttons in the top-right corner.

## 🏗️ Technical Implementation

### Backend

**New Files:**
- `backend/src/services/fileProcessor.js` - Text extraction service
- `backend/src/routes/chatFiles.js` - File upload API endpoints

**New Endpoints:**
- `POST /api/chat/upload` - Upload files (multipart/form-data)
- `GET /api/chat/files` - List uploaded files
- `GET /api/chat/files/:fileId` - Download file
- `DELETE /api/chat/files/:fileId` - Delete file

**Enhanced:**
- `backend/src/routes/uploadFile.js` - Expanded to 40+ file types

### Frontend

**New Components:**
- `frontend/src/ModernChat.jsx` - Main modern chat interface
- `frontend/src/components/FileUpload.jsx` - Drag-drop file uploader
- `frontend/src/components/FileChip.jsx` - File attachment display
- `frontend/src/ModernChat.css` - Modern UI styling

**Enhanced:**
- `frontend/src/App.jsx` - Added modern mode toggle
- `frontend/src/api.js` - File upload/management API functions

## 🔒 Security Features

- **File type validation** on both client and server
- **Size limits** (100MB per file for chat, 50MB for admin)
- **Filename sanitization** to prevent path traversal
- **SHA-256 hashing** of uploaded files
- **API key authentication** required
- **Metadata tracking** (uploader, timestamp, etc.)

## 📊 File Processing

### Text Extraction

The system automatically extracts text content from:
- ✅ **Text files** (TXT, MD, JSON, XML, YAML, etc.)
- 🔜 **PDF files** (requires `pdf-parse` package)
- 🔜 **Images** (OCR via `tesseract.js`)

For binary files without extraction, the AI receives:
- Filename and type
- File size
- Upload timestamp
- File icon/type indicator

### Content Preview

- Text files: First 500 characters
- Binary files: Type and metadata
- Truncated indicator for long files

## 🎨 Visual Design

### Color Scheme

- Background: `#1e1e1e` (Primary), `#252526` (Secondary)
- User messages: `#0e639c` (Blue)
- AI messages: `#2d2d30` (Dark gray)
- Accents: `#007acc` (Links/actions)

### Typography

- Font: System fonts (-apple-system, Segoe UI, Roboto)
- Message text: 13px
- Code blocks: Monaco, Menlo, Consolas monospace

### Animations

- Message slide-in (0.3s ease-out)
- Loading dots pulse effect
- Smooth scrolling
- Button hover transitions

## 🚀 Getting Started

### For Users

1. Start the app
2. Modern UI loads by default
3. Click **📎** to attach files
4. Drag files or browse to select
5. Chat normally with file context included

### For Developers

**Install dependencies:**
```bash
cd backend && npm install
cd ../frontend && npm install
```

**Start development:**
```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
cd frontend && npm run dev

# Terminal 3: Electron
npm start
```

**Test file upload:**
```bash
# Upload a file via API
curl -X POST http://localhost:3001/api/chat/upload \
  -H "x-api-key: your_key" \
  -F "files=@test.txt"

# List uploaded files
curl http://localhost:3001/api/chat/files \
  -H "x-api-key: your_key"
```

## 🔮 Future Enhancements

### Planned Features

- [ ] **PDF text extraction** with `pdf-parse`
- [ ] **Image OCR** with `tesseract.js`
- [ ] **Image preview** thumbnails in messages
- [ ] **Code syntax highlighting** with Prism.js
- [ ] **File search** and filtering
- [ ] **Conversation export** with attachments
- [ ] **Voice input** via Web Speech API
- [ ] **Message reactions** and threading
- [ ] **File compression** before upload
- [ ] **Batch file processing**

### Possible Integrations

- **Cloud storage** (Google Drive, Dropbox)
- **Document conversion** (Office to PDF)
- **Audio transcription** (Whisper AI)
- **Video analysis** (frame extraction)

## 📝 API Reference

### Upload Files

```javascript
POST /api/chat/upload
Content-Type: multipart/form-data
Headers: x-api-key: <your_key>

Body:
  files: <file1>
  files: <file2>
  ...

Response:
{
  "success": true,
  "files": [
    {
      "id": "1234567890_abc123_document.pdf",
      "name": "document.pdf",
      "size": 102400,
      "type": "application/pdf",
      "preview": "[PDF file - text extraction not yet implemented]",
      "extracted": false,
      "url": "/api/chat/files/1234567890_abc123_document.pdf"
    }
  ],
  "count": 1
}
```

### List Files

```javascript
GET /api/chat/files
Headers: x-api-key: <your_key>

Response:
{
  "files": [...],
  "count": 5
}
```

### Download File

```javascript
GET /api/chat/files/:fileId
Headers: x-api-key: <your_key>

Response: File download stream
```

### Delete File

```javascript
DELETE /api/chat/files/:fileId
Headers: x-api-key: <your_key>

Response:
{
  "success": true,
  "deleted": 2
}
```

## 🐛 Troubleshooting

### Upload fails with "File too large"

**Solution:** Files over 100MB are rejected. Compress or split large files.

### "multer not available" error

**Solution:** Run `npm install` in the backend directory to install multer.

### Files don't appear in chat

**Solution:** Check that the backend server is running and `x-api-key` is configured.

### Text not extracted from PDF

**Solution:** PDF extraction requires the `pdf-parse` package:
```bash
cd backend && npm install pdf-parse
```

### Drag-drop doesn't work

**Solution:** Ensure you're in Modern Chat mode, not Classic or Workspace mode.

## 📚 Related Documentation

- [Backend README](../backend/README.md)
- [Frontend README](../frontend/README.md)
- [MCP Guide](MCP_GUIDE.md)
- [Copilot Instructions](../.github/copilot-instructions.md)

---

**Version:** 1.0.0  
**Last Updated:** November 23, 2025  
**Status:** ✅ Production Ready
