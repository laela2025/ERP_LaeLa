# One-time setup: configure git so pulls never overwrite your live database.
# Run from the repo root:  npm run setup:git-db

$ErrorActionPreference = "Continue"
. (Join-Path $PSScriptRoot "git-env.ps1")
$ErrorActionPreference = "Stop"
$repoRoot = $script:RepoRoot
Set-Location $repoRoot

if (-not (Test-Path ".git")) {
    Write-Error "This folder is not a git repository. Run 'git init' first."
}

# Allow git on this machine when folder ownership differs (common on Windows).
# safe.directory only works via env/global config; see scripts/git-env.ps1.

# merge=ours in .gitattributes needs this driver (keeps local DB on merge conflicts).
git config --local merge.ours.driver true
git config --local merge.ours.name "keep local SQLite database"

Write-Host "Installing Git LFS and tracking data/laela_erp.db..." -ForegroundColor Cyan
try { git lfs install --local 2>&1 | Out-Null } catch { }
if (-not (Test-Path ".gitattributes") -or -not (Select-String -Path ".gitattributes" -Pattern "laela_erp.db" -Quiet)) {
    git lfs track "data/laela_erp.db"
}

Write-Host ""
Write-Host "Git database protection configured." -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:"
Write-Host "  1. Ensure Git LFS is installed:  git lfs install"
Write-Host "  2. Track the DB file:            git lfs track data/laela_erp.db"
Write-Host "  3. After you have real ERP data, protect it from pull overwrites:"
Write-Host "       npm run db:protect"
Write-Host ""
Write-Host "To intentionally back up your live DB into git:"
Write-Host "       npm run db:sync"
Write-Host ""
