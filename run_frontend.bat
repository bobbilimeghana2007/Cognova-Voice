@echo off
setlocal
cd /d "%~dp0frontend"
title Cognova Voice — Frontend Dev Server

echo ========================================================
echo Starting Cognova Voice Frontend (React + Vite + Study Sanctuary UI)
echo ========================================================

:: Check Node and NPM
npm --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js / NPM not found in PATH! Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

if not exist node_modules (
    echo Installing node dependencies (npm install)...
    call npm install
)

if not exist "public\assets\study_library_sanctuary.jpg" (
    if not exist "public\assets" mkdir "public\assets"
    if exist "%USERPROFILE%\.gemini\antigravity\brain\ccd6804a-a90b-48c1-9ecf-1a978f4d0983\study_library_sanctuary_1791727898752.jpg" (
        copy /y "%USERPROFILE%\.gemini\antigravity\brain\ccd6804a-a90b-48c1-9ecf-1a978f4d0983\study_library_sanctuary_1791727898752.jpg" "public\assets\study_library_sanctuary.jpg" >nul 2>&1
    )
)

echo.
echo Launching Vite Dev Server at http://localhost:5173 ...
call npm run dev
pause
