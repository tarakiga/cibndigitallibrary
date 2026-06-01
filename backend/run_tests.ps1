# Backend Test Runner Script
# This script runs the backend tests with proper environment setup

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "CIBN Library Backend Test Runner" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Check if virtual environment exists
if (-not (Test-Path ".venv")) {
    Write-Host "❌ Virtual environment not found. Creating..." -ForegroundColor Yellow
    uv venv
    Write-Host "✅ Virtual environment created" -ForegroundColor Green
}

# Activate virtual environment and run tests
Write-Host "🔧 Activating virtual environment..." -ForegroundColor Yellow
& .\.venv\Scripts\Activate.ps1

Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
uv pip install -r requirements.txt --quiet

Write-Host ""
Write-Host "🧪 Running tests..." -ForegroundColor Cyan
Write-Host ""

# Set environment variables for tests
$env:DATABASE_URL = "sqlite:///./test.db"
$env:TESTING = "true"

# Run pytest with arguments passed to script
if ($args.Count -gt 0) {
    .\.venv\Scripts\python.exe -m pytest $args
} else {
    .\.venv\Scripts\python.exe -m pytest tests/ -v --tb=short
}

$exitCode = $LASTEXITCODE

Write-Host ""
if ($exitCode -eq 0) {
    Write-Host "✅ All tests passed!" -ForegroundColor Green
} else {
    Write-Host "❌ Some tests failed. Check output above." -ForegroundColor Red
}

Write-Host ""
Write-Host "Test Summary:" -ForegroundColor Cyan
Write-Host "  - To run all tests: .\run_tests.ps1" -ForegroundColor Gray
Write-Host "  - To run auth tests: .\run_tests.ps1 tests/test_auth.py" -ForegroundColor Gray
Write-Host "  - To run with coverage: .\run_tests.ps1 --cov=app" -ForegroundColor Gray
Write-Host "  - To run specific test: .\run_tests.ps1 tests/test_auth.py::TestLogin" -ForegroundColor Gray
Write-Host ""

exit $exitCode
