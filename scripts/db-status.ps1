# Show whether the live database is protected from git overwrites.
# Run:  npm run db:status

$ErrorActionPreference = "Stop"
. (Join-Path $PSScriptRoot "git-env.ps1")
. (Join-Path $PSScriptRoot "db-path.ps1")
$repoRoot = $script:RepoRoot
Set-Location $repoRoot

$paths = Get-ErpDbPaths -RepoRoot $repoRoot
$dbAbs = $paths.Absolute

Write-Host "Database path: $dbAbs"
if ($paths.IsExternal) {
    Write-Host "Location:      outside repo (LAELA_ERP_DB_PATH)"
}

if (Test-Path $dbAbs) {
    $size = (Get-Item $dbAbs).Length
    Write-Host "File exists:   yes ($size bytes)"
} else {
    Write-Host "File exists:   no (start the server to create it)"
}

if ($paths.IsExternal) {
    Write-Host "Protection:    ON  (external path - git cannot access this file)" -ForegroundColor Green
} else {
    $dbRel = $paths.Relative
    $skip = git ls-files -v $dbRel 2>$null | Select-String "^S"
    if ($skip) {
        Write-Host "Protection:    ON  (skip-worktree - pull/push of code will not touch live data)" -ForegroundColor Green
    } else {
        Write-Host "Protection:    OFF (git pull CAN overwrite your database)" -ForegroundColor Yellow
        Write-Host "               Run: npm run db:protect"
    }

    $tracked = git ls-files $dbRel 2>$null
    if ($tracked) {
        Write-Host "In git:        yes (tracked via Git LFS)"
    } else {
        Write-Host "In git:        not yet committed"
    }
}

Write-Host ""
