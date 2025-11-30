# Cross-Platform Build & Distribution Guide

## Supported Platforms

AI Assistant supports the following platforms:

### Windows
- **Architectures**: x64, ARM64
- **Formats**: NSIS Installer (.exe), Portable (.exe)
- **Requirements**: Windows 10 or later
- **Auto-update**: ✅ Supported

### macOS
- **Architectures**: x64 (Intel), ARM64 (Apple Silicon)
- **Formats**: DMG (.dmg), ZIP (.zip)
- **Requirements**: macOS 10.15 (Catalina) or later
- **Auto-update**: ✅ Supported
- **Code Signing**: Optional (unsigned builds work with Gatekeeper override)

### Linux
- **Architectures**: x64, ARM64
- **Formats**: 
  - AppImage (universal, no installation required)
  - DEB (Debian, Ubuntu, Linux Mint)
  - RPM (Fedora, RHEL, CentOS, openSUSE)
  - Snap (Ubuntu, others with snapd)
- **Requirements**: Recent Linux distribution with GLIBC 2.28+
- **Auto-update**: ✅ Supported (except Snap)

## Building for All Platforms

### Prerequisites

1. **Node.js 20+** and npm
2. **Platform-specific tools**:
   - Windows: No additional tools required
   - macOS: Xcode Command Line Tools (`xcode-select --install`)
   - Linux: Standard build tools (`build-essential` on Ubuntu)

### Build Commands

```bash
# Install dependencies
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

# Build for current platform
npm run build

# Build for specific platforms
npm run build:win     # Windows only
npm run build:mac     # macOS only
npm run build:linux   # Linux only

# Build for all platforms (requires running on each OS or using CI/CD)
npm run build:all
```

### Build Output

All build artifacts are placed in the `release/` directory:

```
release/
├── AI Assistant Setup 1.0.0.exe           # Windows NSIS Installer (x64)
├── AI Assistant Setup 1.0.0-arm64.exe     # Windows NSIS Installer (ARM64)
├── AI Assistant 1.0.0.exe                 # Windows Portable (x64)
├── AI Assistant-1.0.0.dmg                 # macOS DMG (Universal)
├── AI Assistant-1.0.0-mac.zip             # macOS ZIP (Universal)
├── AI Assistant-1.0.0.AppImage            # Linux AppImage (x64)
├── AI Assistant-1.0.0-arm64.AppImage      # Linux AppImage (ARM64)
├── ai-assistant_1.0.0_amd64.deb           # Debian/Ubuntu package (x64)
├── ai-assistant-1.0.0.x86_64.rpm          # RPM package (x64)
└── ai-assistant_1.0.0_amd64.snap          # Snap package (x64)
```

## Platform-Specific Installation

### Windows Installation

**NSIS Installer (Recommended)**:
```powershell
# Download and run
.\AI Assistant Setup 1.0.0.exe

# Silent install
.\AI Assistant Setup 1.0.0.exe /S

# Custom install directory
.\AI Assistant Setup 1.0.0.exe /D=C:\MyApps\AI-Assistant
```

**Portable Version**:
- Extract `AI Assistant 1.0.0.exe` to any folder
- Run directly, no installation required
- Portable: settings stored in app directory

### macOS Installation

**DMG (Recommended)**:
```bash
# Open DMG
open AI\ Assistant-1.0.0.dmg

# Drag to Applications folder
# Or from command line:
cp -R /Volumes/AI\ Assistant/AI\ Assistant.app /Applications/
```

**First-run Security**:
```bash
# If macOS blocks unsigned app:
xattr -cr /Applications/AI\ Assistant.app

# Or allow in System Settings → Privacy & Security
```

**ZIP Archive**:
```bash
# Extract
unzip AI\ Assistant-1.0.0-mac.zip

# Move to Applications
mv AI\ Assistant.app /Applications/
```

### Linux Installation

**AppImage (Universal)**:
```bash
# Make executable
chmod +x AI\ Assistant-1.0.0.AppImage

# Run
./AI\ Assistant-1.0.0.AppImage

# Optional: Integrate with system
./AI\ Assistant-1.0.0.AppImage --appimage-extract
sudo mv squashfs-root /opt/ai-assistant
sudo ln -s /opt/ai-assistant/AppRun /usr/local/bin/ai-assistant
```

**DEB (Debian/Ubuntu)**:
```bash
# Install
sudo dpkg -i ai-assistant_1.0.0_amd64.deb

# Fix dependencies if needed
sudo apt-get install -f

# Run
ai-assistant
```

**RPM (Fedora/RHEL)**:
```bash
# Install
sudo rpm -i ai-assistant-1.0.0.x86_64.rpm

# Or with dnf
sudo dnf install ai-assistant-1.0.0.x86_64.rpm

# Run
ai-assistant
```

**Snap**:
```bash
# Install
sudo snap install ai-assistant_1.0.0_amd64.snap --dangerous --classic

# Run
ai-assistant
```

## CI/CD - GitHub Actions

The repository includes automated builds for all platforms via GitHub Actions:

### Workflow: `build-all-platforms.yml`

**Triggers**:
- Push to `main` branch
- Pull requests to `main`
- Git tags starting with `v*` (e.g., `v1.0.0`)
- Manual workflow dispatch

**Jobs**:
1. **build-windows**: Builds Windows installers (x64, ARM64)
2. **build-macos**: Builds macOS packages (Universal Binary)
3. **build-linux**: Builds Linux packages (AppImage, DEB, RPM, Snap)
4. **release**: Creates GitHub Release with all artifacts (tags only)

### Creating a Release

```bash
# Tag the release
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0

# GitHub Actions will automatically:
# 1. Build for all platforms
# 2. Create a GitHub Release
# 3. Upload all installers as release assets
```

### Manual Workflow Dispatch

```bash
# Via GitHub CLI
gh workflow run build-all-platforms.yml

# Or via GitHub web interface:
# Actions → Build AI Assistant - All Platforms → Run workflow
```

## Code Signing

### Windows Code Signing

**Requirements**:
- Code signing certificate (.pfx or .p12)
- Certificate password

**Setup**:
```bash
# Set environment variables
export CSC_LINK=/path/to/certificate.pfx
export CSC_KEY_PASSWORD=your_password

# Or in GitHub Secrets:
# CSC_LINK (base64-encoded certificate)
# CSC_KEY_PASSWORD
```

**In CI/CD**:
```yaml
- name: Build Windows Installer
  env:
    CSC_LINK: ${{ secrets.CSC_LINK }}
    CSC_KEY_PASSWORD: ${{ secrets.CSC_KEY_PASSWORD }}
  run: npm run build:win
```

### macOS Code Signing

**Requirements**:
- Apple Developer account
- Developer ID Application certificate
- Notarization credentials

**Setup**:
```bash
# Install certificate in keychain
security import certificate.p12 -k ~/Library/Keychains/login.keychain

# Set environment variables
export CSC_NAME="Developer ID Application: Your Name (TEAMID)"
export APPLE_ID=your@email.com
export APPLE_ID_PASSWORD=app-specific-password
export APPLE_TEAM_ID=TEAMID

# Or disable signing for testing:
export CSC_IDENTITY_AUTO_DISCOVERY=false
```

**Notarization**:
```bash
# Automatic during build if credentials set
npm run build:mac

# Manual notarization
xcrun notarytool submit AI\ Assistant-1.0.0.dmg \
  --apple-id your@email.com \
  --password app-specific-password \
  --team-id TEAMID
```

## Auto-Update Configuration

### Update Server

The app uses `electron-updater` with GitHub Releases as the update server.

**Configuration** (`package.json`):
```json
{
  "build": {
    "publish": [
      {
        "provider": "github",
        "releaseType": "release"
      }
    ]
  }
}
```

### Update Channels

- **Latest**: Default channel (GitHub Releases)
- **Beta**: Pre-release versions (GitHub Pre-releases)

**Set channel in app**:
```javascript
autoUpdater.channel = 'beta';
```

### Testing Updates

1. **Create test release**:
   ```bash
   git tag v1.0.1-beta.1
   git push origin v1.0.1-beta.1
   ```

2. **Mark as pre-release** on GitHub

3. **Install older version** and test update flow

### Update Flow

1. App checks for updates on startup (after 3s delay)
2. If update available, shows notification
3. User clicks "Download Update"
4. Download progress shown in UI
5. When complete, "Install & Restart" button appears
6. Click to install and restart automatically

## Distribution Channels

### GitHub Releases (Primary)
- Auto-update support: ✅
- Cost: Free
- Setup: Automatic via GitHub Actions

### Microsoft Store (Optional)
```bash
# Build MSIX package
npm run build:win -- --config.win.target=appx

# Submit via Partner Center
```

### Mac App Store (Optional)
```bash
# Build for Mac App Store
npm run build:mac -- --config.mac.target=mas

# Submit via App Store Connect
```

### Snap Store (Optional)
```bash
# Build snap
npm run build:linux -- --config.linux.target=snap

# Publish to Snap Store
snapcraft upload --release=stable ai-assistant_1.0.0_amd64.snap
```

### Flatpak (Future)
```bash
# Build flatpak (requires flatpak-builder)
flatpak-builder build-dir com.thenursesstation.ai-assistant.json
```

## Troubleshooting

### Windows

**Issue**: "Windows protected your PC" warning
- **Solution**: Click "More info" → "Run anyway" (unsigned builds)
- **Prevention**: Code sign the installer

**Issue**: Antivirus blocks installation
- **Solution**: Add exception for installer
- **Prevention**: Code sign and submit to Microsoft for reputation

### macOS

**Issue**: "App cannot be opened because it is from an unidentified developer"
- **Solution**: Run `xattr -cr /Applications/AI\ Assistant.app`
- **Prevention**: Code sign and notarize

**Issue**: Auto-update fails on macOS
- **Solution**: Check file permissions, ensure app is in `/Applications`

### Linux

**Issue**: AppImage won't run
- **Solution**: Install `libfuse2`: `sudo apt install libfuse2`

**Issue**: Snap confinement issues
- **Solution**: Use `--classic` confinement or AppImage instead

**Issue**: Missing dependencies
- **Solution**: Install via package manager (DEB/RPM handle this automatically)

## Platform-Specific Features

### Windows
- ✅ Taskbar integration
- ✅ Windows notifications
- ✅ Credential Manager integration (via keytar)
- ✅ Jump lists
- ✅ Windows Registry settings

### macOS
- ✅ macOS notifications
- ✅ Keychain integration (via keytar)
- ✅ Touch Bar support (if available)
- ✅ Dark mode sync
- ✅ macOS menu bar

### Linux
- ✅ Native notifications
- ✅ Secret Service integration (via keytar)
- ✅ Desktop file integration
- ✅ System tray icon
- ✅ XDG Base Directory compliance

## Testing on Multiple Platforms

### Using Virtual Machines

**Windows**:
```bash
# Download from Microsoft
# https://developer.microsoft.com/en-us/windows/downloads/virtual-machines/

# Or use VirtualBox/VMware
```

**macOS** (requires Mac hardware):
```bash
# Use native macOS or macOS VM on Mac
```

**Linux**:
```bash
# Use Docker for testing
docker run -it -v $(pwd):/workspace ubuntu:22.04 bash

# Or multipass
multipass launch -n ubuntu-test
```

### Using GitHub Actions

All platforms are automatically tested in CI/CD. Check build artifacts under Actions tab.

## Size Optimization

### Current Bundle Sizes
- **Windows**: ~180 MB (installer), ~250 MB (installed)
- **macOS**: ~200 MB (DMG), ~280 MB (installed)
- **Linux**: ~190 MB (AppImage)

### Reduce Size

1. **Remove unused dependencies**:
   ```bash
   npm prune --production
   ```

2. **Exclude unnecessary files**:
   ```json
   {
     "build": {
       "files": [
         "!**/*.map",
         "!**/node_modules/*/{CHANGELOG.md,README.md,README,readme.md,readme}",
         "!**/node_modules/*/{test,__tests__,tests,powered-test,example,examples}",
         "!**/node_modules/*.d.ts"
       ]
     }
   }
   ```

3. **Use asar compression**:
   ```json
   {
     "build": {
       "asar": true,
       "asarUnpack": ["**/node_modules/sharp/**/*"]
     }
   }
   ```

## Support & Documentation

- **Main README**: [README.md](../README.md)
- **Contributing**: [CONTRIBUTING.md](./CONTRIBUTING.md)
- **Changelog**: [CHANGELOG.md](../CHANGELOG.md)
- **Issues**: [GitHub Issues](https://github.com/thenursesstation00-svg/AI-Assistant/issues)

---

**Last Updated**: November 24, 2025  
**Version**: 1.0.0
