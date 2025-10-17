# 🏰 Castle LLM MVP - Hosting Guide

This guide covers hosting options for the Castle LLM MVP application, including free and paid alternatives to Hugging Face Spaces.

## 🚫 Why Hugging Face Spaces Won't Work (Free Tier)

### Resource Limitations
- **ChromaDB Requirements**: Vector database needs persistent storage (>1GB) and continuous memory
- **Full-Stack Architecture**: Separate Express backend + React frontend + database service
- **Memory/CPU Intensive**: Running LLMs alongside vector operations exceeds free tier limits
- **Persistent Storage**: Free Spaces offer minimal persistent storage, insufficient for ChromaDB

### Architecture Mismatch
Hugging Face Spaces is designed for:
- Single ML demo applications
- Gradio/Streamlit interfaces
- Stateless or lightly stateful apps

Castle LLM MVP is a **production chat application** with:
- Multi-service architecture (frontend/backend/database)
- Persistent vector storage
- Real-time streaming
- Multiple external API integrations

## ✅ Recommended Hosting Solutions

### 1. 🚂 Railway (Best for Current Architecture)

**Cost**: $5/month (512MB RAM, 1GB disk, 1GB bandwidth)
**Why it works**: Native Docker support, handles full-stack apps perfectly

#### Setup Steps:
```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login and create project
railway login
railway init castle-llm-mvp

# 3. Deploy (uses your docker-compose.yml)
railway up

# 4. Set environment variables
railway variables set OPENAI_API_KEY=your_key_here
```

#### Environment Variables:
```bash
OPENAI_API_KEY=your_openai_key
OLLAMA_BASE_URL=http://localhost:11434  # For local models
CHROMA_URL=http://chroma:8000
```

### 2. 🎨 Render

**Cost**: Free tier (750 hours/month) + $7/month for persistent disk
**Why it works**: Docker support, managed databases

#### Setup Steps:
```bash
# 1. Connect GitHub repository to Render
# 2. Create "Web Service" from Docker
# 3. Use your docker-compose.yml as blueprint
# 4. Add persistent disk for ChromaDB data
```

### 3. 🪁 Fly.io

**Cost**: Generous free tier (3 shared CPUs, 256MB RAM, 3GB storage)
**Why it works**: Global deployment, Docker support

#### Setup Steps:
```bash
# 1. Install Fly CLI
curl -L https://fly.io/install.sh | sh

# 2. Initialize and deploy
fly launch
fly deploy

# 3. Set secrets
fly secrets set OPENAI_API_KEY=your_key_here
```

## 🔄 Alternative Architectures for Free Hosting

### Option A: Vercel + Supabase (Free Tier)

**Frontend**: Vercel (free)
**Backend**: Vercel functions (free tier)
**Database**: Supabase (free: 500MB, 50MB bandwidth)

#### Modified Architecture:
```
Frontend (React) → Vercel (static hosting)
API Routes → Vercel Functions
Database → Supabase (PostgreSQL)
Vector Storage → Supabase Vector or Pinecone free tier
```

#### Setup:
```bash
# 1. Deploy frontend to Vercel
cd client
npm run build
# Deploy build/ folder to Vercel

# 2. Create Supabase project
# Set up database tables for chat history and prompts

# 3. Use Vercel functions for API routes
# Move Express routes to serverless functions
```

### Option B: Netlify + PlanetScale

**Frontend**: Netlify (free)
**Backend**: Netlify Functions
**Database**: PlanetScale (free: 1 database, 1GB storage)

#### Benefits:
- Excellent for React apps
- Built-in form handling
- Global CDN
- Free SSL

### Option C: Railway Hobby Plan

**Cost**: $5/month
**Best for**: Your current docker-compose setup
**Includes**: 512MB RAM, PostgreSQL, Redis

## 📊 Hosting Comparison

| Platform | Cost | Docker | Database | Persistent Storage | Best For |
|----------|------|--------|----------|-------------------|----------|
| Railway | $5/mo | ✅ | ✅ | ✅ | Current architecture |
| Render | Free + $7/mo | ✅ | ✅ | ✅ | Full-stack apps |
| Fly.io | Free tier | ✅ | ❌ | ✅ | Global deployment |
| Vercel | Free | ❌ | ❌ | ❌ | Frontend + functions |
| Netlify | Free | ❌ | ❌ | ❌ | Static sites + functions |
| Hugging Face | Free | ⚠️ | ❌ | ⚠️ | ML demos only |

## 🛠️ Deployment Scripts

### Railway Deployment Script
```bash
#!/bin/bash
# deploy-to-railway.sh

# Install Railway CLI if not present
if ! command -v railway &> /dev/null; then
    npm install -g @railway/cli
fi

# Login and deploy
railway login
railway init castle-llm-mvp --source=. --language=typescript

# Set environment variables
railway variables set OPENAI_API_KEY=$OPENAI_API_KEY
railway variables set NODE_ENV=production

# Deploy
railway up
```

### Docker Compose for Production
```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  server:
    build: ./server
    environment:
      - NODE_ENV=production
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    ports:
      - "3001:3001"
    depends_on:
      - chroma

  client:
    build: ./client
    ports:
      - "5173:5173"

  chroma:
    image: ghcr.io/chroma-core/chroma:latest
    environment:
      - IS_PERSISTENT=TRUE
    volumes:
      - chroma_data:/chroma
    ports:
      - "8000:8000"

volumes:
  chroma_data:
```

## 🔐 Environment Variables

Required for all deployments:
```bash
OPENAI_API_KEY=your_openai_api_key_here
NODE_ENV=production
CHROMA_URL=http://chroma:8000
OLLAMA_BASE_URL=http://localhost:11434  # If using local models
```

## 🚀 Quick Deployment Commands

### Railway (Recommended):
```bash
npm install -g @railway/cli
railway login
railway init castle-llm-mvp
railway up
```

### Vercel (Free Alternative):
```bash
npm install -g vercel
cd client
vercel --prod
# Then set up API functions separately
```

## 📝 Post-Deployment Checklist

- [ ] Environment variables set
- [ ] Database connections working
- [ ] API endpoints responding
- [ ] Frontend loading correctly
- [ ] Chat functionality tested
- [ ] RAG features working
- [ ] SSL certificate active
- [ ] Domain configured (if custom)

## 🆘 Troubleshooting

### Common Issues:
1. **Database Connection**: Ensure ChromaDB is running and accessible
2. **API Keys**: Verify OpenAI key is valid and has credits
3. **Memory Limits**: Monitor resource usage on free tiers
4. **CORS Issues**: Configure CORS properly for production

### Logs:
```bash
# Railway logs
railway logs

# Docker logs
docker-compose logs -f

# Vercel logs
vercel logs
```

## 💡 Pro Tips

1. **Start with Railway**: Easiest migration from your current setup
2. **Monitor Costs**: Set up billing alerts
3. **Backup Data**: Regular ChromaDB backups
4. **Scale Gradually**: Start small, upgrade as needed
5. **CDN**: Use platform CDN for better performance

---

**Need help with deployment?** Check the main README.md for detailed setup instructions, then use this guide for hosting specifics.</content>
<parameter name="filePath">c:\Users\idten\OneDrive\source\repos\ChatGPT\castle-llm-mvp\HOSTING-README.MD