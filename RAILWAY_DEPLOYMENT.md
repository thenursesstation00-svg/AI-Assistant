# Railway Deployment Guide

## 🚀 Deploy to Railway

### Prerequisites
1. [Railway Account](https://railway.app) (free tier available)
2. GitHub repository pushed and accessible

### Step 1: Connect Repository
1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click "New Project" → "Deploy from GitHub repo"
3. Connect your GitHub account and select the `AI-Assistant` repository

### Step 2: Configure Environment Variables
In Railway dashboard, go to your project → Variables and add:

#### Required Variables
```
ANTHROPIC_API_KEY=sk-ant-api03-your_actual_anthropic_key_here
BACKEND_API_KEY=your_secure_backend_api_key_here
NODE_ENV=production
PORT=3001
```

#### Optional Variables (for enhanced features)
```
# Multi-provider support
OPENAI_API_KEY=sk-your_openai_key_here
DEEPSEEK_API_KEY=sk-your_deepseek_key_here

# Search providers
SERPAPI_KEY=your_serpapi_key
BRAVE_API_KEY=your_brave_api_key
GOOGLE_CSE_KEY=your_google_cse_key
GOOGLE_CSE_CX=your_search_engine_id

# GitHub integration
GITHUB_TOKEN=ghp_your_github_token

# Caching (optional)
REDIS_URL=redis://localhost:6379

# CORS (Railway will provide the domain)
CORS_ORIGIN=https://your-app-name.up.railway.app
```

### Step 3: Deploy
1. Railway will automatically detect it's a Node.js app
2. The `railway.json` config will be used for deployment settings
3. Wait for build and deployment to complete (usually 2-5 minutes)

### Step 4: Verify Deployment
1. Check the deployment logs in Railway dashboard
2. Visit the provided Railway URL
3. Test the `/health` endpoint: `https://your-app-name.up.railway.app/health`

### Step 5: Configure Frontend for Railway API
After Railway deployment, configure the frontend to use your Railway backend:

1. **Get your Railway URL** from Railway dashboard (e.g., `https://your-app-name.up.railway.app`)

2. **Update frontend environment**:
   ```bash
   # Edit the production environment file
   notepad frontend\.env.production
   ```

3. **Set the API URL**:
   ```
   VITE_API_URL=https://your-actual-railway-app-name.up.railway.app
   ```

4. **For CORS**, update Railway environment variable:
   ```
   CORS_ORIGIN=https://your-actual-railway-app-name.up.railway.app
   ```

### Alternative Deployment Options:
- **Deploy frontend separately** to Vercel/Netlify with the Railway API URL
- **Use environment variables** in your frontend hosting platform
- **Update CORS_ORIGIN** in Railway to match your frontend domain

## 🔧 Troubleshooting

### Build Failures
- Check Railway build logs for specific errors
- Ensure all dependencies are in `backend/package.json`
- Verify Node.js version compatibility

### Runtime Errors
- Check environment variables are set correctly
- Verify API keys are valid and have proper permissions
- Check Railway logs for application errors

### Database Issues
- Railway doesn't provide SQLite persistence by default
- Consider using Railway's PostgreSQL plugin for production data
- Or use environment variables for file-based SQLite (data won't persist across deploys)

## 📊 Monitoring

### Health Checks
Railway automatically monitors the `/health` endpoint configured in `railway.json`.

### Logs
Access logs through Railway dashboard → your service → Logs tab.

### Metrics
Railway provides basic metrics and can integrate with external monitoring services.

## 🔒 Security Notes

- Never commit real API keys to the repository
- Use Railway's environment variable system for secrets
- Rotate API keys regularly
- Monitor Railway access logs for suspicious activity

## 🚀 Next Steps

After successful deployment:
1. Test all API endpoints
2. Set up monitoring and alerts
3. Configure domain (optional)
4. Set up CI/CD for automatic deployments

---

**Need Help?** Check Railway's [documentation](https://docs.railway.app/) or create an issue in the repository.