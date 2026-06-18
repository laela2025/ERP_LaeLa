# Move live database into the repo (data/laela_erp.db) and stop using LAELA_ERP_DB_PATH.
# Run: npm run db:use-in-git

$ErrorActionPreference = "Stop"
. (Join-Path $PSScriptRoot "git-env.ps1")
. (Join-Path $PSScriptRoot "db-path.ps1")
$repoRoot = $script:RepoRoot
Set-Location $repoRoot

$repoDbAbs = Join-Path $repoRoot "data\laela_erp.db"
$dataDir = Join-Path $repoRoot "data"
if (-not (Test-Path $dataDir)) {
    New-Item -ItemType Directory -Path $dataDir | Out-Null
}

$paths = Get-ErpDbPaths -RepoRoot $repoRoot
if ($paths.IsExternal -and (Test-Path $paths.Absolute)) {
    Write-Host "Copying live database from $($paths.Absolute) ..." -ForegroundColor Cyan
    Copy-Item -Path $paths.Absolute -Destination $repoDbAbs -Force
} elseif (-not (Test-Path $repoDbAbs)) {
    Write-Host "Creating database at data\laela_erp.db ..." -ForegroundColor Cyan
    Remove-Item Env:LAELA_ERP_DB_PATH -ErrorAction SilentlyContinue
    node (Join-Path $repoRoot "server\init-db.js")
}

# Stop using external path on this Windows user account.
[Environment]::SetEnvironmentVariable("LAELA_ERP_DB_PATH", $null, "User")
Remove-Item Env:LAELA_ERP_DB_PATH -ErrorAction SilentlyContinue

if (-not (Test-Path $repoDbAbs)) {
    Write-Error "Could not create data\laela_erp.db"
}

Write-Host ""
Write-Host "Live database is now: $repoDbAbs" -ForegroundColor Green
Write-Host "LAELA_ERP_DB_PATH removed (app will use data/laela_erp.db)." -ForegroundColor Green
Write-Host ""
Write-Host "Next:" -ForegroundColor Cyan
Write-Host "  npm run db:sync    # commit database to git"
Write-Host "  npm run db:protect # protect live data from pull/push"
Write-Host "  git push           # upload to GitHub"
Write-Host ""
