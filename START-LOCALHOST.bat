@echo off
setlocal EnableDelayedExpansion
title All Tools - Localhost Launcher
color 0A

set "ROOT=D:\AI\All TOols Folder"
set "LOG=%ROOT%\localhost-log.txt"

echo =============================================== > "%LOG%"
echo   All Tools Localhost Launcher started %date% %time% >> "%LOG%"
echo =============================================== >> "%LOG%"

echo ===============================================
echo   Starting All Tools Project on Localhost
echo ===============================================
echo.

rem ---- 0. Check prerequisites ----
where node >nul 2>&1
if errorlevel 1 (
    color 0C
    echo [ERROR] Node.js is not installed or not in PATH.
    echo Install from https://nodejs.org/ then run this file again.
    echo [ERROR] node not found >> "%LOG%"
    pause
    exit /b 1
)
for /f "delims=" %%v in ('node -v') do set "NODEV=%%v"
echo [OK] Node !NODEV! >> "%LOG%"
echo [OK] Node !NODEV!

rem ---- 1. Install deps if missing ----
if not exist "%ROOT%\node_modules\vite" (
    echo [INFO] Installing dependencies, first run may take a few minutes...
    echo [INFO] npm install started >> "%LOG%"
    pushd "%ROOT%"
    call npm install >> "%LOG%" 2>&1
    if errorlevel 1 (
        color 0C
        echo [ERROR] npm install failed. See "%LOG%" for details.
        echo [ERROR] npm install failed >> "%LOG%"
        popd
        pause
        exit /b 1
    )
    popd
    echo [OK] Dependencies installed >> "%LOG%"
)

rem ---- 2. Kill anything stuck on port 5173 ----
for /f "tokens=5" %%p in ('netstat -aon ^| findstr ":5173 .*LISTENING"') do (
    echo [INFO] Killing old process on port 5173 PID %%p >> "%LOG%"
    taskkill /F /PID %%p >nul 2>&1
)

rem ---- 3. Start frontend (Vite) ----
rem NOTE: /D sets the working directory - avoids nested-quote bugs with spaces in path
echo.
echo [1/2] Starting Frontend dev server...
start "All Tools - Frontend (keep open)" /D "%ROOT%" cmd /k npm run dev

set "FRONTEND_OK=0"
set "FRONTEND_PORT=5173"
for /L %%i in (1,1,30) do (
    if "!FRONTEND_OK!"=="0" (
        timeout /t 2 /nobreak >nul
        curl -s -o nul --max-time 3 http://127.0.0.1:5173/ && set "FRONTEND_OK=1"
    )
)
if "!FRONTEND_OK!"=="1" (
    echo [OK] Frontend is UP at http://localhost:5173 >> "%LOG%"
    echo [OK] Frontend is UP
) else (
    color 0E
    echo [WARN] No response on 5173 after 60s.
    echo [WARN] no response on 5173 >> "%LOG%"
    echo        Look at the frontend window - Vite prints its real URL there.
)

rem ---- 4. Start PDF backend (optional) ----
echo.
echo [2/2] Starting PDF backend (optional - PDF to Word tool)...
where python >nul 2>&1
if errorlevel 1 (
    echo [SKIP] Python not found - PDF backend skipped.
    echo [SKIP] python not found >> "%LOG%"
) else (
    if not exist "%ROOT%\pdf-backend\.venv" (
        echo [INFO] Creating Python venv + installing requirements, first run...
        python -m venv "%ROOT%\pdf-backend\.venv" >> "%LOG%" 2>&1
        call "%ROOT%\pdf-backend\.venv\Scripts\activate.bat"
        pip install -r "%ROOT%\pdf-backend\requirements.txt" >> "%LOG%" 2>&1
    )
    start "All Tools - PDF Backend (keep open)" /D "%ROOT%\pdf-backend" cmd /k .venv\Scripts\activate.bat ^&^& uvicorn main:app --host 127.0.0.1 --port 8000 --reload
    echo [OK] Backend starting on http://localhost:8000 >> "%LOG%"
    echo [OK] Backend starting on http://localhost:8000
)

rem ---- 5. Open browser ----
echo.
echo Opening http://127.0.0.1:5173 ...
start "" http://127.0.0.1:5173

echo.
echo ===============================================
echo   Frontend : http://localhost:5173
echo              (also try http://127.0.0.1:5173)
echo   Backend  : http://localhost:8000  (PDF tools)
echo   Log file : %LOG%
echo   Keep the server windows OPEN while working!
echo ===============================================
echo.
echo If the page does not load: run TEST-PROJECT.bat
echo and send me the report file it creates.
echo.
echo Press any key to close this launcher window...
pause >nul
endlocal