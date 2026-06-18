# Intentionally commit and push the current live database to git.
# Run only when you want git to store a backup of your real data.
# Run:  npm run db:sync

param(
    [string]$Message = "chore: sync live ERP database backup"
)

$ErrorActionPreference = "Stop"
. (Join-Path $PSScriptRoot "git-env.ps1")
. (Join-Path $PSScriptRoot "db-path.ps1")
$repoRoot = $script:RepoRoot
Set-Location $repoRoot

$paths = Get-ErpDbPaths -RepoRoot $repoRoot
$dbAbs = $paths.Absolute
$dbRel = "data/laela_erp.db"
$repoDbAbs = Join-Path $repoRoot "data\laela_erp.db"

if (-not (Test-Path ".git")) {
    Write-Error "This folder is not a git repository."
}

if (-not (Test-Path $repoDbAbs)) {
    Write-Error "No database found at $repoDbAbs. Run: npm run db:use-in-git"
}

if ($paths.IsExternal -and (Test-Path $dbAbs)) {
    Write-Host "Copying live database into repo for git backup..." -ForegroundColor Cyan
    Copy-Item -Path $dbAbs -Destination $repoDbAbs -Force
}

# Temporarily allow git to see DB changes (only if already tracked).
$tracked = git ls-files $dbRel 2>$null
if ($tracked) {
    git update-index --no-skip-worktree $dbRel 2>$null
}

git add $dbRel .gitattributes
$staged = git diff --cached --name-only $dbRel
if (-not $staged) {
  Write-Host "Database unchanged since last commit. Re-protecting..." -ForegroundColor Yellow
  if (git ls-files $dbRel 2>$null) {
    git update-index --skip-worktree $dbRel
  }
  exit 0
}

git commit -m $Message
Write-Host ""
Write-Host "Committed database. Push when ready:  git push" -ForegroundColor Green
Write-Host "Re-protecting live database from accidental commits..." -ForegroundColor Cyan
if (git ls-files $dbRel 2>$null) {
    git update-index --skip-worktree $dbRel
}
Write-Host "Done. Your live DB is protected again." -ForegroundColor Green
Write-Host ""
