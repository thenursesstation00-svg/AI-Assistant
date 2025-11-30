# Frontend Deployment Guide

## 🚀 Deploy Frontend to Hosting Services

Since your backend is on Railway, deploy the frontend separately to one of these services:

---

## 🌐 **Option 1: Vercel (Recommended)**

### Why Vercel?
- ✅ **Free tier** with generous limits
- ✅ **Automatic deployments** from GitHub
- ✅ **Perfect for React/Vite** apps
- ✅ **Global CDN** for fast loading
- ✅ **Environment variables** support

### Step-by-Step Deployment:

1. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Sign up/login with GitHub
   - Click "New Project"
   - Import your `AI-Assistant` repository

2. **Configure Build Settings**:
   ```
   Framework Preset: Vite
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: dist
   ```

3. **Set Environment Variables**:
   ```
   VITE_API_URL=https://your-railway-app-name.up.railway.app
   ```

4. **Deploy**:
   - Click "Deploy"
   - Wait for build completion
   - Get your frontend URL (e.g., `https://ai-assistant.vercel.app`)

---

## 🌍 **Option 2: Netlify**

### Why Netlify?
- ✅ **Free tier** with good limits
- ✅ **GitHub integration**
- ✅ **Form handling** (if needed)
- ✅ **Fast deployments**

### Step-by-Step Deployment:

1. **Connect to Netlify**:
   - Go to [netlify.com](https://netlify.com)
   - Sign up/login with GitHub
   - Click "New site from Git"
   - Choose your repository

2. **Configure Build Settings**:
   ```
   Base directory: frontend
   Build command: npm run build
   Publish directory: dist
   ```

3. **Set Environment Variables**:
   - Go to Site settings → Environment variables
   ```
   VITE_API_URL=https://your-railway-app-name.up.railway.app
   ```

4. **Deploy**:
   - Click "Deploy site"
   - Get your Netlify URL

---

## 📄 **Option 3: GitHub Pages (Free)**

### For Basic Deployment:

1. **Install GitHub Pages plugin**:
   ```bash
   cd frontend
   npm install --save-dev gh-pages
   ```

2. **Update package.json**:
   ```json
   "scripts": {
     "deploy": "npm run build && gh-pages -d dist"
   }
   ```

3. **Deploy**:
   ```bash
   npm run deploy
   ```

4. **Enable GitHub Pages**:
   - Go to repository Settings → Pages
   - Set source to "Deploy from a branch"
   - Choose "gh-pages" branch

5. **Set Environment Variable**:
   - Create `frontend/.env.production` with:
   ```
   VITE_API_URL=https://your-railway-app-name.up.railway.app
   ```

---

## 🔧 **Environment Variables Setup**

### For All Services:
Make sure to set:
```
VITE_API_URL=https://your-railway-app-name.up.railway.app
```

### Update CORS in Railway:
Add to Railway environment variables:
```
CORS_ORIGIN=https://your-frontend-domain.com
```

---

## 🎯 **Quick Deployment Commands**

### Using the Helper Script:
```powershell
# Update API URL
.\update-frontend-url.ps1 -RailwayUrl "https://your-railway-app-name.up.railway.app"

# Build frontend
cd frontend
npm run build
```

### Manual Build:
```bash
cd frontend
npm install
npm run build
# Deploy the 'dist' folder to your hosting service
```

---

## ✅ **Verification Steps**

After deployment:

1. **Test API Connection**:
   - Open browser dev tools
   - Check network tab for API calls
   - Verify they're going to Railway URL

2. **Test Core Features**:
   - Try sending a chat message
   - Test file upload if available
   - Check all functionality works

3. **Update CORS** (if needed):
   - If you get CORS errors, update Railway's `CORS_ORIGIN`

---

## 🚀 **Recommended: Vercel + Railway**

**Vercel** (Frontend) + **Railway** (Backend) is the perfect combination:
- Both have generous free tiers
- Excellent performance
- Easy scaling
- Great developer experience

**Next Steps:**
1. Choose Vercel or Netlify
2. Deploy using the steps above
3. Test the full application
4. Update any CORS settings if needed

Need help with any specific hosting service setup?