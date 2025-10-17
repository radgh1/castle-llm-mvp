#!/usr/bin/env pwsh
# Quick push to GitHub script

param(
    [string]$GitHubUrl = ""
)

Write-Host "========================================" -ForegroundColor Green
Write-Host "Castle LLM MVP - Quick Deploy to GitHub" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Check if git is initialized
if (-not (Test-Path .git)) {
    Write-Host "❌ Git repository not initialized!" -ForegroundColor Red
    exit 1
}

# Get current remote URL
$currentRemote = git remote get-url origin 2>$null
if ($currentRemote -and $currentRemote -like "*.git") {
    Write-Host "✅ Git remote already configured:" -ForegroundColor Green
    Write-Host "   $currentRemote" -ForegroundColor Cyan
} else {
    if (-not $GitHubUrl) {
        Write-Host "❌ GitHub URL not provided" -ForegroundColor Red
        Write-Host ""
        Write-Host "Usage:" -ForegroundColor Yellow
        Write-Host "  .\DEPLOY_PUSH.ps1 -GitHubUrl 'https://github.com/YOUR_USERNAME/castle-llm-mvp.git'" -ForegroundColor Cyan
        exit 1
    }
    
    Write-Host "Setting up Git remote..." -ForegroundColor Yellow
    git remote remove origin 2>$null
    git remote add origin $GitHubUrl
    Write-Host "✅ Remote configured" -ForegroundColor Green
}

# Show current status
Write-Host ""
Write-Host "Current changes:" -ForegroundColor Yellow
git status --short

Write-Host ""
Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
git branch -M main
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Successfully pushed to GitHub!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Go to https://railway.app" -ForegroundColor Cyan
    Write-Host "2. Create new project > Deploy from GitHub" -ForegroundColor Cyan
    Write-Host "3. Select your castle-llm-mvp repo" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "❌ Push failed! Check your GitHub URL and credentials" -ForegroundColor Red
}
