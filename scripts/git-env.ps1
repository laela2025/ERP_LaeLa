# Repo-local git safety for Windows (dubious ownership) without changing global git config.
$script:RepoRoot = Split-Path -Parent $PSScriptRoot
$safePath = ($script:RepoRoot -replace '\\', '/')
$env:GIT_CONFIG_COUNT = 1
$env:GIT_CONFIG_KEY_0 = 'safe.directory'
$env:GIT_CONFIG_VALUE_0 = $safePath
