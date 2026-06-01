$ErrorActionPreference = "SilentlyContinue"

Write-Host "Verifying Local Deployment Health..." -ForegroundColor Cyan

# 1. Check Backend Health
Write-Host "`n[Backend] Checking http://localhost:8000/health..." -NoNewline
try {
    $backend = Invoke-WebRequest -Uri "http://localhost:8000/health" -Method Get -TimeoutSec 5
    if ($backend.StatusCode -eq 200) {
        Write-Host " OK (200)" -ForegroundColor Green
    } else {
        Write-Host " Failed ($($backend.StatusCode))" -ForegroundColor Red
    }
} catch {
    Write-Host " Failed (Connection Error)" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Gray
}

# 2. Check Frontend
Write-Host "`n[Frontend] Checking http://localhost:3007..." -NoNewline
try {
    $frontend = Invoke-WebRequest -Uri "http://localhost:3007" -Method Get -TimeoutSec 5
    if ($frontend.StatusCode -eq 200) {
        Write-Host " OK (200)" -ForegroundColor Green
    } else {
        Write-Host " Failed ($($frontend.StatusCode))" -ForegroundColor Red
    }
} catch {
    Write-Host " Failed (Connection Error)" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Gray
}

# 3. Check Nginx (if running on port 80)
Write-Host "`n[Nginx] Checking http://localhost/health..." -NoNewline
try {
    $nginx = Invoke-WebRequest -Uri "http://localhost/health" -Method Get -TimeoutSec 5
    if ($nginx.StatusCode -eq 200) {
        Write-Host " OK (200)" -ForegroundColor Green
    } else {
        Write-Host " Failed ($($nginx.StatusCode))" -ForegroundColor Red
    }
} catch {
    Write-Host " Failed (Connection Error)" -ForegroundColor Red
    # Nginx might not be mapped to 80 if conflict, check docker-compose
}

Write-Host "`nVerification Complete."
