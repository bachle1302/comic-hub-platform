param(
  [string]$BackendUrl = "http://localhost:4000",
  [string]$FrontendUrl = "http://localhost:3000"
)

$ErrorActionPreference = "Stop"
$failed = $false

function Normalize-BaseUrl {
  param([string]$Url)

  return $Url.TrimEnd("/")
}

function Test-Endpoint {
  param(
    [string]$Name,
    [string]$Url
  )

  try {
    $response = Invoke-WebRequest `
      -Uri $Url `
      -Method Get `
      -UseBasicParsing `
      -TimeoutSec 15

    if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 400) {
      Write-Host "[PASS] $Name -> $($response.StatusCode) $Url" -ForegroundColor Green
      return $true
    }

    Write-Host "[FAIL] $Name -> $($response.StatusCode) $Url" -ForegroundColor Red
    return $false
  } catch {
    Write-Host "[FAIL] $Name -> $Url" -ForegroundColor Red
    Write-Host "       $($_.Exception.Message)" -ForegroundColor DarkRed
    return $false
  }
}

$backend = Normalize-BaseUrl -Url $BackendUrl
$frontend = Normalize-BaseUrl -Url $FrontendUrl

$checks = @(
  @{ Name = "Backend health"; Url = "$backend/health" },
  @{ Name = "Frontend home"; Url = "$frontend" },
  @{ Name = "Public comics"; Url = "$backend/comics" },
  @{ Name = "Public categories"; Url = "$backend/categories" },
  @{ Name = "Payment coin packages"; Url = "$backend/payments/coin-packages" },
  @{ Name = "Frontend robots"; Url = "$frontend/robots.txt" },
  @{ Name = "Frontend sitemap"; Url = "$frontend/sitemap.xml" }
)

Write-Host "Running staging smoke test..."
Write-Host "Backend:  $backend"
Write-Host "Frontend: $frontend"
Write-Host ""

foreach ($check in $checks) {
  $passed = Test-Endpoint -Name $check.Name -Url $check.Url
  if (-not $passed) {
    $failed = $true
  }
}

Write-Host ""
if ($failed) {
  Write-Host "Smoke test failed." -ForegroundColor Red
  exit 1
}

Write-Host "Smoke test passed." -ForegroundColor Green
exit 0
