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
echo.
echo [1/1] Starting App (all tools run 100% in your browser)...
start "All Tools - App (keep open)" /D "%ROOT%" cmd /k npm run dev

set "FRONTEND_OK=0"
for /L %%i in (1,1,30) do (
    if "!FRONTEND_OK!"=="0" (
        timeout /t 2 /nobreak >nul
        curl -s -o nul --max-time 3 http://127.0.0.1:5173/ && set "FRONTEND_OK=1"
    )
)
if "!FRONTEND_OK!"=="1" (
    echo [OK] App is UP at http://localhost:5173 >> "%LOG%"
    echo [OK] App is UP
) else (
    color 0E
    echo [WARN] No response on 5173 after 60s.
    echo [WARN] no response on 5173 >> "%LOG%"
    echo        Look at the app window - Vite prints its real URL there.
)

rem ---- 4. Open browser ----
echo.
echo Opening http://127.0.0.1:5173 ...
start "" http://127.0.0.1:5173

echo.
echo ===============================================
echo   App      : http://localhost:5173
echo              (also try http://127.0.0.1:5173)
echo   No backend needed - every tool works
echo   100% in the browser, fully offline.
echo   Log file : %LOG%
echo   Keep the app window OPEN while working!
echo ===============================================
echo.
echo Press any key to close this launcher window...
pause >nul
endlocal