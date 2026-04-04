param(
    [switch]$RunServer
)

$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projectRoot

$venvPython = Join-Path $projectRoot "venv\Scripts\python.exe"

if (-not (Test-Path $venvPython)) {
    Write-Host "[setup] Creating virtual environment at .\\venv"
    python -m venv venv
}

$venvPython = Join-Path $projectRoot "venv\Scripts\python.exe"
if (-not (Test-Path $venvPython)) {
    throw "Virtual environment creation failed. Python executable not found at .\\venv\\Scripts\\python.exe"
}

Write-Host "[setup] Installing dependencies"
& $venvPython -m pip install -r requirements.txt

Write-Host "[setup] Running migrations"
& $venvPython manage.py migrate

Write-Host "[setup] Seeding demo users"
& $venvPython manage.py seed_demo_data

if ($RunServer) {
    Write-Host "[setup] Starting Django server at http://127.0.0.1:8000"
    & $venvPython manage.py runserver
} else {
    Write-Host ""
    Write-Host "Setup complete."
    Write-Host "To start backend server run: .\\venv\\Scripts\\python.exe manage.py runserver"
}
