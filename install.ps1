# CASTLE LLM MVP INSTALL (ASCII-safe)
$ErrorActionPreference = "Stop"

Write-Host "Starting Castle LLM MVP setup..."

# Try to ensure VS Code 'code' CLI is available in PATH (best effort)
$codeBin = "$Env:LOCALAPPDATA\Programs\Microsoft VS Code\bin"
if (-not ($Env:Path -split ";" | Where-Object { $_ -eq $codeBin })) {
  if (Test-Path $codeBin) { $Env:Path = "$Env:Path;$codeBin" }
}

# 1) Check Node
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Host "Node.js not found. Install from https://nodejs.org and rerun." ; exit 1
}

# 2) Install VS Code extensions (skip if code CLI is missing)
function Install-Extension($id) {
  if (Get-Command code -ErrorAction SilentlyContinue) {
    try {
      code --install-extension $id --force | Out-Null
      Write-Host ("Installed extension: " + $id)
    } catch {
      Write-Host ("Could not install extension: " + $id)
    }
  } else {
    Write-Host ("VS Code CLI 'code' not found. Skipping extension: " + $id)
  }
}

Write-Host "Installing VS Code extensions..."
$exts = @(
  "dbaeumer.vscode-eslint",
  "esbenp.prettier-vscode",
  "ms-azuretools.vscode-docker",
  "rangav.vscode-thunder-client",
  "egamma.vscode-npm-script"
)
foreach ($e in $exts) { Install-Extension $e }

# 3) Create .env if missing
if (-not (Test-Path ".env")) {
  if (Test-Path ".env.example") {
    Copy-Item ".env.example" ".env"
    Write-Host "Created .env from .env.example"
  } else {
    Set-Content ".env" "OPENAI_API_KEY="
    Write-Host "Created blank .env (add OPENAI_API_KEY)"
  }
}

# 4) Install dependencies
Write-Host "Installing server dependencies..."
Push-Location server
npm install
Pop-Location

Write-Host "Installing client dependencies..."
Push-Location client
npm install
Pop-Location

# 5) Optional RAG deps
$installRAG = Read-Host "Install LangChain + Chroma for RAG? (y/n)"
if ($installRAG -match "^[Yy]") {
  Push-Location server
  npm install @langchain/openai @langchain/community langchain chromadb
  Pop-Location
  Write-Host "RAG components installed."
}

Write-Host ""
Write-Host "Setup complete."
Write-Host "Next steps:"
Write-Host "1) Open .env and set OPENAI_API_KEY"
Write-Host "2) Terminal A: cd server ; npm run dev"
Write-Host "3) Terminal B: cd client ; npm run dev"
Write-Host "4) Open http://localhost:5173"
