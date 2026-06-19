# Install API dependencies only (no frontend build). Run on server 202.164.150.65.
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

if (-not (Test-Path ".env")) {
    Copy-Item ".env.server.example" ".env"
    Write-Host "Created .env from .env.server.example — edit PG_USER and PG_PASSWORD before starting." -ForegroundColor Yellow
}

npm install --omit=dev
Write-Host ""
Write-Host "API-only install done. Start with:" -ForegroundColor Green
Write-Host "  npm run start:api"
Write-Host ""
Write-Host "Frontend stays on GitHub Pages: https://erp.laela.online" -ForegroundColor Cyan
Write-Host "This server only runs /api (LAELA_API_ONLY=true in .env)" -ForegroundColor Cyan
Write-Host ""
