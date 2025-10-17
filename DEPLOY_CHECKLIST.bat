@echo off
REM Quick deployment checklist for Railway + Netlify

echo ========================================
echo Castle LLM MVP - Deployment Checklist
echo ========================================
echo.
echo [ ] 1. Create GitHub account at https://github.com
echo.
echo [ ] 2. Create GitHub repository
echo         - Go to https://github.com/new
echo         - Name: castle-llm-mvp
echo         - Copy HTTPS URL
echo.
echo [ ] 3. Push code to GitHub
echo         - Run: git remote add origin [YOUR-GITHUB-URL]
echo         - Run: git push -u origin main
echo.
echo [ ] 4. Create Railway account at https://railway.app
echo.
echo [ ] 5. Connect Railway to GitHub
echo         - New Project > Deploy from GitHub
echo         - Select castle-llm-mvp repo
echo.
echo [ ] 6. Add Railway environment variables
echo         - OPENAI_API_KEY: sk-...
echo         - NODE_ENV: production
echo         - Save Railway URL after deploy (Step 2c)
echo.
echo [ ] 7. Create Netlify account at https://netlify.com
echo.
echo [ ] 8. Connect Netlify to GitHub
echo         - New site from Git
echo         - Select castle-llm-mvp repo
echo         - Build: cd client && npm install && npm run build
echo         - Publish: client/dist
echo.
echo [ ] 9. Add Netlify environment variable
echo         - VITE_API_URL: [YOUR-RAILWAY-URL]
echo.
echo [ ] 10. Update Railway with Netlify URL
echo          - FRONTEND_URL: https://your-site.netlify.app
echo          - Click Deploy
echo.
echo [ ] 11. Test the app
echo          - Visit: https://your-site.netlify.app
echo          - Send a chat message
echo          - Check browser console for errors
echo.
echo ========================================
echo Detailed guide: See DEPLOYMENT.md
echo ========================================
pause
