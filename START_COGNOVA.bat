@echo off
setlocal enabledelayedexpansion

:: ==============================================================================
:: Cognova Voice — One-Click Windows Launcher (.BAT)
:: Hackathon: VORTEX 2K26 (Theme 5: Deep Tech, Automation & Emerging Technology)
:: ==============================================================================

title Cognova Voice — All-In-One Launcher
cd /d "%~dp0"

echo =====================================================================
echo    COGNOVA VOICE - AGENTIC AI MENTOR
echo    Theme 5: Deep Tech, Automation ^& Emerging Technology
echo =====================================================================
echo.
echo Initializing startup sequence via PowerShell...
echo.

:: Launch start_project.ps1 with ExecutionPolicy Bypass for this process only
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0start_project.ps1"

set SCRIPT_EXIT=%ERRORLEVEL%
if %SCRIPT_EXIT% NEQ 0 (
    echo.
    echo =====================================================================
    echo [ERROR] Cognova Voice exited with status code: %SCRIPT_EXIT%
    echo If Python or Node.js is missing, please install them and try again.
    echo =====================================================================
    echo Press any key to exit this window...
    pause >nul
)

exit /b %SCRIPT_EXIT%
