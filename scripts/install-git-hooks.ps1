$ErrorActionPreference = "Stop"

$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$gitDir = Join-Path $root ".git"

if (-not (Test-Path $gitDir)) {
  Write-Host "No .git directory found. Run git init before installing hooks." -ForegroundColor Yellow
  exit 1
}

$hooksDir = Join-Path $gitDir "hooks"
New-Item -ItemType Directory -Force -Path $hooksDir | Out-Null

$preCommitPath = Join-Path $hooksDir "pre-commit"
$hookContent = @'
#!/bin/sh
powershell.exe -ExecutionPolicy Bypass -File scripts/scan-secrets.ps1
if [ $? -ne 0 ]; then
  echo "Secret scan failed. Commit aborted."
  exit 1
fi
'@

Set-Content -LiteralPath $preCommitPath -Value $hookContent -Encoding ASCII
Write-Host "Installed pre-commit hook: .git/hooks/pre-commit" -ForegroundColor Green
