# Contributing to AI Assistant

Thank you for considering contributing to AI Assistant! This document provides guidelines and instructions for contributing to the project.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Submitting Changes](#submitting-changes)
- [Reporting Bugs](#reporting-bugs)
- [Feature Requests](#feature-requests)

## 🤝 Code of Conduct

This project adheres to a Code of Conduct. By participating, you are expected to uphold this code:

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on what is best for the community
- Show empathy towards other community members

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or higher
- npm 9 or higher
- Git
- Windows 10/11 (primary development platform)
- VS Code (recommended editor)

### Setting Up Development Environment

1. **Fork the repository**
   ```powershell
   # Click "Fork" on GitHub, then:
   git clone https://github.com/YOUR_USERNAME/AI-Assistant.git
   cd AI-Assistant
   git remote add upstream https://github.com/thenursesstation00-svg/AI-Assistant.git
   ```

2. **Install dependencies**
   ```powershell
   npm install
   cd backend && npm install && cd ..
   cd frontend && npm install && cd ..
   ```

3. **Configure environment**
   ```powershell
   Copy-Item backend\.env.example backend\.env
   # Edit backend\.env with your API keys
   ```

4. **Initialize database**
   ```powershell
   cd backend
   node scripts/initDatabase.js
   cd ..
   ```

5. **Start development**
   ```powershell
   # Terminal 1: Backend
   cd backend
   npm run dev

   # Terminal 2: Frontend (optional for testing)
   cd frontend
   npm run dev

   # Terminal 3: Electron app
   npm start
   ```

## 🔄 Development Workflow

### Branching Strategy

We follow a simplified Git Flow:

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - New features
- `fix/*` - Bug fixes
- `docs/*` - Documentation updates
- `refactor/*` - Code refactoring

### Workflow Steps

1. **Create a branch**
   ```powershell
   git checkout -b feature/your-feature-name
   ```

2. **Make changes**
   - Write code following our [Coding Standards](#coding-standards)
   - Add tests for new features
   - Update documentation

3. **Test your changes**
   ```powershell
   # Run backend tests
   cd backend
   npm test

   # Run linter
   npm run lint

   # Test the app
   npm start
   ```

4. **Commit your changes**
   ```powershell
   git add .
   git commit -m "feat: add amazing feature"
   ```

   Follow [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat:` - New feature
   - `fix:` - Bug fix
   - `docs:` - Documentation
   - `style:` - Code style (formatting)
   - `refactor:` - Code refactoring
   - `test:` - Adding tests
   - `chore:` - Maintenance tasks

5. **Push and create PR**
   ```powershell
   git push origin feature/your-feature-name
   ```

   Then create a Pull Request on GitHub.

## 💻 Coding Standards

### JavaScript/JSX

- Use **ES6+** syntax
- **2 spaces** for indentation
- **Single quotes** for strings
- **Semicolons** required
- **camelCase** for variables and functions
- **PascalCase** for React components and classes

### React Best Practices

```jsx
// ✅ Good
import React, { useState, useEffect } from 'react';

function ChatPanel({ onSend }) {
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Effect logic
  }, []);

  return (
    <div className="chat-panel">
      {/* Content */}
    </div>
  );
}

export default ChatPanel;
```

### Backend (Express/Node.js)

```javascript
// ✅ Good
const express = require('express');
const router = express.Router();

router.post('/api/endpoint', async (req, res) => {
  try {
    const result = await someAsyncOperation();
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

### File Organization

- **One component per file**
- **Meaningful file names** - `ChatPanel.jsx`, not `cp.jsx`
- **Group related files** in directories
- **Keep files under 300 lines** (split if larger)

### Comments

```javascript
// Single-line comments for quick explanations

/**
 * Multi-line JSDoc comments for functions
 * @param {string} query - Search query
 * @returns {Promise<Array>} Search results
 */
async function search(query) {
  // Implementation
}
```

### Error Handling

Always handle errors gracefully:

```javascript
// ✅ Backend
try {
  const data = await riskyOperation();
  res.json(data);
} catch (error) {
  console.error('Operation failed:', error);
  res.status(500).json({ error: 'Operation failed' });
}

// ✅ Frontend
const [error, setError] = useState(null);

try {
  const response = await api.call();
  setData(response);
} catch (err) {
  setError(err.message);
  console.error('API call failed:', err);
}
```

## 🧪 Testing

### Writing Tests

```javascript
// backend/tests/example.test.js
const request = require('supertest');
const app = require('../src/server');

describe('API Endpoint', () => {
  it('should return success', async () => {
    const response = await request(app)
      .get('/api/test')
      .set('x-api-key', 'test-key');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
```

### Running Tests

```powershell
# All tests
cd backend
npm test

# Specific test file
npm test -- chat.test.js

# With coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

## 📝 Submitting Changes

### Pull Request Process

1. **Update documentation**
   - Update README.md if needed
   - Add/update JSDoc comments
   - Update CHANGELOG.md

2. **Ensure tests pass**
   ```powershell
   npm test
   npm run lint
   ```

3. **Create descriptive PR**
   - Clear title following conventional commits
   - Detailed description of changes
   - Reference related issues (`Fixes #123`)
   - Add screenshots for UI changes

4. **PR Template**
   ```markdown
   ## Description
   Brief description of changes

   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update

   ## Testing
   - [ ] Tests pass locally
   - [ ] Added new tests
   - [ ] Manual testing completed

   ## Screenshots (if applicable)
   [Add screenshots]

   ## Related Issues
   Fixes #123
   ```

5. **Code Review**
   - Address reviewer comments
   - Keep discussion professional and constructive
   - Update PR as needed

## 🐛 Reporting Bugs

### Before Submitting

- Check existing issues to avoid duplicates
- Verify it's reproducible in the latest version
- Collect relevant information

### Bug Report Template

```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
 - OS: [e.g. Windows 11]
 - Node Version: [e.g. 18.17.0]
 - App Version: [e.g. 1.0.0]

**Additional context**
Any other relevant information.
```

## ✨ Feature Requests

### Before Requesting

- Check if feature already exists
- Search existing feature requests
- Consider if it fits project scope

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
A clear description of the problem.

**Describe the solution you'd like**
A clear description of what you want to happen.

**Describe alternatives you've considered**
Alternative solutions or features you've considered.

**Additional context**
Any other context, mockups, or examples.
```

## 📚 Documentation

### Documentation Standards

- Use **Markdown** for all docs
- Include **code examples**
- Keep language **clear and concise**
- Add **screenshots** when helpful
- Update **API docs** for endpoint changes

### Documentation Files

- `README.md` - Project overview
- `docs/QUICKSTART.md` - Quick start guide
- `docs/SETUP.md` - Detailed setup
- `docs/MCP_GUIDE.md` - MCP configuration
- `docs/API.md` - API reference
- `CHANGELOG.md` - Version history

## 🏗️ Project Structure

### Adding New Features

1. **Backend Route**
   ```
   backend/src/routes/feature.js
   backend/tests/feature.test.js
   ```

2. **Backend Service**
   ```
   backend/src/services/featureService.js
   ```

3. **Frontend Component**
   ```
   frontend/src/components/FeatureComponent.jsx
   frontend/src/components/FeatureComponent.css (if needed)
   ```

4. **Documentation**
   ```
   docs/FEATURE_GUIDE.md (if substantial)
   ```

## 🔐 Security

### Reporting Security Issues

**DO NOT** open public issues for security vulnerabilities.

Instead, email: [security contact - add your email]

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### Security Best Practices

- Never commit API keys or credentials
- Use environment variables for secrets
- Validate and sanitize all user input
- Use prepared statements for database queries
- Keep dependencies updated (Dependabot helps)

## 📞 Getting Help

- **GitHub Issues** - Bug reports and feature requests
- **GitHub Discussions** - Questions and general discussion
- **Documentation** - Check docs/ directory first

## 🎯 Good First Issues

Look for issues labeled `good-first-issue` - these are great for newcomers!

## 📜 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to AI Assistant! 🎉**
