# 🚀 Quick Start - Modern UI with File Upload

## What's New?

Your AI Assistant now has a **modern, professional interface** with **drag & drop file upload** support for 40+ file types!

## ✨ Features

- 📎 **Upload any file type** - Documents, images, code, archives, media
- 🎨 **Beautiful modern UI** - Card-based messages with smooth animations
- 🖱️ **Drag & drop** - Just drag files into the chat
- 📦 **Multi-file support** - Upload up to 10 files at once
- 🔍 **Auto text extraction** - From text files, JSON, code, etc.
- 💬 **Discuss files with AI** - Attach context for better responses

## 🎯 How to Use

### Upload Files

1. Click the **📎 paperclip icon** in the message input
2. **Drag & drop files** OR click to browse
3. See files as chips below the input
4. Type your message (optional)
5. Hit **Send** 📤

### Supported Files

✅ **Documents:** PDF, Word, Excel, PowerPoint  
✅ **Code:** JS, Python, Java, C++, Go, Rust, and 20+ more  
✅ **Images:** JPG, PNG, GIF, WebP, SVG, BMP  
✅ **Archives:** ZIP, RAR, 7Z, TAR  
✅ **Media:** MP3, WAV, MP4  
✅ **Text:** TXT, MD, JSON, XML, YAML

### UI Modes

Switch between 3 different interfaces:

- **✨ Modern** (Default) - Beautiful UI with file upload
- **📊 Classic** - Simple chat interface
- **🔲 Workspace** - Multi-panel with editor & terminal

Toggle using buttons in the top-right corner!

## 🔧 Quick Setup

### Development

```bash
# Terminal 1: Backend
cd backend
npm install
npm run dev

# Terminal 2: Frontend  
cd frontend
npm install
npm run dev

# Terminal 3: Electron
npm start
```

### Environment

Create `backend/.env`:
```env
ANTHROPIC_API_KEY=your_key
BACKEND_API_KEY=your_backend_key
REQUIRE_API_KEY=false  # For local dev
```

## 📚 Documentation

- **Full Guide:** `docs/MODERN_UI_FILE_UPLOAD.md`
- **Backend:** `backend/README.md`
- **Frontend:** `frontend/README.md`

## 🎨 Screenshots

**Modern Chat Interface:**
- Dark theme optimized for extended use
- User messages on right (blue)
- AI responses on left (gray)
- File chips show attached files
- Smooth animations and transitions

**File Upload:**
- Drag & drop area appears on click
- Progress bar during upload
- File type icons (📄 PDF, 🖼️ Image, etc.)
- File size display
- Remove files before sending

## 💡 Tips

- **Press Shift+Enter** for new line (Enter sends message)
- **Copy messages** with the 📋 Copy button
- **Remove files** with the × button on chips
- **Upload multiple files** in one message
- **Mix text and files** for context-rich conversations

## 🐛 Troubleshooting

**Files won't upload?**
- Check backend is running on port 3001
- Verify API key is configured
- Check browser console for errors

**Upload too slow?**
- Files over 100MB are rejected
- Compress large files before uploading
- Check network connection

**Can't see Modern UI?**
- Click "✨ Modern" button in top-right
- Refresh the page
- Check console for errors

## 🚀 Next Steps

1. **Try uploading** a document and asking questions about it
2. **Attach code files** and request explanations or improvements
3. **Upload images** and discuss them (OCR coming soon!)
4. **Mix files with questions** for context-aware AI responses

---

**Enjoy your enhanced AI Assistant! 🎉**
