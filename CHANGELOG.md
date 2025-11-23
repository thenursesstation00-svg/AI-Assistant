# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Model Context Protocol (MCP) integration with 11 servers
- Dependabot configuration for automatic dependency updates
- Professional project structure reorganization
- Comprehensive documentation in `/docs` directory

## [1.0.0] - 2025-11-22

### Added
- Multi-provider AI support (Anthropic, OpenAI, Gemini, Ollama)
- Advanced multi-panel workspace (Chat, Editor, Terminal, Files)
- Auto-update feature with manual control
- Brave Search integration for internet access
- Puppeteer web scraping service
- Credential management with OS keychain
- SQLite database for workspace layouts
- Real-time streaming chat responses (SSE)
- GitHub Actions CI/CD workflow
- Docker Compose configuration for Redis
- Comprehensive test suite

### Changed
- Upgraded GitHub Actions to v4
- Fixed electron-builder publish configuration
- Improved error handling in frontend
- Enhanced API key authentication

### Fixed
- Backend database import path
- Failed to fetch errors in chat panel
- Provider selector fallback handling
- GitHub Actions artifact upload

### Security
- API key encryption
- Rate limiting on all endpoints
- CORS protection
- SQL injection prevention with prepared statements

## [0.3.0] - 2025-11-18

### Added
- Phase 4: Advanced UI Redesign
  - Multi-panel workspace with react-grid-layout
  - Monaco Editor integration
  - xterm.js terminal component
  - File browser panel

### Changed
- Migrated from single-chat UI to workspace layout
- Updated frontend with responsive grid system

## [0.2.0] - 2025-11-15

### Added
- Phase 2: UI Improvements
  - Provider selection dropdown
  - Settings panel
  - Admin interface
  - Search functionality

### Fixed
- Chat history persistence
- Provider switching bugs

## [0.1.0] - 2025-11-10

### Added
- Phase 1: Foundation & Critical Fixes
  - Initial Electron app structure
  - Express.js backend
  - React frontend with Vite
  - Anthropic Claude integration
  - Basic chat interface

---

## Version History

### Version 1.0.0 (Current)
**Release Date**: November 22, 2025
**Status**: Stable
**Highlights**: 
- Production-ready multi-provider AI assistant
- Professional workspace interface
- Full internet access capabilities
- Automatic updates

### Version 0.3.0
**Release Date**: November 18, 2025
**Status**: Beta
**Highlights**:
- Advanced multi-panel workspace
- Code editor and terminal integration

### Version 0.2.0
**Release Date**: November 15, 2025
**Status**: Alpha
**Highlights**:
- UI improvements
- Provider management

### Version 0.1.0
**Release Date**: November 10, 2025
**Status**: Pre-Alpha
**Highlights**:
- Initial release
- Basic chat functionality
