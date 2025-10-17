Write-Host "Creating Castle LLM MVP structure..."
mkdir server,client
mkdir server\src,server\src\providers,server\src\services,server\src\store
mkdir client\src,client\src\components,client\src\lib
New-Item .env.example,README.md,docker-compose.yml -ItemType File
New-Item server\src\index.ts,server\src\schema.ts,server\src\util.ts -ItemType File
New-Item client\src\App.tsx,client\src\main.tsx,client\src\styles.css -ItemType File
Write-Host "✅ Structure ready under $(Get-Location)"
