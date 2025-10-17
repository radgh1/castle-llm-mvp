# Railway + Netlify Deployment Guide

## Overview
This guide will walk you through deploying the Castle LLM MVP on Railway (backend) + Netlify (frontend).

**Total Setup Time:** ~15 minutes  
**Cost:** FREE (using Railway's $5/month free credit)

---

## Prerequisites
- GitHub account (create at https://github.com if you don't have one)
- Railway account (create at https://railway.app)
- Netlify account (create at https://netlify.com)
- OpenAI API key (optional, but needed for GPT models - get at https://platform.openai.com/api-keys)

---

## Step 1: Push Your Code to GitHub

### 1a. Create a new GitHub repository
1. Go to https://github.com/new
2. Name it `castle-llm-mvp`
3. Click "Create repository"
4. Copy the HTTPS URL (should be like `https://github.com/YOUR_USERNAME/castle-llm-mvp.git`)

### 1b. Push your local code to GitHub
```bash
cd c:\Users\idten\OneDrive\source\repos\ChatGPT\castle-llm-mvp

# Add remote if not already added
git remote remove origin 2>/dev/null
git remote add origin https://github.com/YOUR_USERNAME/castle-llm-mvp.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**Status Check:** Visit your GitHub repo URL and verify all files are there.

---

## Step 2: Deploy Backend to Railway

### 2a. Create a Railway project
1. Go to https://railway.app
2. Click "New Project" → "Deploy from GitHub repo"
3. Authorize Railway with your GitHub account
4. Select `castle-llm-mvp` repository
5. Railway will auto-detect Node.js and build

### 2b. Configure environment variables in Railway
1. In Railway dashboard, go to your project
2. Click "Variables" or the gear icon
3. Add these environment variables:

| Key | Value | Notes |
|-----|-------|-------|
| `OPENAI_API_KEY` | `sk-...` | Get from https://platform.openai.com/api-keys |
| `NODE_ENV` | `production` | Required |
| `PORT` | `3001` | Railway will automatically assign |
| `FRONTEND_URL` | `https://YOUR-SITE.netlify.app` | Add this AFTER Netlify deployment |

### 2c. Deploy
- Click the "Deploy" button
- Wait 2-3 minutes for build to complete
- Once deployed, Railway will show your backend URL (like `https://railway-app-production.up.railway.app`)
- **Save this URL** - you'll need it for step 3

**Check it works:**
```bash
curl https://YOUR-RAILWAY-URL/api/prompts
# Should return a JSON array of prompts
```

---

## Step 3: Deploy Frontend to Netlify

### 3a. Connect GitHub to Netlify
1. Go to https://app.netlify.com
2. Click "Add new site" → "Import an existing project"
3. Click "GitHub"
4. Authorize Netlify with GitHub
5. Select `YOUR_USERNAME/castle-llm-mvp`

### 3b. Configure build settings
Netlify should auto-detect, but verify:

| Setting | Value |
|---------|-------|
| **Build command** | `cd client && npm install && npm run build` |
| **Publish directory** | `client/dist` |
| **Base directory** | (leave empty) |

### 3c. Set environment variables
1. In Netlify dashboard, go to Site settings → Build & deploy → Environment
2. Add environment variable:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://YOUR-RAILWAY-URL` |

Replace `YOUR-RAILWAY-URL` with the URL from Step 2c (without trailing slash)

### 3d. Deploy
- Click "Deploy site"
- Netlify will build (takes ~3-5 minutes)
- Once complete, you'll get a URL like `https://your-site.netlify.app`
- **Save this URL**

---

## Step 4: Update Railway with Netlify URL

### 4a. Update FRONTEND_URL in Railway
1. Go back to Railway dashboard
2. Select your project
3. Click "Variables"
4. Update or add `FRONTEND_URL` = `https://your-site.netlify.app`
5. Click "Deploy" to apply changes

**Now your backend will accept requests from your Netlify frontend!**

---

## Step 5: Verify Everything Works

### Test the frontend
1. Visit your Netlify URL: `https://your-site.netlify.app`
2. Go to Chat tab
3. Send a message
4. Should get a response (may take 5-10 seconds on first request)

### Test other features
- ✅ Chat with streaming
- ✅ Documents upload
- ✅ Code Explainer
- ✅ Creative Writer
- ✅ Conversation Summarizer

---

## Troubleshooting

### 404 errors from API calls
**Problem:** Frontend can't reach backend  
**Solution:** 
1. Check VITE_API_URL is set correctly in Netlify
2. Check FRONTEND_URL is set correctly in Railway
3. Redeploy both (Netlify and Railway)
4. Check browser console for exact URL being called

### CORS errors
**Problem:** `Access to XMLHttpRequest blocked by CORS policy`  
**Solution:** Make sure FRONTEND_URL in Railway exactly matches your Netlify URL (including https://)

### Backend timing out
**Problem:** API calls take >30 seconds  
**Solution:** 
- This is normal for first request on Railway free tier
- Railway puts containers to sleep after 15 min - first request wakes them up (~5 sec)
- Subsequent requests are fast

### Build fails on Netlify
**Problem:** `npm ERR! 404 Not Found`  
**Solution:**
1. Check package.json for typos
2. Try clearing Netlify cache: Site settings → Build & deploy → Clear cache and redeploy

---

## Updating Your App

After making changes locally:

```bash
# Commit and push to GitHub
git add .
git commit -m "Your changes"
git push origin main

# Railway and Netlify will auto-redeploy within 1-2 minutes
```

---

## Cost Breakdown

| Service | Free Tier | Cost |
|---------|-----------|------|
| Railway | $5/month credit | **FREE** (credit never expires) |
| Netlify | 100GB bandwidth/month | **FREE** |
| GitHub | Unlimited repos | **FREE** |
| **Total** | | **$0/month** |

Your app runs completely free on Railway's $5/month credit, which never expires!

---

## Next Steps

Once deployed:

1. **Custom Domain (optional):**
   - Netlify: Site settings → Domain → Add custom domain
   - Railway: Not typically needed for API

2. **Analytics:**
   - Netlify: Analytics tab shows traffic
   - Monitor API usage in Railway dashboard

3. **Improvements:**
   - Add vector database persistence (Firebase, Supabase, Pinecone)
   - Set up error tracking (Sentry)
   - Add authentication (Auth0, Firebase Auth)

---

## Questions?

- Railway Docs: https://docs.railway.app
- Netlify Docs: https://docs.netlify.com
- GitHub Docs: https://docs.github.com

Good luck! 🚀
