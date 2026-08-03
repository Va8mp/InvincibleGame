@echo off
setlocal
cd /d "%~dp0"

echo ================================
echo  Invincible Game Launcher
echo ================================
echo Folder: %cd%
echo.

if not exist "index.html" (
    echo ERROR: index.html was not found in this folder.
    echo Move this .bat file into the same folder as index.html and try again.
    echo.
    pause
    exit /b 1
)

if not exist "server.ps1" (
    echo ERROR: server.ps1 was not found in this folder.
    echo Make sure server.ps1 is sitting right next to this .bat file.
    echo.
    pause
    exit /b 1
)

echo Starting local server ^(PowerShell, no installs needed^) ...
start "Invincible Game Server" powershell -NoExit -ExecutionPolicy Bypass -File "%~dp0server.ps1"

echo Waiting a couple seconds for the server to come up...
timeout /t 2 /nobreak >nul

echo Opening the game in Microsoft Edge...
start "" msedge --new-tab "http://localhost:8000/index.html"

echo.
echo Keep the "Invincible Game Server" PowerShell window open while you play.
echo Close it when you're done.
echo.
pause
