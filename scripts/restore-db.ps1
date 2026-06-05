<#
.SYNOPSIS
Restores a PostgreSQL plain SQL backup into the production Docker Compose postgres service.

.DESCRIPTION
Copies a local backup file into the postgres container and restores it with psql.
By default, it restores into the current database without dropping existing data.
Use -Clean to drop and recreate the public schema before restore.

.PARAMETER BackupFile
Path to the SQL backup file.

.PARAMETER Clean
Drops and recreates the public schema before restoring. This is destructive.

.EXAMPLE
powershell -ExecutionPolicy Bypass -File scripts/restore-db.ps1 -BackupFile backups/manga_db_20260603_010203.sql

.EXAMPLE
powershell -ExecutionPolicy Bypass -File scripts/restore-db.ps1 -BackupFile backups/manga_db_20260603_010203.sql -Clean
#>

[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)]
  [string]$BackupFile,

  [switch]$Clean
)

$ErrorActionPreference = "Stop"

$ProjectRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$ComposeFile = Join-Path $ProjectRoot "docker-compose.prod.yml"
$PostgresUser = if ($env:POSTGRES_USER) { $env:POSTGRES_USER } else { "postgres" }
$PostgresDb = if ($env:POSTGRES_DB) { $env:POSTGRES_DB } else { "manga_db" }
$PostgresService = if ($env:POSTGRES_SERVICE) { $env:POSTGRES_SERVICE } else { "postgres" }
$ResolvedBackupFile = Resolve-Path $BackupFile -ErrorAction SilentlyContinue

if (-not (Test-Path $ComposeFile)) {
  throw "Cannot find docker compose file: $ComposeFile"
}

if (-not $ResolvedBackupFile) {
  throw "Backup file not found: $BackupFile"
}

$BackupLeaf = Split-Path $ResolvedBackupFile -Leaf
$ContainerRestorePath = "/tmp/restore_$BackupLeaf"

Write-Host "WARNING: This will restore data into the current PostgreSQL database."
Write-Host "Service: $PostgresService"
Write-Host "Database: $PostgresDb"
Write-Host "Backup file: $ResolvedBackupFile"

if ($Clean) {
  Write-Host "Clean mode: public schema will be dropped and recreated before restore."
} else {
  Write-Host "Clean mode disabled: existing data/schema will not be dropped first."
}

$Confirmation = Read-Host "Type YES to continue"

if ($Confirmation -ne "YES") {
  Write-Host "Restore cancelled."
  exit 0
}

& docker compose -f $ComposeFile cp $ResolvedBackupFile "${PostgresService}:${ContainerRestorePath}"

if ($LASTEXITCODE -ne 0) {
  throw "docker compose cp failed with exit code $LASTEXITCODE"
}

if ($Clean) {
  & docker compose -f $ComposeFile exec -T $PostgresService psql `
    -U $PostgresUser `
    -d $PostgresDb `
    -v ON_ERROR_STOP=1 `
    -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

  if ($LASTEXITCODE -ne 0) {
    throw "Clean schema step failed with exit code $LASTEXITCODE"
  }
}

& docker compose -f $ComposeFile exec -T $PostgresService psql `
  -U $PostgresUser `
  -d $PostgresDb `
  -v ON_ERROR_STOP=1 `
  -f $ContainerRestorePath

if ($LASTEXITCODE -ne 0) {
  throw "Restore failed with exit code $LASTEXITCODE"
}

& docker compose -f $ComposeFile exec -T $PostgresService rm -f $ContainerRestorePath | Out-Null

Write-Host "Restore completed from: $ResolvedBackupFile"
