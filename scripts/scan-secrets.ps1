param(
  [string]$Root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
)

$ErrorActionPreference = "Stop"

$excludedDirectories = @(
  ".git",
  "node_modules",
  "dist",
  "build",
  ".next",
  "coverage",
  "backups",
  "logs"
)

$allowedPlaceholders = @(
  "CHANGE_ME",
  "YOUR_",
  "YOUR-",
  "your-domain.com",
  "example.com",
  "localhost",
  "test_",
  "local"
)

$patterns = @(
  @{ Name = "Google OAuth client secret"; Regex = "GOOGLE_CLIENT_SECRET\s*=\s*[""']?[^""'\s]+" },
  @{ Name = "Google OAuth secret prefix"; Regex = "GOCSPX-" },
  @{ Name = "Google OAuth client id"; Regex = "apps\.googleusercontent\.com" },
  @{ Name = "PayOS API key"; Regex = "PAYOS_API_KEY\s*=\s*[""']?[^""'\s]+" },
  @{ Name = "PayOS checksum key"; Regex = "PAYOS_CHECKSUM_KEY\s*=\s*[""']?[^""'\s]+" },
  @{ Name = "JWT access secret"; Regex = "JWT_ACCESS_SECRET\s*=\s*[""']?(?!CHANGE_ME|test_|local|$).{12,}" },
  @{ Name = "JWT refresh secret"; Regex = "JWT_REFRESH_SECRET\s*=\s*[""']?(?!CHANGE_ME|test_|local|$).{12,}" },
  @{ Name = "S3 access key"; Regex = "S3_ACCESS_KEY_ID\s*=\s*[""']?[^""'\s]+" },
  @{ Name = "S3 secret key"; Regex = "S3_SECRET_ACCESS_KEY\s*=\s*[""']?[^""'\s]+" },
  @{ Name = "Mail password"; Regex = "MAIL_PASSWORD\s*=\s*[""']?[^""'\s]+" },
  @{ Name = "Database URL with password"; Regex = "DATABASE_URL=.*://.*:.*@" },
  @{ Name = "Private key marker"; Regex = "PRIVATE KEY" },
  @{ Name = "RSA private key"; Regex = "BEGIN RSA PRIVATE KEY" },
  @{ Name = "OpenSSH private key"; Regex = "BEGIN OPENSSH PRIVATE KEY" }
)

$textExtensions = @(
  ".env",
  ".example",
  ".txt",
  ".md",
  ".json",
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".yml",
  ".yaml",
  ".sql",
  ".ps1",
  ".sh",
  ".prisma",
  ".toml",
  ".conf"
)

function Convert-ToRelativePath {
  param([string]$Path)

  if ([string]::IsNullOrWhiteSpace($Path)) {
    return ""
  }

  $rootPath = (Resolve-Path $Root).Path
  $resolvedPath = Resolve-Path $Path -ErrorAction SilentlyContinue

  if ($null -eq $resolvedPath) {
    return $Path
  }

  $fullPath = $resolvedPath.Path

  if ($fullPath.StartsWith($rootPath, [System.StringComparison]::OrdinalIgnoreCase)) {
    return $fullPath.Substring($rootPath.Length).TrimStart("\", "/")
  }

  return $fullPath
}

function Test-IsExcludedPath {
  param([string]$Path)

  if ([string]::IsNullOrWhiteSpace($Path)) {
    return $true
  }

  $relative = Convert-ToRelativePath -Path $Path
  $parts = $relative -split "[\\/]+"

  foreach ($part in $parts) {
    if ($excludedDirectories -contains $part) {
      return $true
    }
  }

  return $false
}

function Test-IsTextFile {
  param([System.IO.FileInfo]$File)

  if ($File.Name -like ".env*") {
    return $true
  }

  foreach ($extension in $textExtensions) {
    if ($File.Extension -eq $extension) {
      return $true
    }
  }

  return $false
}

function Test-IsRealEnvFile {
  param([System.IO.FileInfo]$File)

  if ($File.Name -like ".env*" -and $File.Name -notlike "*.example") {
    return $true
  }

  return $false
}

function Test-IsAllowedPlaceholder {
  param([string]$Line)

  if ($Line -match "=\s*[""']?\s*[""']?\s*$") {
    return $true
  }

  foreach ($placeholder in $allowedPlaceholders) {
    if ($Line -like "*$placeholder*") {
      return $true
    }
  }

  return $false
}

$findings = New-Object System.Collections.Generic.List[string]
$selfPath = (Resolve-Path $PSCommandPath).Path

Get-ChildItem -Path $Root -Recurse -File -Force |
  Where-Object { -not (Test-IsExcludedPath -Path $_.FullName) } |
  Where-Object { (Resolve-Path $_.FullName).Path -ne $selfPath } |
  Where-Object { -not (Test-IsRealEnvFile -File $_) } |
  Where-Object { Test-IsTextFile -File $_ } |
  ForEach-Object {
    $file = $_
    $lineNumber = 0

    Get-Content -LiteralPath $file.FullName -ErrorAction SilentlyContinue | ForEach-Object {
      $lineNumber++
      $line = $_

      foreach ($pattern in $patterns) {
        if ($line -match $pattern.Regex -and -not (Test-IsAllowedPlaceholder -Line $line)) {
          $relativePath = Convert-ToRelativePath -Path $file.FullName
          $findings.Add("$relativePath`:$lineNumber [$($pattern.Name)] $line")
        }
      }
    }
  }

if ($findings.Count -gt 0) {
  Write-Host "Potential secrets found. Commit/push should be blocked." -ForegroundColor Red
  foreach ($finding in $findings) {
    Write-Host $finding -ForegroundColor Yellow
  }
  Write-Host ""
  Write-Host "If this is a false positive, prefer replacing the value with CHANGE_ME or an empty value instead of bypassing the scan."
  exit 1
}

Write-Host "Secret scan passed. No dangerous patterns found." -ForegroundColor Green
exit 0
