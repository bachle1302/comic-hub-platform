<#
.SYNOPSIS
Creates a PostgreSQL plain SQL backup from the production Docker Compose postgres service.

.DESCRIPTION
Uses docker compose to run pg_dump inside the postgres container, then copies the dump
into the local backups directory. No real credentials are hardcoded in this script.

.EXAMPLE
powershell -ExecutionPolicy Bypass -File scripts/backup-db.ps1
#>

[CmdletBinding()]
param()

$ErrorActionPreference = "Stop"

$ProjectRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$ComposeFile = Join-Path $ProjectRoot "docker-compose.prod.yml"
$BackupDir = Join-Path $ProjectRoot "backups"
$PostgresUser = if ($env:POSTGRES_USER) { $env:POSTGRES_USER } else { "postgres" }
$PostgresDb = if ($env:POSTGRES_DB) { $env:POSTGRES_DB } else { "manga_db" }
$PostgresService = if ($env:POSTGRES_SERVICE) { $env:POSTGRES_SERVICE } else { "postgres" }
$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$FileName = "${PostgresDb}_${Timestamp}.sql"
$BackupPath = Join-Path $BackupDir $FileName
$ContainerBackupPath = "/tmp/$FileName"

if (-not (Test-Path $ComposeFile)) {
  throw "Cannot find docker compose file: $ComposeFile"
}

New-Item -ItemType Directory -Force -Path $BackupDir | Out-Null

Write-Host "Creating PostgreSQL backup..."
Write-Host "Service: $PostgresService"
Write-Host "Database: $PostgresDb"
Write-Host "Output: $BackupPath"

& docker compose -f $ComposeFile exec -T $PostgresService pg_dump `
  -U $PostgresUser `
  -d $PostgresDb `
  -f $ContainerBackupPath

if ($LASTEXITCODE -ne 0) {
  throw "pg_dump failed with exit code $LASTEXITCODE"
}

& docker compose -f $ComposeFile cp "${PostgresService}:${ContainerBackupPath}" $BackupPath

if ($LASTEXITCODE -ne 0) {
  throw "docker compose cp failed with exit code $LASTEXITCODE"
}

& docker compose -f $ComposeFile exec -T $PostgresService rm -f $ContainerBackupPath | Out-Null

Write-Host "Backup completed: $BackupPath"
