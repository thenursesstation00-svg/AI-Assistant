# Phase 4 Workspace Testing Guide

**Build Status:** ✅ Complete  
**Build Time:** $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")  
**Installer:** `release\AI Assistant Setup 1.0.0.exe` (76.98 MB)  
**Unpacked:** `release\win-unpacked\AI Assistant.exe`

---

## Pre-Test Setup

### Backend Server
✅ **Running on port 3001**
```
Backend listening on port 3001
Access via: http://127.0.0.1:3001 or http://localhost:3001
```

### App Launch
The Electron app has been launched from:
```
release\win-unpacked\AI Assistant.exe
```

---

## Testing Checklist

### 1. Initial App Launch
- [ ] App window opens without errors
- [ ] Classic chat UI loads (default view)
- [ ] Initial AI message appears
- [ ] Input box and Send button are functional

### 2. Switching to Workspace Mode
- [ ] Click **🔲 Workspace** button in top-right
- [ ] Workspace UI loads with 3 panels visible:
  - Chat panel (left half)
  - Editor panel (top-right)
  - Terminal panel (bottom-right)
- [ ] No console errors during transition
- [ ] Panels render correctly with dark theme

### 3. Chat Panel Testing
- [ ] **Provider Selector:**
  - Dropdown shows available providers (Anthropic, OpenAI, Gemini)
  - Model selection updates when provider changes
  - Default provider is pre-selected

- [ ] **Streaming Chat:**
  - Streaming checkbox is visible and toggleable
  - Type a message and send
  - Response appears with typewriter effect (if streaming enabled)
  - Blinking cursor appears during streaming
  - Messages render with Markdown formatting

- [ ] **Command Execution:**
  - Type `/echo Hello World` and press Enter
  - Terminal command executes on backend
  - Output displays in chat with code block formatting
  - Success (✅) or error (❌) icon shows

- [ ] **Message History:**
  - Previous messages remain visible
  - Scroll works correctly
  - Auto-scrolls to latest message

### 4. Editor Panel Testing
- [ ] **Monaco Editor:**
  - Editor loads with default code/empty state
  - Dark theme (vs-dark) is applied
  - Editor is responsive to typing

- [ ] **Language Selection:**
  - Language dropdown shows all 13 languages:
    - JavaScript, TypeScript, Python, Java, C#
    - C++, Go, Rust, HTML, CSS
    - JSON, Markdown, SQL
  - Selecting a language updates syntax highlighting
  - Language-specific features work (autocomplete, etc.)

- [ ] **Format Button:**
  - Type some unformatted code (e.g., `function test(){console.log("hi")}`)
  - Click **Format** button
  - Code auto-formats correctly
  - No errors in console

- [ ] **Copy Button:**
  - Write some code in editor
  - Click **Copy** button
  - Code copies to clipboard
  - Paste in another app to verify

- [ ] **Status Bar:**
  - Line count shows correctly (e.g., "Line 1")
  - Character count shows correctly (e.g., "50 characters")
  - Updates in real-time as you type

### 5. Terminal Panel Testing
- [ ] **Terminal Initialization:**
  - Terminal loads with welcome message:
    ```
    AI Assistant Terminal
    Type commands to execute on the backend server.
    ```
  - Prompt appears: `❯ `
  - Cursor is blinking and ready for input

- [ ] **Command Execution:**
  - Type `dir` (Windows) or `ls` (if backend supports)
  - Press Enter
  - Command executes on backend
  - Output appears in terminal
  - New prompt appears after output

- [ ] **Command History:**
  - Type and execute several commands
  - Press ↑ (Up Arrow)
  - Previous command appears
  - Press ↓ (Down Arrow)
  - Next command appears
  - Navigate through full history

- [ ] **Clear Terminal:**
  - Click **Clear** button
  - Terminal clears all output
  - Welcome message and prompt reappear

- [ ] **ANSI Colors:**
  - Execute a command that outputs colors (if available)
  - Verify colors render correctly
  - Error messages show in red

### 6. Panel Layout Testing
- [ ] **Drag Panels:**
  - Click and hold chat panel header
  - Drag to different position
  - Panel moves to new location
  - Other panels adjust automatically
  - Repeat for editor and terminal panels

- [ ] **Resize Panels:**
  - Hover over panel edge/corner until resize cursor appears
  - Click and drag to resize
  - Panel resizes smoothly
  - Content adjusts to new size (editor reflows, terminal refits)
  - Minimum sizes are respected

- [ ] **Toggle Panel Visibility:**
  - Click **chat** button in toolbar
  - Chat panel disappears
  - Other panels expand to fill space
  - Click **chat** again → panel reappears
  - Repeat for editor and terminal buttons

- [ ] **Reset Layout:**
  - Drag/resize panels to custom layout
  - Click **Reset Layout** button
  - Panels return to default positions:
    - Chat: left half (x:0, y:0, w:6, h:12)
    - Editor: top-right (x:6, y:0, w:6, h:6)
    - Terminal: bottom-right (x:6, y:6, w:6, h:6)

### 7. Layout Persistence Testing
- [ ] **Save Layout:**
  - Customize panel layout (drag/resize)
  - Close the Electron app completely
  - Reopen the app
  - Click **🔲 Workspace** button
  - **Expected:** Custom layout is restored
  - **Verify:** Panels are in same positions as before closing

- [ ] **Database Storage:**
  - Open `backend\data\assistant.db` with SQLite browser
  - Check `layout_configs` table
  - **Expected:** Entry exists with:
    - `user_id`: "default_user"
    - `layout_data`: JSON with lg/md/sm layouts
    - `updated_at`: Recent timestamp

### 8. Responsive Breakpoints Testing
- [ ] **Large Breakpoint (≥1200px):**
  - Resize app window to >1200px width
  - Verify 12-column grid layout
  - Panels should be side-by-side

- [ ] **Medium Breakpoint (996-1199px):**
  - Resize app window to ~1000px width
  - Verify 8-column grid layout
  - Panels should stack 2x1

- [ ] **Small Breakpoint (768-995px):**
  - Resize app window to ~800px width
  - Verify 6-column grid layout
  - All panels should stack vertically

### 9. Switching Back to Classic Mode
- [ ] Click **◀ Classic** button in toolbar
- [ ] Returns to original chat UI
- [ ] All messages from chat panel are still visible
- [ ] Input box is functional
- [ ] No errors in console

- [ ] Click **🔲 Workspace** again
- [ ] Returns to workspace mode
- [ ] Layout is still customized (if saved)
- [ ] All panels load correctly

### 10. Credentials Manager Integration
- [ ] Click **🔑 Credentials** button (in both modes)
- [ ] Credentials modal opens
- [ ] Add/edit/delete credentials
- [ ] Test connection button works
- [ ] Close modal
- [ ] Credentials persist across mode switches

### 11. Multi-Provider Chat Testing
- [ ] In workspace chat panel, select **Anthropic**
- [ ] Send a message
- [ ] Verify response from Claude

- [ ] Switch to **OpenAI**
- [ ] Send a message
- [ ] Verify response from GPT

- [ ] Switch to **Google Gemini** (if configured)
- [ ] Send a message
- [ ] Verify response from Gemini

### 12. Editor + Chat Integration (Future)
**Note:** This is a future enhancement, not yet implemented.
- [ ] Write code in editor
- [ ] Send to chat for explanation (future feature)
- [ ] Chat response references the code

### 13. Terminal + Chat Integration (Future)
**Note:** This is a future enhancement, not yet implemented.
- [ ] Run command in terminal
- [ ] Send output to chat for debugging (future feature)
- [ ] Chat provides suggestions

---

## Known Issues to Watch For

### Potential Issues
1. **Large Bundle Size Warning:**
   - Vite shows warning about 720 kB bundle
   - Not a blocker, but consider code-splitting in Phase 5

2. **npm Audit Vulnerabilities:**
   - 2 moderate severity vulnerabilities in frontend dependencies
   - Review with `npm audit` and consider `npm audit fix`

3. **Port Conflicts:**
   - If backend port 3001 is in use, app won't connect
   - Stop other Node processes before testing

4. **Encryption Key Warning:**
   - Backend shows: "CREDENTIALS_ENCRYPTION_KEY not set"
   - Credentials won't persist across backend restarts
   - Set `CREDENTIALS_ENCRYPTION_KEY` env var for production

### Performance Considerations
- First load may be slow (720 kB JavaScript)
- Monaco editor initialization takes ~1-2 seconds
- xterm terminal takes ~500ms to initialize
- Streaming chat response should be smooth (<50ms latency)

---

## Success Criteria

### Phase 4 is successful if:
✅ All 13 testing sections pass without critical errors  
✅ Workspace loads and all 3 panels are functional  
✅ Layout customization and persistence work  
✅ Chat, editor, and terminal all execute their core functions  
✅ Switching between classic and workspace modes is seamless  
✅ No crashes, freezes, or data loss during testing  

### Acceptable Issues (to fix in Phase 5+):
⚠️ Bundle size warning (will optimize with code-splitting)  
⚠️ Moderate npm vulnerabilities (will audit and fix)  
⚠️ No panel-to-panel communication yet (planned for Phase 5)  
⚠️ No multi-user support yet (planned for Phase 5)  

---

## Reporting Issues

If you encounter issues, capture:
1. **Screenshot** of the error/issue
2. **Console logs** (F12 → Console tab)
3. **Backend logs** (terminal running `npm run dev`)
4. **Steps to reproduce** the issue
5. **Expected vs actual behavior**

---

## Next Steps After Testing

### If All Tests Pass:
1. Mark Todo #9 as **completed**
2. Create Git commit: "Phase 4 complete: Multi-panel workspace system"
3. Push to repository
4. Begin Phase 3: Multi-Platform Web Access
   - Brave Search integration
   - Puppeteer web scraping
   - Plugin manager UI

### If Issues Found:
1. Document issues in GitHub issues
2. Prioritize critical vs minor issues
3. Fix critical issues before proceeding
4. Minor issues can be deferred to Phase 5

---

## Test Results Template

```markdown
# Phase 4 Testing Results

**Date:** [DATE]
**Tester:** [NAME]
**App Version:** 1.0.0
**Backend Version:** 1.0.0

## Summary
- Tests Passed: __/13
- Tests Failed: __/13
- Critical Issues: [NUMBER]
- Minor Issues: [NUMBER]

## Detailed Results
[Copy checklist above and mark completed items]

## Issues Found
1. [Issue description]
   - Severity: Critical/Major/Minor
   - Steps to reproduce: ...
   - Screenshot: [link]

## Overall Assessment
[ ] PASS - Ready for Phase 3
[ ] CONDITIONAL PASS - Minor issues to fix
[ ] FAIL - Critical issues blocking Phase 3

## Notes
[Any additional observations]
```

---

**Status:** Testing in progress...  
**App Location:** `release\win-unpacked\AI Assistant.exe`  
**Backend:** Running on port 3001  
**Documentation:** PHASE4_COMPLETE.md
