@echo off
setlocal EnableDelayedExpansion
title All Tools - Project Diagnostics
color 0B

set "ROOT=D:\AI\All TOols Folder"
set "REPORT=%ROOT%\DIAGNOSTIC-REPORT.txt"

echo =============================================== > "%REPORT%"
echo   ALL TOOLS PROJECT DIAGNOSTIC REPORT >> "%REPORT%"
echo   %date% %time% >> "%REPORT%"
echo =============================================== >> "%REPORT%"
echo.

echo Running diagnostics, please wait...
echo.

rem ---- 1. Prerequisites ----
echo --- 1. PREREQUISITES --- >> "%REPORT%"
where node 2>nul
if errorlevel 1 (
    echo [FAIL] node NOT FOUND >> "%REPORT%"
    echo [FAIL] Node.js missing - install from nodejs.org
) else (
    node -v 2>nul
    echo [ OK ] node = !errorlevel! >> "%REPORT%"
)
for /f "delims=" %%v in ('node -v 2^>nul') do echo [ OK ] Node version: %%v >> "%REPORT%"
for /f "delims=" %%v in ('npm -v 2^>nul') do echo [ OK ] npm version: %%v >> "%REPORT%"
where python >nul 2>&1 && (
    for /f "delims=" %%v in ('python --version 2^>^&1') do echo [ OK ] Python: %%v >> "%REPORT%"
) || echo [SKIP] Python not found (PDF backend unavailable) >> "%REPORT%"
echo. >> "%REPORT%"

rem ---- 2. Files ----
echo --- 2. PROJECT FILES --- >> "%REPORT%"
if exist "%ROOT%\package.json" (echo [ OK ] package.json >> "%REPORT%") else (echo [FAIL] package.json MISSING >> "%REPORT%")
if exist "%ROOT%\node_modules\vite" (echo [ OK ] node_modules installed >> "%REPORT%") else (echo [FAIL] node_modules MISSING - run npm install >> "%REPORT%")
if exist "%ROOT%\index.html" (echo [ OK ] index.html >> "%REPORT%") else (echo [FAIL] index.html MISSING >> "%REPORT%")
if exist "%ROOT%\src\main.tsx" (echo [ OK ] src\main.tsx >> "%REPORT%") else (echo [FAIL] src\main.tsx MISSING >> "%REPORT%")
echo. >> "%REPORT%"

rem ---- 3. Port listeners ----
echo --- 3. PORTS --- >> "%REPORT%"
netstat -aon | findstr ":5173" >nul
if errorlevel 1 (
    echo [INFO] Port 5173 not listening (frontend not running) >> "%REPORT%"
) else (
    echo [ OK ] Port 5173 LISTENING: >> "%REPORT%"
    netstat -aon | findstr ":5173" >> "%REPORT%" 2>&1
)
netstat -aon | findstr ":8000" >nul
if errorlevel 1 (
    echo [INFO] Port 8000 not listening (backend not running) >> "%REPORT%"
) else (
    echo [ OK ] Port 8000 LISTENING: >> "%REPORT%"
    netstat -aon | findstr ":8000" >> "%REPORT%" 2>&1
)
echo. >> "%REPORT%"

rem ---- 4. HTTP checks ----
echo --- 4. HTTP RESPONSE CHECKS --- >> "%REPORT%"
curl -s -o nul -w "GET http://127.0.0.1:5173/ -^> HTTP %%{http_code} in %%{time_total}s\n" --max-time 5 http://127.0.0.1:5173/ >> "%REPORT%" 2>&1
curl -s -o nul -w "GET http://localhost:5173/ -^> HTTP %%{http_code} in %%{time_total}s\n" --max-time 5 http://localhost:5173/ >> "%REPORT%" 2>&1
curl -s -o nul -w "GET http://127.0.0.1:8000/docs -^> HTTP %%{http_code} in %%{time_total}s\n" --max-time 5 http://127.0.0.1:8000/docs >> "%REPORT%" 2>&1
echo. >> "%REPORT%"

rem ---- 5. DNS/hosts sanity ----
echo --- 5. LOCALHOST RESOLUTION --- >> "%REPORT%"
ping -n 1 -4 localhost >nul 2>&1
if errorlevel 1 (echo [WARN] ping localhost FAILED >> "%REPORT%") else (echo [ OK ] localhost resolves >> "%REPORT%")
ping -n 1 127.0.0.1 >nul 2>&1
if errorlevel 1 (echo [WARN] ping 127.0.0.1 FAILED >> "%REPORT%") else (echo [ OK ] 127.0.0.1 reachable >> "%REPORT%")
echo. >> "%REPORT%"

rem ---- 6. Firewall helper info ----
echo --- 6. FIREWALL NOTE --- >> "%REPORT%"
echo Node.exe may be blocked by Windows Firewall. If HTTP checks fail but >> "%REPORT%"
echo ports are LISTENING, allow Node.js in Windows Security - Firewall - Allowed apps. >> "%REPORT%"
echo. >> "%REPORT%"

echo =============================================== >> "%REPORT%"
echo   END OF REPORT >> "%REPORT%"
echo =============================================== >> "%REPORT%"

echo.
echo ===============================================
echo   Diagnostic complete!
echo   Report saved to:
echo   %REPORT%
echo ===============================================
echo.
echo Opening the report now...
start notepad "%REPORT%"
pause
endlocal