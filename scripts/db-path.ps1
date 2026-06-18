# Shared database path resolution (matches server/database.js).
function Get-ErpDbPaths {
    param([string]$RepoRoot)

    $envPath = $env:LAELA_ERP_DB_PATH
    if ($envPath -and $envPath.Trim()) {
        return @{
            Absolute   = $envPath.Trim()
            Relative   = $null
            IsExternal = $true
        }
    }

    $absolute = Join-Path $RepoRoot "data\laela_erp.db"
    return @{
        Absolute   = $absolute
        Relative   = "data/laela_erp.db"
        IsExternal = $false
    }
}
