# Castle LLM MVP - Deployment Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER'S BROWSER                          │
│                                                                  │
│  https://your-site.netlify.app                                 │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           │ HTTP/REST
                           │
        ┌──────────────────┴──────────────────┐
        │                                     │
        v                                     v
   ┌─────────────┐                   ┌──────────────────────┐
   │   NETLIFY   │                   │   RAILWAY BACKEND    │
   ├─────────────┤                   ├──────────────────────┤
   │             │                   │                      │
   │ React SPA   │◄──────API────────►│  Express Server      │
   │             │   /api/*          │  Port: 3001          │
   │ - Chat      │                   │                      │
   │ - Documents │   CORS Protected  │  - /api/chat         │
   │ - Code      │   Checks Origin   │  - /api/rag/*        │
   │ - Creative  │                   │  - /api/chains/*     │
   │ - Summarize │                   │  - /api/prompts      │
   │             │                   │                      │
   │ ViteJS Build│                   │ LangChain Integration│
   │ 100GB/mo BW │                   │ $5/mo free credit    │
   │ Deploy: auto│                   │ Deploy: auto on push │
   │ on git push │                   │                      │
   └─────────────┘                   └──────────────────────┘
        │                                     │
        │ (Hosted)                           │ (Backend Services)
        │                                     │
        v                                     v
   ┌─────────────────────────────────────────────────────────┐
   │          GITHUB REPOSITORY (Free)                        │
   │  https://github.com/YOUR_USERNAME/castle-llm-mvp        │
   │                                                           │
   │  - Triggers Netlify rebuild on push                     │
   │  - Triggers Railway rebuild on push                     │
   │  - Stores all code and deployment config               │
   └─────────────────────────────────────────────────────────┘


## Data Flow

1. USER INPUT
   ↓
2. React Component → API Call → Netlify Proxy
   ↓
3. /api/* → Railway Backend (CORS checked)
   ↓
4. Express Routes → LangChain Processing
   ↓
5. OpenAI/Ollama LLM
   ↓
6. Streaming Response (SSE)
   ↓
7. Browser renders response

## Environment Variables

### Netlify (Frontend)
┌─────────────────────────────────────────┐
│ VITE_API_URL: https://railway-url       │
│ (Points to Railway backend API)          │
└─────────────────────────────────────────┘

### Railway (Backend)
┌─────────────────────────────────────────┐
│ OPENAI_API_KEY: sk-...                  │
│ NODE_ENV: production                    │
│ PORT: 3001 (auto-assigned)              │
│ FRONTEND_URL: https://netlify-url       │
│ (Used for CORS validation)              │
└─────────────────────────────────────────┘

## Deployment Timeline

```
┌────────────────────────────────────────────────────────────────┐
│                    HOUR 1: SETUP                               │
├────────────────────────────────────────────────────────────────┤
│ [0:00]  Create GitHub account                                │
│ [0:05]  Create GitHub repo, push code                        │
│ [0:10]  Go to Railway.app                                    │
│ [0:15]  Connect GitHub → Railway deploys backend            │
│ [0:20]  Railway URL ready, add to env vars                  │
│ [0:25]  Go to Netlify.com                                   │
│ [0:30]  Connect GitHub → Netlify deploys frontend          │
│ [0:35]  Netlify URL ready, add to env vars                 │
│ [0:40]  Update Railway FRONTEND_URL env                     │
│ [0:45]  Redeploy Railway with CORS fix                      │
│ [0:50]  Test app - LIVE! 🎉                                 │
└────────────────────────────────────────────────────────────────┘
```

## Cost Analysis

```
┌──────────────────────────────────────────────────────────────┐
│ Service      │ Tier           │ Cost        │ Limit          │
├──────────────────────────────────────────────────────────────┤
│ Railway      │ Free Credit    │ FREE*       │ $5/mo credit   │
│              │                │             │ (auto-included)│
├──────────────────────────────────────────────────────────────┤
│ Netlify      │ Free           │ FREE        │ 100GB BW/mo    │
│              │                │             │ Auto-deploys   │
├──────────────────────────────────────────────────────────────┤
│ GitHub       │ Free           │ FREE        │ Unlimited      │
│              │                │             │ Unlimited BW   │
├──────────────────────────────────────────────────────────────┤
│ OpenAI API   │ Pay-as-you-go  │ ~$1-5/mo    │ Optional       │
│              │ (if used)       │             │ Use Ollama free│
├──────────────────────────────────────────────────────────────┤
│ TOTAL        │                │ $0-5/month  │ ✅ FREE TIER   │
└──────────────────────────────────────────────────────────────┘
* Railway $5/mo credit NEVER expires - you'll never be charged
```

## Scalability Path (If You Grow)

### Free Tier (Current)
- Netlify: 100GB bandwidth ✓
- Railway: $5/mo credit ✓
- Perfect for: Demo, hobby project, <100 daily users

### Paid Tier (Optional, When Needed)
- Netlify: $20/mo paid tier → unlimited
- Railway: Pay-as-you-go → $10-50/mo depending on usage
- Add persistent DB (Supabase, Vercel KV)
- Add vector DB (Pinecone, Weaviate)

## Files Created for Deployment

```
project-root/
├── netlify.toml           ← Netlify build config
├── Procfile              ← Railway start script
├── .env.railway          ← Environment template
├── client/src/lib/
│   └── config.ts         ← Dynamic API endpoint
├── QUICK_START.md        ← Quick reference
├── DEPLOYMENT.md         ← Detailed guide
├── DEPLOY_CHECKLIST.bat  ← Windows checklist
└── DEPLOY_PUSH.ps1       ← GitHub push helper
```

## Next Steps After Going Live

1. ✅ Domain (optional)
   - Netlify: Add custom domain in Site Settings

2. ✅ Analytics
   - Netlify: View traffic in Analytics tab
   - Railway: Monitor usage in Dashboard

3. ✅ Error Tracking (optional)
   - Add Sentry for error logging
   - Add LogRocket for session replay

4. ✅ Database (optional)
   - For persistent storage add Supabase
   - For vector DB add Pinecone

5. ✅ Monitoring
   - Set up alerts for failures
   - Monitor API response times

## Support Resources

- **Railway**: https://docs.railway.app
- **Netlify**: https://docs.netlify.com  
- **GitHub**: https://docs.github.com
- **LangChain**: https://python.langchain.com/docs

---

**Status:** ✅ Ready to deploy!  
**Timeline:** ~1 hour setup, then auto-deploys on git push  
**Cost:** FREE ($0-5/month)  
