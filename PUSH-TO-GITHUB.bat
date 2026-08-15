@echo off
setlocal EnableDelayedExpansion
title Push All Tools to GitHub (new branch: feature/gif-compressor)
color 0B

set "ROOT=D:\AI\All TOols Folder"
cd /d "%ROOT%"

echo =====================================================
echo   Pushing project to GitHub
echo   Branch: feature/gif-compressor
echo =====================================================
echo.

rem ---- 0. Check git ----
where git >nul 2>&1
if errorlevel 1 (
    color 0C
    echo [ERROR] Git is not installed. Install from https://git-scm.com/
    pause
    exit /b 1
)

rem ---- 1. Ask for the GitHub repository URL ----
if "%REMOTE_URL%"=="" (
    echo Paste your GitHub repository URL and press Enter.
    echo Example: https://github.com/your-username/all-tools.git
    echo ^(Create an empty repo at https://github.com/new first if you haven't^)
    echo.
    set /p REMOTE_URL="Repo URL: "
)

if "!REMOTE_URL!"=="" (
    color 0C
    echo [ERROR] No URL provided. Aborting.
    pause
    exit /b 1
)

rem ---- 2. Init repo if this is the first run ----
if not exist ".git" (
    echo.
    echo [1/5] Initializing local git repository...
    git init
    git branch -M main
)

rem ---- 3. Configure remote ----
echo.
echo [2/5] Setting remote origin...
git remote remove origin >nul 2>&1
git remote add origin !REMOTE_URL!

rem ---- 4. Branch + commit ----
echo.
echo [3/5] Creating branch feature/gif-compressor...
git checkout -B feature/gif-compressor

echo.
echo [4/5] Staging files (node_modules ignored) and committing...
git add -A
git commit -m "feat: real animated GIF compressor (target-size, quality-first) + local-only PDF backend proxy" -m "New gifEngine.ts: WebCodecs decode + gifenc encode; quality-first pipeline (lossless re-encode -> frame-rate -> colors -> adaptive scale, budget claw-back). New GIF Compressor page: compress-to-size mode, manual mode, auto re-compress on settings change, side-by-side preview, batch support, lossless badge. gifCompression.ts delegates to the real engine (keeps animation). PDF backend routed via same-origin Vite proxy (/convert -> 127.0.0.1:8000), vite host binding. Launchers: START-LOCALHOST.bat, START-SIMPLE.bat, TEST-PROJECT.bat."

if errorlevel 1 (
    echo [INFO] Nothing new to commit, or commit failed. Continuing...
)

rem ---- 5. Push ----
echo.
echo [5/5] Pushing to GitHub...
git push -u origin feature/gif-compressor

if errorlevel 1 (
    color 0E
    echo.
    echo =====================================================
    echo   Push failed. Common fixes:
    echo   1. Log in first:  git credential-manager github login
    echo      (or run: gh auth login  if GitHub CLI is installed)
    echo   2. Check the URL is correct and the repo exists.
    echo   3. If it says "rejected", run this script again.
    echo =====================================================
    pause
    exit /b 1
)

echo.
color 0A
echo =====================================================
echo   SUCCESS!
echo   Branch: feature/gif-compressor
echo   Pushed to: !REMOTE_URL!
echo =====================================================
echo.
echo Open GitHub and create a Pull Request from
echo feature/gif-compressor -> main
echo.
pause
endlocal