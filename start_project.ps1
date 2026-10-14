# ==============================================================================
# Cognova Voice — Universal One-Command Startup Script (PowerShell)
# Hackathon: VORTEX 2K26 (Theme 5: Deep Tech, Automation & Emerging Technology)
# ==============================================================================

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$ErrorActionPreference = "Stop"

# 1. Locate Project Root Reliably
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
if (-not $ScriptDir) {
    $ScriptDir = (Get-Location).Path
}
$ProjectRoot = $ScriptDir
$BackendDir = Join-Path $ProjectRoot "backend"
$FrontendDir = Join-Path $ProjectRoot "frontend"

# Copy generated study sanctuary image into frontend assets if available
$BrainImg = "$env:USERPROFILE\.gemini\antigravity\brain\ccd6804a-a90b-48c1-9ecf-1a978f4d0983\study_library_sanctuary_1791727898752.jpg"
$PubAssets = Join-Path $FrontendDir "public\assets"
if (Test-Path $BrainImg) {
    if (-not (Test-Path $PubAssets)) { New-Item -ItemType Directory -Path $PubAssets -Force | Out-Null }
    Copy-Item $BrainImg (Join-Path $PubAssets "study_library_sanctuary.jpg") -Force -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "   COGNOVA VOICE - AGENTIC AI MENTOR STARTUP" -ForegroundColor Green
Write-Host "   Tagline: Speak. Learn. Improve. Grow." -ForegroundColor Yellow
Write-Host "   Location: $ProjectRoot" -ForegroundColor DarkGray
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host ""

# 2. Check Prerequisites (Python & Node.js)
Write-Host "[1/6] Checking system prerequisites..." -ForegroundColor Cyan

# Find Python Executable
$PythonCmd = $null
if (Get-Command "python" -ErrorAction SilentlyContinue) {
    # Verify it is not the Windows Store 0-byte stub
    try {
        $pyVer = & python --version 2>&1
        if ($pyVer -match "Python (\d+)\.(\d+)") {
            $PythonCmd = "python"
            Write-Host "  [OK] Found Python: $pyVer" -ForegroundColor Green
        }
    } catch {}
}

if (-not $PythonCmd -and (Get-Command "py" -ErrorAction SilentlyContinue)) {
    try {
        $pyVer = & py -3 --version 2>&1
        if ($pyVer -match "Python (\d+)\.(\d+)") {
            $PythonCmd = "py -3"
            Write-Host "  [OK] Found Python Launcher (py): $pyVer" -ForegroundColor Green
        }
    } catch {}
}

if (-not $PythonCmd) {
    Write-Host "  [ERROR] Python is not installed or not added to your Windows PATH!" -ForegroundColor Red
    Write-Host "  Please install Python 3.10+ from https://www.python.org/downloads/" -ForegroundColor Yellow
    Write-Host "  IMPORTANT: During installation, be sure to check 'Add python.exe to PATH'." -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit..."
    exit 1
}

# Find Node.js & NPM
$NpmCmd = $null
if (Get-Command "npm.cmd" -ErrorAction SilentlyContinue) {
    $NpmCmd = "npm.cmd"
} elseif (Get-Command "npm" -ErrorAction SilentlyContinue) {
    $NpmCmd = "npm"
}

if (-not $NpmCmd) {
    Write-Host "  [ERROR] Node.js / NPM is not installed or not added to your Windows PATH!" -ForegroundColor Red
    Write-Host "  Please download and install Node.js (LTS) from https://nodejs.org/" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit..."
    exit 1
} else {
    $nodeVer = & node --version 2>&1
    Write-Host "  [OK] Found Node.js: $nodeVer (NPM: $(& $NpmCmd --version))" -ForegroundColor Green
}

# 3. Port Occupancy Checks (8000 & 5173)
Write-Host "[2/6] Inspecting network ports (8000 & 5173)..." -ForegroundColor Cyan

function Test-PortOccupied([int]$Port) {
    try {
        $tcpConn = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
        return ($null -ne $tcpConn)
    } catch {
        # Fallback using raw socket check
        try {
            $socket = New-Object System.Net.Sockets.TcpClient
            $asyncResult = $socket.BeginConnect("127.0.0.1", $Port, $null, $null)
            $wait = $asyncResult.AsyncWaitHandle.WaitOne(400, $false)
            if ($wait -and $socket.Connected) {
                $socket.Close()
                return $true
            }
            $socket.Close()
            return $false
        } catch {
            return $false
        }
    }
}

$BackendAlreadyRunning = $false
$FrontendAlreadyRunning = $false

if (Test-PortOccupied 8000) {
    # Check if it's already Cognova Voice backend responding
    try {
        $resp = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/health" -TimeoutSec 2 -ErrorAction Stop
        if ($resp.status -eq "healthy") {
            Write-Host "  [NOTICE] Cognova Voice backend is ALREADY running on port 8000." -ForegroundColor Yellow
            $BackendAlreadyRunning = $true
        } else {
            Write-Host "  [WARNING] Port 8000 is occupied by an unknown service. If startup fails, please stop that process." -ForegroundColor Red
        }
    } catch {
        Write-Host "  [WARNING] Port 8000 is currently occupied by another process." -ForegroundColor Red
    }
} else {
    Write-Host "  [OK] Port 8000 is free for backend." -ForegroundColor Green
}

if (Test-PortOccupied 5173) {
    try {
        $webTest = Invoke-WebRequest -Uri "http://localhost:5173" -TimeoutSec 2 -ErrorAction Stop
        Write-Host "  [NOTICE] Cognova Voice frontend is ALREADY running on port 5173." -ForegroundColor Yellow
        $FrontendAlreadyRunning = $true
    } catch {
        Write-Host "  [WARNING] Port 5173 is occupied by another process." -ForegroundColor Yellow
    }
} else {
    Write-Host "  [OK] Port 5173 is free for frontend." -ForegroundColor Green
}

# 4. Backend Environment & Dependency Verification
Write-Host "[3/6] Verifying backend virtual environment & dependencies..." -ForegroundColor Cyan

$VenvDir = Join-Path $BackendDir "venv"
$VenvPython = Join-Path $VenvDir "Scripts\python.exe"

if (-not (Test-Path $VenvPython)) {
    Write-Host "  Creating Python virtual environment in backend\venv..." -ForegroundColor Yellow
    if ($PythonCmd -eq "py -3") {
        & py -3 -m venv "$VenvDir"
    } else {
        & python -m venv "$VenvDir"
    }
    if (-not (Test-Path $VenvPython)) {
        Write-Host "  [ERROR] Failed to create virtual environment." -ForegroundColor Red
        exit 1
    }
    Write-Host "  [OK] Virtual environment created successfully." -ForegroundColor Green
} else {
    Write-Host "  [OK] Virtual environment exists." -ForegroundColor Green
}

# Check essential packages (fastapi, uvicorn, sqlalchemy)
$PackagesInstalled = $false
try {
    $checkOut = & $VenvPython -c "import fastapi, uvicorn, sqlalchemy, pydantic, pydantic_settings; print('INSTALLED')" 2>&1
    if ($checkOut -match "INSTALLED") {
        $PackagesInstalled = $true
    }
} catch {}

if (-not $PackagesInstalled) {
    Write-Host "  Installing backend dependencies from requirements.txt..." -ForegroundColor Yellow
    $ReqFile = Join-Path $BackendDir "requirements.txt"
    & $VenvPython -m pip install --upgrade pip --quiet
    & $VenvPython -m pip install -r "$ReqFile"
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  [ERROR] Pip install encountered errors. Please check the terminal above." -ForegroundColor Red
        exit 1
    }
    Write-Host "  [OK] Backend dependencies installed." -ForegroundColor Green
} else {
    Write-Host "  [OK] Backend dependencies are up to date." -ForegroundColor Green
}

# 5. Frontend Dependency Verification
Write-Host "[4/6] Verifying frontend node_modules..." -ForegroundColor Cyan
$NodeModulesDir = Join-Path $FrontendDir "node_modules"

if (-not (Test-Path $NodeModulesDir)) {
    Write-Host "  Installing frontend packages (npm install)... This may take ~30 seconds on first run." -ForegroundColor Yellow
    Push-Location $FrontendDir
    try {
        & $NpmCmd install
    } finally {
        Pop-Location
    }
    if (-not (Test-Path $NodeModulesDir)) {
        Write-Host "  [ERROR] npm install failed. Please check your internet connection." -ForegroundColor Red
        exit 1
    }
    Write-Host "  [OK] Frontend dependencies installed." -ForegroundColor Green
} else {
    Write-Host "  [OK] Frontend node_modules verified." -ForegroundColor Green
}

# 6. Launch Backend & Frontend Services
Write-Host "[5/6] Launching backend and frontend..." -ForegroundColor Cyan

$BackendProcess = $null
$FrontendProcess = $null

# Start Backend if not already running
if (-not $BackendAlreadyRunning) {
    Write-Host "  Starting FastAPI backend server on http://127.0.0.1:8000..." -ForegroundColor Yellow
    $BackendProcess = Start-Process -FilePath $VenvPython `
        -ArgumentList "-m uvicorn app.main:app --port 8000 --host 127.0.0.1" `
        -WorkingDirectory $BackendDir `
        -PassThru
}

# Wait for backend health endpoint to respond
Write-Host "  Waiting for backend health check..." -NoNewline
$BackendReady = $false
$Retries = 25
while ($Retries -gt 0 -and -not $BackendReady) {
    try {
        $health = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/health" -TimeoutSec 1 -ErrorAction Stop
        if ($health.status -eq "healthy") {
            $BackendReady = $true
            break
        }
    } catch {
        Start-Sleep -Milliseconds 600
        Write-Host "." -NoNewline
        $Retries--
    }
}
Write-Host ""

if ($BackendReady) {
    Write-Host "  [SUCCESS] Backend is ONLINE: http://127.0.0.1:8000" -ForegroundColor Green
    Write-Host "  Swagger API Docs: http://127.0.0.1:8000/docs" -ForegroundColor DarkGray
} else {
    Write-Host "  [ERROR] Backend did not respond in time. Please check backend logs." -ForegroundColor Red
}

# Start Frontend if not already running
if (-not $FrontendAlreadyRunning) {
    Write-Host "  Starting Vite frontend dev server on http://localhost:5173..." -ForegroundColor Yellow
    $FrontendProcess = Start-Process -FilePath $NpmCmd `
        -ArgumentList "run dev" `
        -WorkingDirectory $FrontendDir `
        -PassThru
}

# Wait for frontend to respond
Write-Host "  Waiting for frontend dev server..." -NoNewline
$FrontendReady = $false
$Retries = 20
while ($Retries -gt 0 -and -not $FrontendReady) {
    try {
        $webResp = Invoke-WebRequest -Uri "http://localhost:5173" -TimeoutSec 1 -ErrorAction Stop
        if ($webResp.StatusCode -eq 200) {
            $FrontendReady = $true
            break
        }
    } catch {
        Start-Sleep -Milliseconds 600
        Write-Host "." -NoNewline
        $Retries--
    }
}
Write-Host ""

if ($FrontendReady) {
    Write-Host "  [SUCCESS] Frontend is ONLINE: http://localhost:5173" -ForegroundColor Green
} else {
    Write-Host "  [NOTICE] Frontend launched. It may take a few more seconds to appear." -ForegroundColor Yellow
}

# 7. Open Browser
Write-Host "[6/6] Opening Cognova Voice in your default browser..." -ForegroundColor Cyan
Start-Process "http://localhost:5173"

Write-Host ""
Write-Host "=================================================================" -ForegroundColor Green
Write-Host "   COGNOVA VOICE IS RUNNING SUCCESSFULLY! " -ForegroundColor Green
Write-Host "=================================================================" -ForegroundColor Green
Write-Host "   Web Application: http://localhost:5173" -ForegroundColor Cyan
Write-Host "   API Documentation: http://127.0.0.1:8000/docs" -ForegroundColor Cyan
Write-Host ""
Write-Host "   Keep this window open while using Cognova Voice." -ForegroundColor Yellow
Write-Host "   Press [Ctrl + C] in this window anytime to stop all services." -ForegroundColor White
Write-Host "=================================================================" -ForegroundColor Green
Write-Host ""

# 8. Clean Graceful Shutdown Handler
try {
    while ($true) {
        Start-Sleep -Seconds 2
        # Check if processes unexpectedly terminated
        if ($BackendProcess -and $BackendProcess.HasExited) {
            Write-Host "[NOTICE] Backend process stopped (Exit code: $($BackendProcess.ExitCode))." -ForegroundColor Yellow
            break
        }
    }
} finally {
    Write-Host ""
    Write-Host "Shutting down Cognova Voice services cleanly..." -ForegroundColor Cyan
    
    if ($BackendProcess -and -not $BackendProcess.HasExited) {
        Write-Host "  Stopping FastAPI backend..." -ForegroundColor DarkGray
        Stop-Process -Id $BackendProcess.Id -Force -ErrorAction SilentlyContinue
    }
    
    if ($FrontendProcess -and -not $FrontendProcess.HasExited) {
        Write-Host "  Stopping Vite frontend..." -ForegroundColor DarkGray
        Stop-Process -Id $FrontendProcess.Id -Force -ErrorAction SilentlyContinue
    }

    # Clean up node processes started for vite on 5173 if any
    try {
        $portConn = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue
        if ($portConn) {
            foreach ($conn in $portConn) {
                if ($conn.OwningProcess -gt 0) {
                    Stop-Process -Id $conn.OwningProcess -Force -ErrorAction SilentlyContinue
                }
            }
        }
    } catch {}

    Write-Host "All services stopped safely. Goodbye!" -ForegroundColor Green
}
