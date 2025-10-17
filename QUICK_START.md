# 🚀 Railway + Netlify Deployment - Quick Start

Your app is now ready for FREE hosting! Here's what was set up:

## ✅ What's Ready

### Frontend (Netlify)
- ✅ React app will be built automatically from `client/src`
- ✅ Builds to `client/dist`
- ✅ Auto-deploys on every git push
- ✅ 100GB free bandwidth/month

### Backend (Railway)  
- ✅ Node.js/Express server auto-detected
- ✅ CORS configured for production
- ✅ Environment variables ready
- ✅ FREE using Railway's $5/month credit (never expires)

### Configuration
- ✅ Dynamic API endpoint based on environment
- ✅ Production CORS whitelisting
- ✅ Deployment guides and checklists included

---

## 🎯 Next Steps (Follow In Order)

### Step 1: Push to GitHub (5 min)
```powershell
cd c:\Users\idten\OneDrive\source\repos\ChatGPT\castle-llm-mvp

# Create a GitHub repo first at https://github.com/new
# Then:
git remote add origin https://github.com/radgh1/castle-llm-mvp.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy Backend to Railway (5 min)
1. Go to https://railway.app
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your `castle-llm-mvp` repo
4. Add environment variables:
   - `OPENAI_API_KEY` = your API key
   - `NODE_ENV` = `production`
5. Click "Deploy"
6. **Save your Railway URL** (looks like `https://castle-llm-mvp.up.railway.app`)

### Step 3: Deploy Frontend to Netlify (5 min)
1. Go to https://app.netlify.com
2. Click "Add new site" → "Import an existing project" → "GitHub"
3. Select your `castle-llm-mvp` repo
4. Build settings should auto-fill:
   - Build command: `cd client && npm install && npm run build`
   - Publish: `client/dist`
5. Add environment variable:
   - `VITE_API_URL` = `https://YOUR-RAILWAY-URL` (from Step 2)
6. Click "Deploy site"
7. **Save your Netlify URL** (looks like `https://your-site.netlify.app`)

### Step 4: Update Railway (2 min)
1. Go back to Railway dashboard
2. Add/update environment variable:
   - `FRONTEND_URL` = `https://your-site.netlify.app` (from Step 3)
3. Click "Deploy" to apply

### Step 5: Test! (2 min)
1. Visit your Netlify URL
2. Send a chat message
3. All features should work! 🎉

---

## 📚 Documentation Files

- **`DEPLOYMENT.md`** - Complete step-by-step guide with troubleshooting
- **`DEPLOY_CHECKLIST.bat`** - Windows checklist (double-click to view)
- **`DEPLOY_PUSH.ps1`** - PowerShell script to push code to GitHub
- **`.env.railway`** - Environment variable template

---

## 💰 Cost

| Service | Cost | Notes |
|---------|------|-------|
| Railway | FREE | $5/month credit (never expires) |
| Netlify | FREE | 100GB bandwidth/month |
| GitHub | FREE | Unlimited repos |
| **Total** | **$0/month** | ✅ Completely free! |

---

## ⚡ Tips

**Auto-deployment:** After setting up, every time you:
```bash
git add .
git commit -m "your changes"
git push origin main
```

Both Netlify and Railway will **automatically redeploy** within 1-2 minutes!

**First-request delay:** Railway free tier may take 5-10 seconds on the first request (it wakes up the container). Subsequent requests are fast.

**Monitoring:** 
- Railway dashboard shows backend logs
- Netlify shows deployment status and analytics

---

## 🆘 Need Help?

**Common Issues:**

1. **404 API errors** → Check `VITE_API_URL` is set in Netlify
2. **CORS errors** → Check `FRONTEND_URL` is set in Railway  
3. **Build fails** → Check package.json for typos
4. **Backend slow** → Normal on first request (cold start)

See `DEPLOYMENT.md` for full troubleshooting guide.

---

## 🎉 That's It!

Your LLM MVP is going live! Good luck! 🚀

Questions? Check the docs or Railway/Netlify support:
- https://docs.railway.app
- https://docs.netlify.com
