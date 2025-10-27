# CIBN Digital Library - Quick Start Script
# This script helps you start both backend and frontend servers

Write-Host "=======================================" -ForegroundColor Cyan
Write-Host "  CIBN Digital Library - Quick Start  " -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

$projectRoot = "D:\work\Tar\EMMANUEL\cibng\apps\NEWPROJECTS\LIBRARY2"

# Function to start backend
function Start-Backend {
    Write-Host "Starting Backend Server..." -ForegroundColor Green
    Write-Host "Location: $projectRoot\backend" -ForegroundColor Gray
    Write-Host ""
    
    $backendPath = Join-Path $projectRoot "backend"
    $venvActivate = Join-Path $backendPath ".venv\Scripts\Activate.ps1"
    
    if (-not (Test-Path $venvActivate)) {
        Write-Host "ERROR: Virtual environment not found!" -ForegroundColor Red
        Write-Host "Please create venv first: python -m venv .venv" -ForegroundColor Yellow
        return
    }
    
    Write-Host "✓ Virtual environment found" -ForegroundColor Green
    Write-Host ""
    Write-Host "Backend will be available at:" -ForegroundColor Cyan
    Write-Host "  • API: http://localhost:8000" -ForegroundColor White
    Write-Host "  • Docs: http://localhost:8000/docs" -ForegroundColor White
    Write-Host ""
    Write-Host "Starting uvicorn..." -ForegroundColor Yellow
    Write-Host ""
    
    Set-Location $backendPath
    & $venvActivate
    uvicorn app.main:app --reload --port 8000
}

# Function to start frontend
function Start-Frontend {
    Write-Host "Starting Frontend Server..." -ForegroundColor Green
    Write-Host "Location: $projectRoot\frontend" -ForegroundColor Gray
    Write-Host ""
    
    $frontendPath = Join-Path $projectRoot "frontend"
    
    if (-not (Test-Path (Join-Path $frontendPath "node_modules"))) {
        Write-Host "ERROR: node_modules not found!" -ForegroundColor Red
        Write-Host "Please install dependencies first: npm install" -ForegroundColor Yellow
        return
    }
    
    Write-Host "✓ Dependencies found" -ForegroundColor Green
    Write-Host ""
    Write-Host "Frontend will be available at:" -ForegroundColor Cyan
    Write-Host "  • App: http://localhost:3007" -ForegroundColor White
    Write-Host ""
    Write-Host "Starting Next.js..." -ForegroundColor Yellow
    Write-Host ""
    
    Set-Location $frontendPath
    npm run dev
}

# Function to show menu
function Show-Menu {
    Write-Host "Choose an option:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  1. Start Backend Only" -ForegroundColor White
    Write-Host "  2. Start Frontend Only" -ForegroundColor White
    Write-Host "  3. Show Manual Instructions" -ForegroundColor White
    Write-Host "  4. Exit" -ForegroundColor White
    Write-Host ""
}

# Main menu loop
$choice = 0
while ($choice -ne 4) {
    Show-Menu
    $choice = Read-Host "Enter your choice (1-4)"
    
    switch ($choice) {
        1 {
            Start-Backend
            break
        }
        2 {
            Start-Frontend
            break
        }
        3 {
            Write-Host ""
            Write-Host "=======================================" -ForegroundColor Cyan
            Write-Host "  Manual Start Instructions" -ForegroundColor Cyan
            Write-Host "=======================================" -ForegroundColor Cyan
            Write-Host ""
            Write-Host "BACKEND:" -ForegroundColor Green
            Write-Host "  1. Open PowerShell terminal" -ForegroundColor Gray
            Write-Host "  2. Run:" -ForegroundColor Gray
            Write-Host "     cd `"$projectRoot\backend`"" -ForegroundColor White
            Write-Host "     .\.venv\Scripts\Activate.ps1" -ForegroundColor White
            Write-Host "     uvicorn app.main:app --reload --port 8000" -ForegroundColor White
            Write-Host ""
            Write-Host "FRONTEND:" -ForegroundColor Green
            Write-Host "  1. Open another PowerShell terminal" -ForegroundColor Gray
            Write-Host "  2. Run:" -ForegroundColor Gray
            Write-Host "     cd `"$projectRoot\frontend`"" -ForegroundColor White
            Write-Host "     npm run dev" -ForegroundColor White
            Write-Host ""
            Write-Host "TEST CREDENTIALS:" -ForegroundColor Green
            Write-Host "  Regular User:" -ForegroundColor Gray
            Write-Host "    Email: subscriber@test.com" -ForegroundColor White
            Write-Host "    Password: password123" -ForegroundColor White
            Write-Host ""
            Write-Host "  CIBN Member:" -ForegroundColor Gray
            Write-Host "    Employee ID: CIBN001" -ForegroundColor White
            Write-Host "    Password: password123" -ForegroundColor White
            Write-Host ""
            Write-Host "  Admin:" -ForegroundColor Gray
            Write-Host "    Email: admin@test.com" -ForegroundColor White
            Write-Host "    Password: admin123" -ForegroundColor White
            Write-Host ""
            Write-Host "For detailed testing guide, see:" -ForegroundColor Cyan
            Write-Host "  INTEGRATION_TESTING.md" -ForegroundColor White
            Write-Host ""
            Read-Host "Press Enter to continue"
        }
        4 {
            Write-Host ""
            Write-Host "Goodbye! 👋" -ForegroundColor Cyan
            Write-Host ""
        }
        default {
            Write-Host ""
            Write-Host "Invalid choice. Please try again." -ForegroundColor Red
            Write-Host ""
        }
    }
}
