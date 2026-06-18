# Install git hooks for database safety. Run: npm run hooks:install
$ErrorActionPreference = "Stop"
. (Join-Path $PSScriptRoot "git-env.ps1")
Set-Location $script:RepoRoot
git config core.hooksPath .githooks
Write-Host "Git hooks installed (.githooks)" -ForegroundColor Green
