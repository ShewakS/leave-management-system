<#
Start both backend and frontend dev servers on Windows.
This script uses npm.cmd to avoid the "%1 is not a valid Win32 application" Start-Process error when calling 'npm'.
#>
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition

Write-Host "Starting dev servers from: $scriptDir"

function Start-Server($subdir) {
    Push-Location (Join-Path $scriptDir $subdir)
    if ($subdir -eq 'backend') {
        if (!(Test-Path .env) -and (Test-Path .env.example)) {
            Copy-Item .env.example .env
            Add-Content .env "JWT_SECRET=devsecret"
            Write-Host "Created .env from .env.example with dev secret"
        }
    }
    Write-Host "Installing dependencies for $subdir (this may take a while the first time)..."
    npm.cmd install
    Write-Host "Starting dev server for $subdir"
    Start-Process -FilePath 'npm.cmd' -ArgumentList 'run','dev' -WorkingDirectory (Get-Location)
    Pop-Location
}

Start-Server 'backend'
Start-Server 'frontend'

Write-Host "Dev servers started (background processes). Check backend at http://localhost:5000 and frontend Vite output for the port."
