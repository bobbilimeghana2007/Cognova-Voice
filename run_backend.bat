@echo off
setlocal
cd /d "%~dp0backend"
title Cognova Voice — Backend Server

echo ========================================================
echo Starting Cognova Voice Backend (FastAPI + Multi-Agent Engine)
echo ========================================================

:: Detect Python or Py launcher
set PYTHON_CMD=python
python --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    py -3 --version >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        set PYTHON_CMD=py -3
    ) else (
        echo [ERROR] Python not found in PATH! Please install Python 3.10+
        pause
        exit /b 1
    )
)

:: Create venv if missing
if not exist "venv\Scripts\python.exe" (
    echo Creating Python virtual environment...
    %PYTHON_CMD% -m venv venv
    if not exist "venv\Scripts\python.exe" (
        echo [ERROR] Could not create virtual environment.
        pause
        exit /b 1
    )
    echo Installing backend dependencies...
    venv\Scripts\python.exe -m pip install --upgrade pip --quiet
    venv\Scripts\python.exe -m pip install -r requirements.txt
)

echo.
echo Launching Uvicorn Server at http://127.0.0.1:8000 ...
venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000 --host 127.0.0.1
pause
