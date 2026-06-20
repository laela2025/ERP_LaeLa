# Safe git push for this repo on Windows.
# Run: npm run git:push

$ErrorActionPreference = "Stop"
. (Join-Path $PSScriptRoot "git-env.ps1")
Set-Location $script:RepoRoot

git remote set-url origin "https://github.com/laela2025/ERP_LaeLa.git"

if (Get-Command gh -ErrorAction SilentlyContinue) {
    gh auth setup-git 2>$null
}

Write-Host "Pushing to origin/main ..." -ForegroundColor Cyan
git push origin main
Write-Host "Done." -ForegroundColor Green
