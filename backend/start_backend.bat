@echo off
echo Starting CIBN Digital Library Backend...
echo.
cd /d "%~dp0"
python start_server.py
pause
