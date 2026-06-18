# Mark the live database as protected so git pull/push of code changes
# will NOT overwrite or commit your real ERP data.
# Run:  npm run db:protect

$ErrorActionPreference = "Stop"
. (Join-Path $PSScriptRoot "git-env.ps1")
. (Join-Path $PSScriptRoot "db-path.ps1")
$repoRoot = $script:RepoRoot
Set-Location $repoRoot

$paths = Get-ErpDbPaths -RepoRoot $repoRoot
$dbAbs = $paths.Absolute

if (-not (Test-Path ".git")) {
    Write-Error "This folder is not a git repository."
}

if (-not (Test-Path $dbAbs)) {
    Write-Host "No database at $dbAbs yet. Creating it now..." -ForegroundColor Cyan
    node (Join-Path $repoRoot "server\init-db.js")
    if (-not (Test-Path $dbAbs)) {
        Write-Host "Could not create database at $dbAbs. Run: npm run db:init" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
if ($paths.IsExternal) {
    Write-Host "Protected: $dbAbs" -ForegroundColor Green
    Write-Host "  - Database is outside the repo (LAELA_ERP_DB_PATH)"
    Write-Host "  - git pull/push will never touch this file"
    Write-Host ""
    exit 0
}

$dbRel = $paths.Relative
git update-index --skip-worktree $dbRel

Write-Host "Protected: $dbAbs" -ForegroundColor Green
Write-Host "  - git pull will NOT replace your live database"
Write-Host "  - git commit will NOT include database changes unless you run: npm run db:sync"
Write-Host ""
