$ErrorActionPreference = "SilentlyContinue"
$Origin = "http://localhost:3007"
$Url = "http://localhost:8000/api/v1/content?page=1&page_size=6"

Write-Host "Checking CORS for Origin: $Origin" -ForegroundColor Cyan

try {
    $Response = Invoke-WebRequest -Uri $Url -Method Options -Headers @{
        "Origin" = $Origin
        "Access-Control-Request-Method" = "GET"
    } -TimeoutSec 5
    
    $CorsHeader = $Response.Headers["Access-Control-Allow-Origin"]
    if ($CorsHeader -eq $Origin -or $CorsHeader -eq "*") {
        Write-Host "SUCCESS: Access-Control-Allow-Origin: $CorsHeader" -ForegroundColor Green
    } else {
        Write-Host "FAILED: Access-Control-Allow-Origin header missing or incorrect." -ForegroundColor Red
        Write-Host "Headers received:"
        $Response.Headers | Out-String | Write-Host
    }
} catch {
    Write-Host "Request Failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
         Write-Host "Status Code: $($_.Exception.Response.StatusCode)" -ForegroundColor Yellow
         $CorsHeader = $_.Exception.Response.Headers["Access-Control-Allow-Origin"]
         if ($CorsHeader) {
             Write-Host "BUT CORS Header IS present: $CorsHeader" -ForegroundColor Green
         } else {
             Write-Host "No CORS Header in error response." -ForegroundColor Red
         }
    }
}
